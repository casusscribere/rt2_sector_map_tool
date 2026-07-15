'use strict';
/* The Patavian Reach — interactive sector chart, v0.2
   Vector lithograph base + full-coverage region tessellation.
   Data: window.REACH_MAP_DATA (data.js), window.PLANET_DESIGNATIONS (designations.js). */

const DATA = window.REACH_MAP_DATA;
const CORPUS = window.PLANET_DESIGNATIONS;
const corpusById = Object.fromEntries(CORPUS.map(d=>[d.id,d]));
const SVGNS='http://www.w3.org/2000/svg';
const W=DATA.canvas.width, H=DATA.canvas.height;
const TESS=DATA.tessellation;
const GRID=DATA.canvas.grid||{step:148,days_per_square:6,conditions:'under optimum conditions'};

/* ---------------- theme ---------------- */
const PAPER='#e7dcc3', PAPER_HI='#efe6cf', INK='#2e2218', INK_SOFT='#4f3d27', INK_FAINT='#8a7148';
const NEB_INK={crimson:'#9a4a3c',violet:'#7a4a7e',azure:'#46618e',jade:'#5d7a55',umber:'#7a6238'};
const STAB_PAL=DATA.render.stability_palette;
const STAB_LEVELS=DATA.render.stability_levels;

/* marker styles (legend conventions, inked for paper) */
const STYLE = {
  hive_world:{fill:'#2e86d4'}, shrine_world:{fill:'#d4a017',ring:true},
  agri_world:{fill:'#2f9e44'}, feudal_world:{fill:'#e0b424'}, feral_world:{fill:'#74b816'},
  paradise_world:{fill:'#d6336c'}, penal_world:{fill:'#d9480f',ring:true},
  mining_world:{fill:'#15aabf'}, forge_world:{fill:'#f1f1f1',dotFill:'#555'},
  cemetery_world:{fill:'#f1f1f1',glyph:'slash'}, frontier_world:{fill:'#e03131'},
  special:{fill:'#22c7c7',shape:'hex',sideDots:true}, forbidden_world:{fill:'#f1f1f1',glyph:'cross'},
  dead_world:{fill:'#3a3a3a'}, gas_giant:{fill:'#ff7b1c',glow:true},
  death_world:{fill:'#d33',arms:true}, war_world:{fill:'#d33',half:'#111'},
  unclassified:{fill:'#ffffff'}, abaoth_discovery:{fill:'#4a4a4a'},
};
const CAT_FALLBACK={imperial_settled:'#c9a05a',imperial_religious:'#d4a017',imperial_military:'#a33',
 imperial_administrative:'#c9a05a',imperial_penal:'#d9480f',astartes:'#888',necron:'#3c5',aeldari:'#7cc',
 chaos:'#a3c',tyranid:'#a4a',ork:'#682',tau:'#9ab',xenos_other:'#b8a',environmental:'#789',stellar_phenomena:'#967'};
const styleFor=id=>STYLE[id]||{fill:(corpusById[id]&&CAT_FALLBACK[corpusById[id].category])||'#bbb'};
function desName(id){
  const local=(DATA.local_designations||[]).find(d=>d.id===id);
  return local?local.name:(corpusById[id]?corpusById[id].name:id);
}

/* ---------------- state ---------------- */
let mode='select';                 // select | add | route | split | merge
let sel=null;                      // {type:'planet'|'route'|'region', id}
let pendingRoute=null;             // {from, waypoints[]}
let pendingCut=null;               // {startEdge:[a,b], startPt:[x,y], mids:[[x,y]...]}
let pendingNeb=null;               // [[x,y],...] while drawing a new extrasolar feature
let pendingTerr=null;              // [[x,y],...] while drawing a new political territory
let undoStack=[], dirty=false;
let containment={};                // planetId -> faceId
const view={x:0,y:0,k:0.25};

const $=s=>document.querySelector(s);
const vp=$('#viewport'), world=$('#world');

/* ---------------- geometry ---------------- */
const V=i=>TESS.vertices[i];
function polyArea(loop){let s=0;for(let i=0;i<loop.length;i++){const[a,b]=[V(loop[i]),V(loop[(i+1)%loop.length])];s+=a[0]*b[1]-b[0]*a[1];}return Math.abs(s)/2;}
function segInt(p1,p2,p3,p4){ // proper segment intersection (excludes shared endpoints)
  const d=(a,b,c)=>(c[0]-a[0])*(b[1]-a[1])-(b[0]-a[0])*(c[1]-a[1]);
  const d1=d(p3,p4,p1),d2=d(p3,p4,p2),d3=d(p1,p2,p3),d4=d(p1,p2,p4);
  return ((d1>0&&d2<0)||(d1<0&&d2>0))&&((d3>0&&d4<0)||(d3<0&&d4>0));
}
function isSimple(loop){
  const n=loop.length; if(n<3)return false;
  for(let i=0;i<n;i++)for(let j=i+1;j<n;j++){
    if(i===j||Math.abs(i-j)===1||(i===0&&j===n-1))continue;
    if(segInt(V(loop[i]),V(loop[(i+1)%n]),V(loop[j]),V(loop[(j+1)%n])))return false;
  }
  return polyArea(loop)>1;
}
function pointInLoop(x,y,loop){
  let inside=false;
  for(let i=0,j=loop.length-1;i<loop.length;j=i++){
    const[xi,yi]=V(loop[i]),[xj,yj]=V(loop[j]);
    if(((yi>y)!==(yj>y))&&(x<(xj-xi)*(y-yi)/(yj-yi)+xi))inside=!inside;
  }
  return inside;
}
function projectToSeg(p,a,b){
  const dx=b[0]-a[0],dy=b[1]-a[1],L2=dx*dx+dy*dy;
  const t=L2?Math.max(0.02,Math.min(0.98,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/L2)):0;
  const q=[a[0]+t*dx,a[1]+t*dy];
  return {pt:q,d:Math.hypot(p[0]-q[0],p[1]-q[1]),t};
}
function nearestEdgeOfFace(face,p,maxd){
  let best=null;
  const vs=face.vertices;
  for(let i=0;i<vs.length;i++){
    const a=vs[i],b=vs[(i+1)%vs.length];
    const pr=projectToSeg(p,V(a),V(b));
    if(pr.d<=maxd&&(!best||pr.d<best.d))best={a,b,pt:pr.pt,d:pr.d};
  }
  return best;
}
function faceCentroid(f){let x=0,y=0;for(const vi of f.vertices){x+=V(vi)[0];y+=V(vi)[1];}return [x/f.vertices.length,y/f.vertices.length];}

/* raw point-array polygon helpers (nebulae) */
function centroidPts(pts){let x=0,y=0;for(const p of pts){x+=p[0];y+=p[1];}return[x/pts.length,y/pts.length];}
function isSimplePts(pts){
  const n=pts.length;if(n<3)return false;
  for(let i=0;i<n;i++)for(let j=i+1;j<n;j++){
    if(Math.abs(i-j)===1||(i===0&&j===n-1))continue;
    if(segInt(pts[i],pts[(i+1)%n],pts[j],pts[(j+1)%n]))return false;
  }
  return true;
}
function nearestEdgeOfPts(pts,p,maxd){
  let best=null;
  for(let i=0;i<pts.length;i++){
    const pr=projectToSeg(p,pts[i],pts[(i+1)%pts.length]);
    if(pr.d<=maxd&&(!best||pr.d<best.d))best={i,pt:pr.pt,d:pr.d};
  }
  return best;
}

/* ---------------- curves (v0.3) ----------------
   Region curvature is per-EDGE (shared by both faces); routes use Catmull-Rom;
   features use per-point smooth flags. One flattening routine backs everything
   that interrogates geometry so checks always match what is drawn. */
const CURVE_SAMPLES=16;
const lerp2=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];
function quadAt(a,cp,b,t){const u=1-t;
  return[u*u*a[0]+2*u*t*cp[0]+t*t*b[0],u*u*a[1]+2*u*t*cp[1]+t*t*b[1]];}
function cubicAt(a,c1,c2,b,t){const u=1-t;
  return[u*u*u*a[0]+3*u*u*t*c1[0]+3*u*t*t*c2[0]+t*t*t*b[0],
         u*u*u*a[1]+3*u*u*t*c1[1]+3*u*t*t*c2[1]+t*t*t*b[1]];}
const edgeKey=(a,b)=>a<b?a+'-'+b:b+'-'+a;
function edgeCurves(){return TESS.edge_curves=TESS.edge_curves||{};}
const edgeCurve=(a,b)=>edgeCurves()[edgeKey(a,b)];
function facePathD(f){
  const vs=f.vertices;let d='M '+V(vs[0]).join(' ');
  for(let i=0;i<vs.length;i++){
    const u=vs[i],v=vs[(i+1)%vs.length],c=edgeCurve(u,v);
    d+=c?` Q ${c.cp[0]} ${c.cp[1]} ${V(v)[0]} ${V(v)[1]}`:` L ${V(v).join(' ')}`;
  }
  return d+' Z';
}
function flattenLoop(f){
  const vs=f.vertices,out=[];
  for(let i=0;i<vs.length;i++){
    const u=vs[i],v=vs[(i+1)%vs.length],c=edgeCurve(u,v);
    out.push(V(u).slice());
    if(c)for(let k=1;k<CURVE_SAMPLES;k++)out.push(quadAt(V(u),c.cp,V(v),k/CURVE_SAMPLES));
  }
  return out;
}
function pointInPts(x,y,pts){
  let inside=false;
  for(let i=0,j=pts.length-1;i<pts.length;j=i++){
    const[xi,yi]=pts[i],[xj,yj]=pts[j];
    if(((yi>y)!==(yj>y))&&(x<(xj-xi)*(y-yi)/(yj-yi)+xi))inside=!inside;
  }
  return inside;
}
function polyAreaPts(pts){let s=0;for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length];s+=a[0]*b[1]-b[0]*a[1];}return Math.abs(s)/2;}
function snapFrameVertices(tol=5){ // heal vertices that drifted off the canvas border
  let n=0;
  for(const v of TESS.vertices){
    if(v[0]!==0&&Math.abs(v[0])<=tol){v[0]=0;n++;}
    else if(v[0]!==W&&Math.abs(v[0]-W)<=tol){v[0]=W;n++;}
    if(v[1]!==0&&Math.abs(v[1])<=tol){v[1]=0;n++;}
    else if(v[1]!==H&&Math.abs(v[1]-H)<=tol){v[1]=H;n++;}
  }
  return n;
}
function pruneEdgeCurves(){
  const ec=edgeCurves();
  for(const k of Object.keys(ec)){
    const[a,b]=k.split('-').map(Number);
    if(!facesWithEdge(a,b).length)delete ec[k];
  }
}
/* open Catmull-Rom spline through the given points (clamped ends) */
function crPathD(pts){
  if(pts.length<3)return 'M '+pts.map(p=>p.join(' ')).join(' L ');
  let d='M '+pts[0].join(' ');
  for(let i=0;i<pts.length-1;i++){
    const p0=pts[Math.max(0,i-1)],p1=pts[i],p2=pts[i+1],p3=pts[Math.min(pts.length-1,i+2)];
    const c1=[p1[0]+(p2[0]-p0[0])/6,p1[1]+(p2[1]-p0[1])/6];
    const c2=[p2[0]-(p3[0]-p1[0])/6,p2[1]-(p3[1]-p1[1])/6];
    d+=` C ${c1[0]} ${c1[1]} ${c2[0]} ${c2[1]} ${p2[0]} ${p2[1]}`;
  }
  return d;
}
/* feature outline: closed path honouring per-point smooth flags */
function nbTangent(nb,i){
  if(!nb.pt_smooth||!nb.pt_smooth[i])return[0,0];
  const n=nb.pts.length,p=nb.pts[(i-1+n)%n],q=nb.pts[(i+1)%n];
  return[(q[0]-p[0])/6,(q[1]-p[1])/6];
}
function nbPathD(nb){
  const pts=nb.pts,n=pts.length;
  let d='M '+pts[0].join(' ');
  for(let i=0;i<n;i++){
    const j=(i+1)%n,t1=nbTangent(nb,i),t2=nbTangent(nb,j);
    if(!t1[0]&&!t1[1]&&!t2[0]&&!t2[1])d+=` L ${pts[j][0]} ${pts[j][1]}`;
    else d+=` C ${pts[i][0]+t1[0]} ${pts[i][1]+t1[1]} ${pts[j][0]-t2[0]} ${pts[j][1]-t2[1]} ${pts[j][0]} ${pts[j][1]}`;
  }
  return d+' Z';
}
function flattenNb(nb){
  const pts=nb.pts,n=pts.length,out=[];
  for(let i=0;i<n;i++){
    const j=(i+1)%n,t1=nbTangent(nb,i),t2=nbTangent(nb,j);
    out.push(pts[i].slice());
    if(t1[0]||t1[1]||t2[0]||t2[1]){
      const c1=[pts[i][0]+t1[0],pts[i][1]+t1[1]],c2=[pts[j][0]-t2[0],pts[j][1]-t2[1]];
      for(let k=1;k<CURVE_SAMPLES;k++)out.push(cubicAt(pts[i],c1,c2,pts[j],k/CURVE_SAMPLES));
    }
  }
  return out;
}

/* ---------------- tessellation invariant ---------------- */
function validateTess(){
  const ec={}, onFrame=(a,b)=>{const[ax,ay]=V(a),[bx,by]=V(b);
    return (ax===bx&&(ax===0||ax===W))||(ay===by&&(ay===0||ay===H));};
  for(const f of TESS.faces){
    if(!isSimplePts(flattenLoop(f)))return `region "${f.name}" boundary self-intersects`;
    const vs=f.vertices;
    for(let i=0;i<vs.length;i++){
      const k=[vs[i],vs[(i+1)%vs.length]].sort((a,b)=>a-b).join('-');
      ec[k]=(ec[k]||0)+1;
    }
  }
  for(const k in ec){
    if(ec[k]===2)continue;
    const [a,b]=k.split('-').map(Number);
    if(ec[k]===1&&onFrame(a,b))continue;
    return `edge ${k} used ${ec[k]}× (must be 2, or 1 on the frame)`;
  }
  const ta=TESS.faces.reduce((s,f)=>s+polyAreaPts(flattenLoop(f)),0);
  if(Math.abs(ta-W*H)>W*H*0.001)return `coverage gap: faces sum ${Math.round(ta)} vs canvas ${W*H}`;
  return null;
}

/* ---------------- tessellation ops ---------------- */
function facesWithEdge(a,b){
  return TESS.faces.filter(f=>{const vs=f.vertices;
    return vs.some((v,i)=>{const w=vs[(i+1)%vs.length];return(v===a&&w===b)||(v===b&&w===a);});});
}
function insertVertexOnEdge(a,b,pt){
  const c=edgeCurve(a,b);
  let np=pt,t=0.5;
  if(c){ // place the new vertex ON the curve, at the chord-projection parameter
    t=projectToSeg(pt,V(a),V(b)).t;
    np=quadAt(V(a),c.cp,V(b),t);
  }
  np=np.slice();
  // a vertex inserted on a frame edge must land exactly ON the frame
  if(V(a)[0]===V(b)[0]&&(V(a)[0]===0||V(a)[0]===W))np[0]=V(a)[0];
  if(V(a)[1]===V(b)[1]&&(V(a)[1]===0||V(a)[1]===H))np[1]=V(a)[1];
  TESS.vertices.push([Math.round(np[0]*10)/10,Math.round(np[1]*10)/10]);
  const ni=TESS.vertices.length-1;
  for(const f of facesWithEdge(a,b)){
    const vs=f.vertices;
    for(let i=0;i<vs.length;i++){
      const w=vs[(i+1)%vs.length];
      if((vs[i]===a&&w===b)||(vs[i]===b&&w===a)){vs.splice(i+1,0,ni);break;}
    }
  }
  if(c){ // de Casteljau split preserves the curve across the new vertex
    const ec=edgeCurves();
    delete ec[edgeKey(a,b)];
    ec[edgeKey(a,ni)]={cp:lerp2(V(a),c.cp,t)};
    ec[edgeKey(ni,b)]={cp:lerp2(c.cp,V(b),t)};
  }
  return ni;
}
function tryDeleteVertex(vi){
  snapFrameVertices();
  const fs=TESS.faces.filter(f=>f.vertices.includes(vi));
  if(fs.some(f=>f.vertices.length<=3))return 'a region would drop below 3 vertices';
  const backup=fs.map(f=>[f,f.vertices.slice()]);
  const ec=edgeCurves(),removed={};
  for(const k of Object.keys(ec))if(k.split('-').map(Number).includes(vi)){removed[k]=ec[k];delete ec[k];}
  for(const f of fs)f.vertices=f.vertices.filter(v=>v!==vi);
  const err=validateTess();
  if(err){for(const[f,vs]of backup)f.vertices=vs;Object.assign(ec,removed);return err;}
  return null;
}
function splitFace(face,startEdge,startPt,mids,endEdge,endPt){
  if(startEdge.a===endEdge.a&&startEdge.b===endEdge.b)return 'cut must start and end on different boundary edges';
  snapFrameVertices(); // heal off-border drift before validating, not after
  const snap=JSON.stringify(TESS);
  const v1=insertVertexOnEdge(startEdge.a,startEdge.b,startPt);
  let e2=endEdge;
  // re-find the end edge in case the start insertion split it (same original indices)
  const ne=nearestEdgeOfFace(face,endPt,1e9);
  const v2=insertVertexOnEdge(ne.a,ne.b,endPt);
  const midIds=mids.map(p=>{TESS.vertices.push([Math.round(p[0]*10)/10,Math.round(p[1]*10)/10]);return TESS.vertices.length-1;});
  const vs=face.vertices, i1=vs.indexOf(v1), i2=vs.indexOf(v2);
  if(i1<0||i2<0){Object.assign(TESS,JSON.parse(snap));return 'could not anchor the cut';}
  const loopA=[],loopB=[];
  for(let i=i1;;i=(i+1)%vs.length){loopA.push(vs[i]);if(i===i2)break;}
  for(let i=i2;;i=(i+1)%vs.length){loopB.push(vs[i]);if(i===i1)break;}
  const newA=loopA.concat(midIds.slice().reverse());
  const newB=loopB.concat(midIds);
  const nid='region_'+Date.now().toString(36);
  const nf={id:nid,name:'Unnamed Region',description:'',warp_stability:face.warp_stability,
            tint:face.tint,tint_enabled:!!face.tint_enabled,label:{x:0,y:0},vertices:newB};
  face.vertices=newA;
  TESS.faces.push(nf);
  face.label={x:faceCentroid(face)[0],y:faceCentroid(face)[1]};
  nf.label={x:faceCentroid(nf)[0],y:faceCentroid(nf)[1]};
  const err=validateTess();
  if(err){Object.assign(TESS,JSON.parse(snap));return err+' — cut abandoned';}
  return null;
}
function mergeFaces(loser,winner){
  snapFrameVertices(); // heal off-border drift before validating, not after
  // find shared chain along loser's loop
  const wEdges=new Set();
  const wvs=winner.vertices;
  for(let i=0;i<wvs.length;i++)wEdges.add([wvs[i],wvs[(i+1)%wvs.length]].sort((a,b)=>a-b).join('-'));
  const lvs=loser.vertices,n=lvs.length;
  const sharedIdx=[];
  for(let i=0;i<n;i++){
    const k=[lvs[i],lvs[(i+1)%n]].sort((a,b)=>a-b).join('-');
    if(wEdges.has(k))sharedIdx.push(i);
  }
  if(!sharedIdx.length)return 'regions are not adjacent';
  // contiguity: shared edge indices must form one circular run
  const inSet=new Set(sharedIdx);
  let runs=0;
  for(const i of sharedIdx)if(!inSet.has((i-1+n)%n))runs++;
  if(runs!==1)return 'regions touch along more than one stretch of boundary — merge unsupported';
  let start=sharedIdx.find(i=>!inSet.has((i-1+n)%n));
  const chain=[lvs[start]];
  for(let i=start;inSet.has(i);i=(i+1)%n)chain.push(lvs[(i+1)%n]);
  const s0=chain[0],sk=chain[chain.length-1];
  // walk loser's loop from sk back to s0 (the non-shared part)
  const keep=[];
  for(let i=lvs.indexOf(sk);;i=(i+1)%n){keep.push(lvs[i]);if(lvs[(i+1)%n]===s0)break;}
  keep.push(s0);
  // walk winner's loop from s0 to sk avoiding the chain
  const m=wvs.length,i0=wvs.indexOf(s0);
  const nextV=wvs[(i0+1)%m], dir=(chain.length>1&&nextV===chain[1])?-1:1;
  const walk=[];
  for(let i=i0;;i=(i+dir+m)%m){walk.push(wvs[i]);if(wvs[i]===sk&&walk.length>1)break;if(walk.length>m+1)return 'merge walk failed';}
  const snapFaces=TESS.faces.slice(), snapWin=winner.vertices.slice();
  // merged loop = winner walk (s0..sk) + loser keep-path interior (sk..s0 exclusive of endpoints)
  winner.vertices=walk.concat(keep.slice(1,-1));
  TESS.faces=TESS.faces.filter(f=>f!==loser);
  const err=validateTess();
  if(err){TESS.faces=snapFaces;winner.vertices=snapWin;return err+' — merge abandoned';}
  pruneEdgeCurves(); // curves on the removed shared chain no longer reference live edges
  return null;
}
function compactVertices(data){
  const used=new Set();
  data.tessellation.faces.forEach(f=>f.vertices.forEach(v=>used.add(v)));
  const order=[...used].sort((a,b)=>a-b), remap={};
  order.forEach((v,i)=>remap[v]=i);
  data.tessellation.vertices=order.map(i=>data.tessellation.vertices[i]);
  data.tessellation.faces.forEach(f=>f.vertices=f.vertices.map(v=>remap[v]));
  const ec=data.tessellation.edge_curves||{},nec={};
  for(const k of Object.keys(ec)){
    const[a,b]=k.split('-').map(Number);
    if(remap[a]===undefined||remap[b]===undefined)continue;
    const na=remap[a],nb=remap[b];
    nec[na<nb?na+'-'+nb:nb+'-'+na]=ec[k];
  }
  data.tessellation.edge_curves=nec;
}

/* ---------------- containment ---------------- */
function recomputeContainment(){
  containment={};
  const flat=TESS.faces.map(f=>({f,pts:flattenLoop(f)}));
  for(const p of DATA.planets){
    let hit=flat.find(e=>pointInPts(p.x,p.y,e.pts));
    if(!hit){ // numeric edge case: nearest centroid
      let bd=1e18;
      for(const e of flat){const c=faceCentroid(e.f);const d=(c[0]-p.x)**2+(c[1]-p.y)**2;if(d<bd){bd=d;hit=e;}}
    }
    containment[p.id]=hit?hit.f.id:null;
  }
}
const planetsInFace=fid=>DATA.planets.filter(p=>containment[p.id]===fid);
function fleetsInFace(fid){
  const f=TESS.faces.find(x=>x.id===fid);if(!f)return[];
  const pts=flattenLoop(f);
  return fleets().filter(fl=>pointInPts(fl.x,fl.y,pts));
}
const FLEET_ORBIT_RADIUS=60; // map units — a pin this close to a planet counts as "present"
const fleetsNearPlanet=p=>fleets().filter(fl=>Math.hypot(fl.x-p.x,fl.y-p.y)<=FLEET_ORBIT_RADIUS);

/* ---------------- svg scaffolding ---------------- */
function el(tag,attrs,parent){const n=document.createElementNS(SVGNS,tag);for(const k in attrs)n.setAttribute(k,attrs[k]);if(parent)parent.appendChild(n);return n;}
function txt(node,s){node.textContent=s;return node;}

const svg=el('svg',{viewBox:`0 0 ${W} ${H}`,width:W,height:H});
world.appendChild(svg);
const defs=el('defs',{},svg);

/* paper grain */
const fGrain=el('filter',{id:'grain',x:'0%',y:'0%',width:'100%',height:'100%'},defs);
el('feTurbulence',{type:'fractalNoise',baseFrequency:'0.9',numOctaves:'2',result:'n'},fGrain);
el('feColorMatrix',{in:'n',type:'matrix',values:'0 0 0 0 0.30  0 0 0 0 0.24  0 0 0 0 0.16  0 0 0 0.055 0'},fGrain);
/* hand-tint wash: pull fill back from the line and soften */
const fWash=el('filter',{id:'wash',x:'-3%',y:'-3%',width:'106%',height:'106%'},defs);
el('feMorphology',{operator:'erode',radius:'7',in:'SourceGraphic',result:'e'},fWash);
el('feGaussianBlur',{in:'e',stdDeviation:'6'},fWash);
/* stipple patterns per nebula class (three rotations for organic feel) */
Object.entries(NEB_INK).forEach(([cls,ink],ci)=>{
  const p=el('pattern',{id:'stip-'+cls,width:13,height:13,patternUnits:'userSpaceOnUse',
    patternTransform:`rotate(${ci*17})`},defs);
  [[2,3,1.3],[8,7,1.0],[5,11,1.5],[11,1,0.9],[12,10,1.2]].forEach(([x,y,r])=>el('circle',{cx:x,cy:y,r,fill:ink,'fill-opacity':0.5},p));
});
/* per-nebula fill patterns live here, rebuilt each render */
const gNebDefs=el('g',{},defs);
/* vignette */
const grad=el('radialGradient',{id:'vig',cx:'50%',cy:'50%',r:'75%'},defs);
el('stop',{offset:'62%','stop-color':'#000','stop-opacity':0},grad);
el('stop',{offset:'100%','stop-color':'#3a2c18','stop-opacity':0.18},grad);

/* layer stack, bottom → top:
   paper · extended gridlines · graticule texture · region hit-paths (invisible) ·
   nebulae/features · warp routes · planets · political overlay ·
   region tints · region borders+names · stability overlay ·
   pending/handles · furniture (frame, ticks, border text, legends) */
const gPaper=el('g',{'pointer-events':'none'},svg),
      gGridX=el('g',{'pointer-events':'none'},svg),
      gHit=el('g',{},svg),
      gNeb=el('g',{'pointer-events':'none'},svg),
      gNebNames=el('g',{'pointer-events':'none'},svg),      // name groups sit beside their layer
      gRoutes=el('g',{},svg),
      gRouteNames=el('g',{'pointer-events':'none'},svg),    // but are exempt from the opacity sliders
      gPlanets=el('g',{},svg),
      gPlanetNames=el('g',{'pointer-events':'none'},svg),
      gPol=el('g',{'pointer-events':'none'},svg),
      gFleets=el('g',{},svg),                              // fleet pins ride above the political overlay
      gFleetNames=el('g',{'pointer-events':'none'},svg),
      gTintWash=el('g',{'pointer-events':'none'},svg),
      gFaces=el('g',{'pointer-events':'none'},svg),
      gFaceNames=el('g',{'pointer-events':'none'},svg), // names sit with borders but ignore the Regions opacity slider
      gStabWash=el('g',{'pointer-events':'none'},svg),
      gEvents=el('g',{},svg),                              // event markers ride above the overlays
      gEventNames=el('g',{'pointer-events':'none'},svg),
      gGhost=el('g',{'pointer-events':'none'},svg),        // diff view: elements removed since the compared date
      gPendingG=el('g',{},svg),
      gHandles=el('g',{},svg),
      gFurniture=el('g',{class:'chart-furniture'},svg);

/* static paper + furniture (drawn once) */
function buildStatic(){
  el('rect',{width:W,height:H,fill:PAPER},gPaper);
  el('rect',{width:W,height:H,filter:'url(#grain)'},gPaper);
  el('rect',{width:W,height:H,fill:'url(#vig)'},gFurniture);
  /* frame: double rule + ticks */
  el('rect',{x:12,y:12,width:W-24,height:H-24,fill:'none',stroke:INK_SOFT,'stroke-width':7},gFurniture);
  el('rect',{x:30,y:30,width:W-60,height:H-60,fill:'none',stroke:INK_SOFT,'stroke-width':1.6},gFurniture);
  for(let x=30,i=0;x<W-30;x+=GRID.step,i++){el('line',{x1:x,y1:12,x2:x,y2:30,stroke:INK_SOFT,'stroke-width':i%2===0?2.4:1},gFurniture);
    el('line',{x1:x,y1:H-12,x2:x,y2:H-30,stroke:INK_SOFT,'stroke-width':1},gFurniture);}
  for(let y=30,i=0;y<H-30;y+=GRID.step,i++){el('line',{x1:12,y1:y,x2:30,y2:y,stroke:INK_SOFT,'stroke-width':1},gFurniture);
    el('line',{x1:W-12,y1:y,x2:W-30,y2:y,stroke:INK_SOFT,'stroke-width':1},gFurniture);}
  /* orientation labels */
  const ol=DATA.canvas.orientation_labels||{};
  const olStyle={'font-family':'Cinzel,serif','font-size':40,fill:INK_FAINT,'letter-spacing':'.45em','text-anchor':'middle'};
  const borderLabel=(str,tx,ty,rot)=>{
    str=(str||'').toUpperCase();if(!str)return;
    const g=el('g',{transform:`translate(${tx},${ty})${rot?` rotate(${rot})`:''}`},gFurniture);
    txt(el('text',{...olStyle,x:0,y:0},g),str);
  };
  borderLabel(ol.top,W/2,78);
  borderLabel(ol.bottom,W/2,H-44);
  borderLabel(ol.left,72,H/2,-90);
  borderLabel(ol.right,W-58,H/2,90);
  /* title cartouche */
  const cx=W-560,cy=64;
  const cart=el('g',{},gFurniture);
  el('rect',{x:cx,y:cy,width:490,height:178,fill:PAPER_HI,stroke:INK_SOFT,'stroke-width':3},cart);
  el('rect',{x:cx+9,y:cy+9,width:472,height:160,fill:'none',stroke:INK_SOFT,'stroke-width':1},cart);
  txt(el('text',{x:cx+245,y:cy+62,'font-family':'Cinzel,serif','font-size':42,fill:INK,'letter-spacing':'.18em','text-anchor':'middle'},cart),'THE PATAVIAN');
  txt(el('text',{x:cx+245,y:cy+112,'font-family':'Cinzel,serif','font-size':42,fill:INK,'letter-spacing':'.18em','text-anchor':'middle'},cart),'REACH');
  txt(el('text',{id:'cart-date',x:cx+245,y:cy+150,'font-family':'EB Garamond,serif','font-style':'italic','font-size':19,fill:INK_FAINT,'text-anchor':'middle'},cart),'drawn from voidfarers’ rutters');
  /* stability legend (toggled) */
  const leg=el('g',{id:'stab-legend',visibility:'hidden'},gFurniture);
  const lx=W-560,ly=270;
  el('rect',{x:lx,y:ly,width:490,height:46+STAB_LEVELS.length*44,fill:PAPER_HI,stroke:INK_SOFT,'stroke-width':2},leg);
  txt(el('text',{x:lx+245,y:ly+34,'font-family':'Cinzel,serif','font-size':22,fill:INK,'letter-spacing':'.14em','text-anchor':'middle'},leg),'WARP ROUTE STABILITY');
  STAB_LEVELS.forEach((s,i)=>{
    el('rect',{x:lx+28,y:ly+50+i*44,width:64,height:28,fill:STAB_PAL[s],stroke:INK_SOFT,'stroke-width':1},leg);
    txt(el('text',{x:lx+110,y:ly+71+i*44,'font-family':'EB Garamond,serif','font-size':22,fill:INK},leg),s[0].toUpperCase()+s.slice(1));
  });
  gLegend=el('g',{id:'chart-legend'},gFurniture);
}

/* dynamic chart legend — planetary classes in play + route styles; Select mode only */
let gLegend=null;
const ROUTE_DASH_NAMES={'':'Stable route','10 8':'Standard route','2 7':'Treacherous route','22 10':'Theoretical route'};
function renderLegend(){
  if(!gLegend)return;
  gLegend.innerHTML='';
  if(mode!=='select')return;
  const desIds=$('#ly-labels').checked
    ?[...new Set(DATA.planets.map(p=>p.designation))]
      .map(id=>({id,name:desName(id)})).sort((a,b)=>a.name.localeCompare(b.name))
    :[];
  const regionRows=$('#ly-regions').checked
    ?TESS.faces.filter(f=>f.name&&f.tint_enabled).slice().sort((a,b)=>a.name.localeCompare(b.name))
    :[];
  const routeRows=[];
  if($('#ly-routes').checked){
    const seen=new Set();
    for(const r of DATA.routes){
      const eff=routeStroke(r);
      const key=(r.style.dash||'')+'|'+eff;
      if(seen.has(key))continue;seen.add(key);
      routeRows.push({name:ROUTE_DASH_NAMES[r.style.dash||'']||'Route',style:{...r.style,stroke:eff}});
    }
    for(const r of DATA.routes)if(r.label)routeRows.push({name:r.label,style:{...r.style,stroke:routeStroke(r)},labeled:true});
  }
  // named extrasolar features, grouped by subtype — shown only while the layer is visible
  const featGroups=[];
  if($('#ly-nebulae').checked){
    for(const st of Object.keys(FEATURE_SUBTYPES)){
      const named=(DATA.nebulae||[]).filter(nb=>nb.name&&(nb.subtype||'nebula')===st)
        .sort((a,b)=>a.name.localeCompare(b.name));
      if(named.length)featGroups.push({head:FEATURE_SUBTYPE_PLURALS[st]||st.toUpperCase(),named});
    }
  }
  // political entities with at least one owned planet — shown only while the overlay is on and planets visible
  const polRows=[];
  if($('#ly-pol').checked&&$('#ly-labels').checked){
    for(const en of polEntities()){
      const n=DATA.planets.filter(p=>p.owner===en.id).length;
      if(n)polRows.push({en,n});
    }
    polRows.sort((a,b)=>a.en.name.localeCompare(b.en.name));
  }
  // named political territories — shown only while the Political overlay is on; unnamed excluded
  const terrRows=$('#ly-pol').checked
    ?territories().filter(t=>t.name).slice().sort((a,b)=>a.name.localeCompare(b.name))
    :[];
  const showScale=$('#ly-grid').checked;
  const rowH=44,heady=46,routeHead=routeRows.length?40:0;
  const featH=featGroups.reduce((s,g)=>s+40+g.named.length*rowH,0);
  const polH=polRows.length?40+polRows.length*rowH:0;
  const terrH=terrRows.length?40+terrRows.length*rowH:0;
  const regH=regionRows.length?40+regionRows.length*rowH:0;
  const scaleH=showScale?78:0;
  if(!desIds.length&&!routeRows.length&&!featGroups.length&&!polRows.length&&!terrRows.length&&!regionRows.length&&!showScale)return;
  const h=heady+desIds.length*rowH+regH+routeHead+routeRows.length*rowH+featH+polH+terrH+scaleH+16;
  const lx=W-560, ly=($('#ly-stab').checked&&regionsVisible()?270+46+STAB_LEVELS.length*44+18:270);
  el('rect',{x:lx,y:ly,width:490,height:h,fill:PAPER_HI,stroke:INK_SOFT,'stroke-width':2},gLegend);
  txt(el('text',{x:lx+245,y:ly+34,'font-family':'Cinzel,serif','font-size':22,fill:INK,'letter-spacing':'.14em','text-anchor':'middle'},gLegend),'LEGEND');
  let y=ly+heady;
  for(const d of desIds){
    const g=el('g',{transform:`translate(${lx+58},${y+rowH/2-2}) scale(0.72)`},gLegend);
    drawMarkerGlyph(g,d.id,$('#ly-pol').checked); // legend glyphs match the map's decolored state
    txt(el('text',{x:lx+110,y:y+rowH/2+6,'font-family':'EB Garamond,serif','font-size':22,fill:INK},gLegend),d.name);
    y+=rowH;
  }
  if(regionRows.length){
    txt(el('text',{x:lx+245,y:y+26,'font-family':'Cinzel,serif','font-size':18,fill:INK,'letter-spacing':'.14em','text-anchor':'middle'},gLegend),'REGIONS');
    y+=40;
    for(const f of regionRows){
      el('rect',{x:lx+28,y:y+rowH/2-14,width:64,height:28,fill:faceFill(f)||PAPER_HI,
        'fill-opacity':faceFill(f)?0.6:1,stroke:INK_SOFT,'stroke-width':1},gLegend);
      txt(el('text',{x:lx+110,y:y+rowH/2+6,'font-family':'EB Garamond,serif','font-size':22,fill:INK},gLegend),f.name);
      y+=rowH;
    }
  }
  if(routeRows.length){
    txt(el('text',{x:lx+245,y:y+26,'font-family':'Cinzel,serif','font-size':18,fill:INK,'letter-spacing':'.14em','text-anchor':'middle'},gLegend),'WARP ROUTES');
    y+=routeHead;
    for(const r of routeRows){
      el('line',{x1:lx+26,y1:y+rowH/2,x2:lx+92,y2:y+rowH/2,stroke:r.style.stroke,
        'stroke-width':r.style.width,'stroke-dasharray':r.style.dash},gLegend);
      const t=el('text',{x:lx+110,y:y+rowH/2+6,'font-family':'EB Garamond,serif','font-size':22,fill:INK},gLegend);
      if(r.labeled)t.setAttribute('font-style','italic');
      txt(t,r.name);
      y+=rowH;
    }
  }
  for(const grp of featGroups){
    txt(el('text',{x:lx+245,y:y+26,'font-family':'Cinzel,serif','font-size':18,fill:INK,'letter-spacing':'.14em','text-anchor':'middle'},gLegend),grp.head);
    y+=40;
    for(const nb of grp.named){
      const b=nb.style.border;
      el('rect',{x:lx+28,y:y+rowH/2-14,width:64,height:28,
        fill:nb.style.fill!=='none'?`url(#nbpat-${nb.id})`:(nb.style.fill_visible?nb.style.color:PAPER_HI),
        'fill-opacity':nb.style.fill==='none'&&nb.style.fill_visible?0.3:1,
        stroke:nb.style.color,'stroke-width':Math.max(1,b.width),
        'stroke-dasharray':NEB_DASH[b.dash]??b.dash},gLegend);
      const t=el('text',{x:lx+110,y:y+rowH/2+6,'font-family':'EB Garamond,serif','font-style':'italic','font-size':22,fill:INK},gLegend);
      txt(t,nb.name);
      y+=rowH;
    }
  }
  if(polRows.length){
    txt(el('text',{x:lx+245,y:y+26,'font-family':'Cinzel,serif','font-size':18,fill:INK,'letter-spacing':'.14em','text-anchor':'middle'},gLegend),'POLITICAL ENTITIES');
    y+=40;
    for(const {en,n} of polRows){
      el('circle',{cx:lx+60,cy:y+rowH/2,r:13,fill:PAPER_HI,stroke:en.color,'stroke-width':5},gLegend);
      txt(el('text',{x:lx+110,y:y+rowH/2+6,'font-family':'EB Garamond,serif','font-size':22,fill:INK},gLegend),`${en.name} (${n})`);
      y+=rowH;
    }
  }
  if(terrRows.length){
    txt(el('text',{x:lx+245,y:y+26,'font-family':'Cinzel,serif','font-size':18,fill:INK,'letter-spacing':'.14em','text-anchor':'middle'},gLegend),'TERRITORIES');
    y+=40;
    for(const t of terrRows){
      const en=t.owner?entityById(t.owner):null;
      const col=en?en.color:INK_SOFT;
      el('rect',{x:lx+28,y:y+rowH/2-14,width:64,height:28,fill:col,'fill-opacity':0.25,
        stroke:col,'stroke-width':2,'stroke-dasharray':'6 5'},gLegend);
      txt(el('text',{x:lx+110,y:y+rowH/2+6,'font-family':'EB Garamond,serif','font-size':22,fill:INK},gLegend),
        t.name+(en?' — '+en.name:''));
      y+=rowH;
    }
  }
  if(showScale){ // grid scale note, after the chart whose grid this extends
    const sq=el('g',{},gLegend);
    el('rect',{x:lx+30,y:y+16,width:46,height:46,fill:'none',stroke:INK_SOFT,'stroke-width':1.4},sq);
    el('line',{x1:lx+30,y1:y+39,x2:lx+76,y2:y+39,stroke:INK_SOFT,'stroke-width':0.6,'stroke-opacity':0.6},sq);
    el('line',{x1:lx+53,y1:y+16,x2:lx+53,y2:y+62,stroke:INK_SOFT,'stroke-width':0.6,'stroke-opacity':0.6},sq);
    txt(el('text',{x:lx+96,y:y+38,'font-family':'EB Garamond,serif','font-size':21,fill:INK},gLegend),
      `One grid square ≈ ${GRID.days_per_square} days warp travel`);
    txt(el('text',{x:lx+96,y:y+62,'font-family':'EB Garamond,serif','font-style':'italic','font-size':17,fill:INK_FAINT},gLegend),
      `(${GRID.conditions})`);
    y+=78;
  }
}

/* ---------------- dynamic rendering ---------------- */
/* layer visibility — geometry-editing modes force their layer visible */
const regionsVisible=()=>$('#ly-regions').checked||mode==='region'||mode==='split'||mode==='merge';
const planetsVisible=()=>$('#ly-labels').checked||mode==='add'||mode==='route';
/* fleets are part of the political layer: shown with the overlay, force-shown while editing */
const fleetsVisible=()=>$('#ly-pol').checked||mode==='pol'||mode==='poldraw'||mode==='fleetadd';
const eventsVisible=()=>$('#ly-events').checked||mode==='events'||mode==='eventadd';
/* global per-overlay opacity (group-level, persisted) */
function layerOpacity(){
  const o=DATA.render.layer_opacity||(DATA.render.layer_opacity={});
  for(const k of ['stability','political','regions','planets','routes','features','grid','fleets','events'])o[k]=o[k]??1;
  return o;
}
function applyLayerOpacity(){ // name groups are deliberately excluded — labels stay legible
  const o=layerOpacity();
  gStabWash.setAttribute('opacity',o.stability);
  gPol.setAttribute('opacity',o.political);
  gTintWash.setAttribute('opacity',o.regions);
  gFaces.setAttribute('opacity',o.regions);
  gPlanets.setAttribute('opacity',o.planets);
  gRoutes.setAttribute('opacity',o.routes);
  gNeb.setAttribute('opacity',o.features);
  gGridX.setAttribute('opacity',o.grid);
  gFleets.setAttribute('opacity',o.political); // fleets ride the political layer's slider
  gEvents.setAttribute('opacity',o.events);
}
function faceFill(f){
  if($('#ly-stab').checked) return STAB_PAL[f.warp_stability]||STAB_PAL.uncharted;
  return f.tint_enabled ? (f.tint||STAB_PAL.uncharted) : null; // per-region, default off → bare paper
}
/* effective route stroke — owned routes recolor while the Political overlay is on */
function routeStroke(r){
  if($('#ly-pol').checked&&r.owner){const en=entityById(r.owner);if(en)return en.color;}
  return r.style.stroke;
}
function renderGridX(){
  // extends the frame's border tick marks into full gridlines across the chart,
  // beneath every other map element. Spacing from canvas.grid (148 ≈ one square
  // of the source Map.png ≈ 6 days warp travel); bold line every second step.
  gGridX.innerHTML='';
  if(!$('#ly-grid').checked)return;
  for(let x=30,i=0;x<W-30;x+=GRID.step,i++)
    el('line',{x1:x,y1:30,x2:x,y2:H-30,stroke:INK_SOFT,
      'stroke-width':i%2===0?1.1:0.7,'stroke-opacity':i%2===0?0.26:0.18},gGridX);
  for(let y=30,i=0;y<H-30;y+=GRID.step,i++)
    el('line',{x1:30,y1:y,x2:W-30,y2:y,stroke:INK_SOFT,
      'stroke-width':i%2===0?1.1:0.7,'stroke-opacity':i%2===0?0.26:0.18},gGridX);
}
function renderWashes(){
  gHit.innerHTML='';gTintWash.innerHTML='';gStabWash.innerHTML='';
  const stab=$('#ly-stab').checked;
  for(const f of TESS.faces){
    const d=facePathD(f);
    const fill=faceFill(f);
    // stability overlay sits above region borders; chart tints sit just below them
    if(fill&&regionsVisible())el('path',{class:'face-wash',d,fill,'fill-opacity':0.5,filter:'url(#wash)','data-id':f.id,'pointer-events':'none'},stab?gStabWash:gTintWash);
    // invisible hit path lives low in the stack so planets/routes win clicks in Select mode
    el('path',{class:'face-wash',d,fill:'#000','fill-opacity':0,'data-id':f.id,'pointer-events':'all'},gHit);
  }
  $('#stab-legend')&&$('#stab-legend').setAttribute('visibility',stab&&regionsVisible()?'visible':'hidden');
}
function renderFaces(){
  gFaces.innerHTML='';gFaceNames.innerHTML='';
  if(!regionsVisible())return;
  for(const f of TESS.faces){
    const seld=sel&&sel.type==='region'&&sel.id===f.id;
    const g=el('g',{class:'face'+(seld?' selected':''),'data-id':f.id},gFaces);
    el('path',{class:'face-line',d:facePathD(f)},g);
    if(f.name){
      const fs=Math.min(58,Math.max(34,Math.sqrt(polyArea(f.vertices))/9));
      const t=el('text',{class:'region-name','data-id':f.id,x:f.label.x||faceCentroid(f)[0],y:f.label.y||faceCentroid(f)[1],'font-size':fs},gFaceNames);
      txt(t,f.name.toUpperCase());
    }
  }
}
function renderHandles(){
  gHandles.innerHTML='';
  if(mode==='region'){
    const f=(sel&&sel.type==='region')?findSel():null;
    if(!f)return;
    const vs=f.vertices;
    for(let i=0;i<vs.length;i++){ // edge hit paths for vertex insertion (curve-aware)
      const u=vs[i],v=vs[(i+1)%vs.length],c=edgeCurve(u,v);
      const dseg=c?`M ${V(u).join(' ')} Q ${c.cp[0]} ${c.cp[1]} ${V(v).join(' ')}`
                  :`M ${V(u).join(' ')} L ${V(v).join(' ')}`;
      el('path',{class:'edge-hit',d:dseg,'data-a':u,'data-b':v},gHandles);
    }
    for(const vi of vs)el('circle',{class:'vtx',cx:V(vi)[0],cy:V(vi)[1],r:11,'data-vi':vi},gHandles);
    for(let i=0;i<vs.length;i++){ // bend handles — drag to bow the edge, Alt-click to straighten
      const u=vs[i],v=vs[(i+1)%vs.length],c=edgeCurve(u,v);
      const mp=c?quadAt(V(u),c.cp,V(v),0.5):lerp2(V(u),V(v),0.5);
      el('rect',{class:'bend-handle',x:mp[0]-7,y:mp[1]-7,width:14,height:14,'data-a':u,'data-b':v},gHandles);
    }
    const lx=f.label.x||faceCentroid(f)[0],ly=f.label.y||faceCentroid(f)[1];
    el('rect',{class:'lbl-handle',x:lx-9,y:ly-9,width:18,height:18,transform:`rotate(45 ${lx} ${ly})`},gHandles);
  }else if(mode==='extra'){
    const nb=(sel&&sel.type==='nebula')?findSel():null;
    if(!nb)return;
    for(let i=0;i<nb.pts.length;i++){ // edge hit lines for vertex insertion
      const a=nb.pts[i],b=nb.pts[(i+1)%nb.pts.length];
      el('line',{class:'edge-hit',x1:a[0],y1:a[1],x2:b[0],y2:b[1],'data-i':i},gHandles);
    }
    // handle shape signals point type: round = smooth, square = corner
    nb.pts.forEach((p,i)=>nb.pt_smooth&&nb.pt_smooth[i]
      ?el('circle',{class:'vtx',cx:p[0],cy:p[1],r:11,'data-i':i},gHandles)
      :el('rect',{class:'vtx',x:p[0]-10,y:p[1]-10,width:20,height:20,'data-i':i},gHandles));
    el('rect',{class:'lbl-handle',x:nb.label.x-9,y:nb.label.y-9,width:18,height:18,
      transform:`rotate(45 ${nb.label.x} ${nb.label.y})`},gHandles);
  }else if(mode==='pol'){
    const t=(sel&&sel.type==='territory')?findSel():null;
    if(!t)return;
    for(let i=0;i<t.pts.length;i++){
      const a=t.pts[i],b=t.pts[(i+1)%t.pts.length];
      el('line',{class:'edge-hit',x1:a[0],y1:a[1],x2:b[0],y2:b[1],'data-i':i},gHandles);
    }
    t.pts.forEach((p,i)=>t.pt_smooth&&t.pt_smooth[i]
      ?el('circle',{class:'vtx',cx:p[0],cy:p[1],r:11,'data-i':i},gHandles)
      :el('rect',{class:'vtx',x:p[0]-10,y:p[1]-10,width:20,height:20,'data-i':i},gHandles));
    el('rect',{class:'lbl-handle',x:t.label.x-9,y:t.label.y-9,width:18,height:18,
      transform:`rotate(45 ${t.label.x} ${t.label.y})`},gHandles);
  }
}
const FEATURE_SUBTYPES={nebula:'Nebula',warp_storm:'Warp Storm'};
const FEATURE_SUBTYPE_PLURALS={nebula:'NEBULAE',warp_storm:'WARP STORMS'};

/* events — categorised markers; initial category: space battles */
function events(){return DATA.events=DATA.events||[];}
const eventById=id=>events().find(ev=>ev.id===id);
function eventCategories(){return DATA.event_categories=DATA.event_categories||[{id:'space_battle',name:'Space Battle',icon:'crossed_swords'}];}
const eventCatName=id=>(eventCategories().find(c=>c.id===id)||{}).name||id;

/* timeline — multiple dated map states (Imperial-format date strings, user-entered) */
const STATE_KEYS=['planets','routes','tessellation','nebulae','political_entities','fleets','political_territories','events'];
function timeline(){return DATA.timeline=DATA.timeline||[];}
function currentEntry(){return timeline().find(t=>t.id===DATA.current_date_id);}
function captureState(){
  const s={};for(const k of STATE_KEYS)s[k]=DATA[k];
  return JSON.parse(JSON.stringify(s));
}
function applyState(s){
  const c=JSON.parse(JSON.stringify(s));
  for(const k of STATE_KEYS)DATA[k]=c[k];
  for(const k of STATE_KEYS)if(k!=='tessellation'&&!DATA[k])DATA[k]=[]; // older states may predate newer keys
  Object.assign(TESS,c.tessellation); // rebind the live tessellation reference
}
function syncCurrentDate(){const cur=currentEntry();if(cur)cur.state=captureState();}
function ensureTimeline(){
  if(!timeline().length){
    timeline().push({id:'date_0',date:'Undated',state:captureState()});
    DATA.current_date_id='date_0';
  }
  if(!currentEntry())DATA.current_date_id=timeline()[0].id;
}
function switchDate(id){
  if(id===DATA.current_date_id)return;
  const tgt=timeline().find(t=>t.id===id);if(!tgt)return;
  syncCurrentDate();
  applyState(tgt.state);
  DATA.current_date_id=id;
  sel=null;undoStack.length=0; // undo history is per-date
  dirty=true;
  recomputeContainment();renderAll();
}

/* timeline diff — highlight elements that differ between the live date and another */
let diffCompareId=null,diffInfo=null;
function computeDiff(stateB){
  const A=captureState(); // live state
  const changed=new Set();   // attribute changes & additions → gold glow
  const neutral=new Set();   // shape changes → no glow/dim; the changed AREA is washed instead
  const ghosts=[],moves=[],xors=[],oldPaths=[];
  const J=o=>JSON.stringify(o);
  // point objects: displacement arrows for moves
  for(const key of ['planets','fleets','events']){
    const a=A[key]||[],bm=new Map((stateB[key]||[]).map(o=>[o.id,o]));
    for(const o of a){
      const bo=bm.get(o.id);
      if(!bo)changed.add(key+':'+o.id);
      else if(J(o)!==J(bo)){
        changed.add(key+':'+o.id);
        if(o.x!==bo.x||o.y!==bo.y)moves.push({from:[bo.x,bo.y],to:[o.x,o.y]});
      }
      bm.delete(o.id);
    }
    for(const o of bm.values())ghosts.push({kind:'point',x:o.x,y:o.y,name:o.name});
  }
  // closed shapes: XOR wash highlights only the changed area
  for(const key of ['nebulae','political_territories']){
    const a=A[key]||[],bm=new Map((stateB[key]||[]).map(o=>[o.id,o]));
    const shapeOf=o=>J([o.pts,o.pt_smooth]);
    for(const o of a){
      const bo=bm.get(o.id);
      if(!bo)changed.add(key+':'+o.id);
      else if(shapeOf(o)!==shapeOf(bo)){
        neutral.add(key+':'+o.id);
        xors.push({oldPts:flattenNb(bo),newPts:flattenNb(o)});
      }
      else if(J(o)!==J(bo))changed.add(key+':'+o.id);
      bm.delete(o.id);
    }
    for(const o of bm.values())ghosts.push({kind:'poly',pts:o.pts,name:o.name});
  }
  // routes: rerouted shapes show the OLD course as a dotted trace
  {
    const bm=new Map((stateB.routes||[]).map(o=>[o.id,o]));
    const geomOf=r=>J([r.from,r.to,r.waypoints,(r.style||{}).path]);
    const oldRoutePts=bo=>{
      const pa=(stateB.planets||[]).find(p=>p.id===bo.from),pb=(stateB.planets||[]).find(p=>p.id===bo.to);
      return(pa&&pb)?[[pa.x,pa.y],...(bo.waypoints||[]),[pb.x,pb.y]]:null;
    };
    for(const r of A.routes||[]){
      const bo=bm.get(r.id);
      if(!bo)changed.add('routes:'+r.id);
      else if(geomOf(r)!==geomOf(bo)){
        neutral.add('routes:'+r.id);
        const pts=oldRoutePts(bo);
        if(pts)oldPaths.push({d:(bo.style&&bo.style.path==='curved')?crPathD(pts):'M '+pts.map(p=>p.join(' ')).join(' L ')});
      }
      else if(J(r)!==J(bo))changed.add('routes:'+r.id);
      bm.delete(r.id);
    }
    for(const o of bm.values()){
      const pts=oldRoutePts(o);
      if(pts)ghosts.push({kind:'path',pts,name:o.label});
    }
  }
  // regions: geometry compared on resolved coordinates; geometry change → XOR, attrs → glow
  const flattenFaceOf=(st,f)=>{
    const vs=f.vertices,out=[],V2=i=>st.tessellation.vertices[i],EC=st.tessellation.edge_curves||{};
    for(let i=0;i<vs.length;i++){
      const u=vs[i],v=vs[(i+1)%vs.length],k=u<v?u+'-'+v:v+'-'+u,c=EC[k];
      out.push(V2(u).slice());
      if(c)for(let s=1;s<CURVE_SAMPLES;s++)out.push(quadAt(V2(u),c.cp,V2(v),s/CURVE_SAMPLES));
    }
    return out;
  };
  const geomSig=(st,f)=>J(flattenFaceOf(st,f));
  const attrSig=f=>J([f.name,f.warp_stability,f.tint,!!f.tint_enabled]);
  const bFaces=new Map((stateB.tessellation.faces||[]).map(f=>[f.id,f]));
  for(const f of A.tessellation.faces){
    const bf=bFaces.get(f.id);
    if(!bf)changed.add('faces:'+f.id);
    else{
      if(geomSig(A,f)!==geomSig(stateB,bf)){
        neutral.add('faces:'+f.id);
        xors.push({oldPts:flattenFaceOf(stateB,bf),newPts:flattenFaceOf(A,f)});
      }
      else if(attrSig(f)!==attrSig(bf))changed.add('faces:'+f.id);
    }
    bFaces.delete(f.id);
  }
  for(const bf of bFaces.values())
    ghosts.push({kind:'poly',pts:bf.vertices.map(vi=>stateB.tessellation.vertices[vi]),name:bf.name});
  return {changed,neutral,ghosts,moves,xors,oldPaths};
}
function refreshDiff(){
  if(!diffCompareId){diffInfo=null;return;}
  const tgt=timeline().find(t=>t.id===diffCompareId);
  if(!tgt||tgt.id===DATA.current_date_id){diffCompareId=null;diffInfo=null;return;}
  diffInfo=computeDiff(tgt.state);
}
function renderGhosts(){
  gGhost.innerHTML='';
  if(!diffInfo)return;
  for(const g of diffInfo.ghosts){
    const grp=el('g',{class:'ghost'},gGhost);
    if(g.kind==='point'){
      el('circle',{cx:g.x,cy:g.y,r:16,fill:'none',stroke:'#8B0000','stroke-width':2.5,'stroke-dasharray':'4 4'},grp);
      el('line',{x1:g.x-7,y1:g.y-7,x2:g.x+7,y2:g.y+7,stroke:'#8B0000','stroke-width':2},grp);
      el('line',{x1:g.x+7,y1:g.y-7,x2:g.x-7,y2:g.y+7,stroke:'#8B0000','stroke-width':2},grp);
      if(g.name)txt(el('text',{class:'ghost-name',x:g.x,y:g.y-24},grp),g.name);
    }else if(g.kind==='path'){
      el('path',{d:'M '+g.pts.map(p=>p.join(' ')).join(' L '),fill:'none',stroke:'#8B0000','stroke-width':2.5,'stroke-dasharray':'4 5'},grp);
      if(g.name){const m=g.pts[Math.floor(g.pts.length/2)];txt(el('text',{class:'ghost-name',x:m[0],y:m[1]-10},grp),g.name);}
    }else if(g.kind==='poly'&&g.pts&&g.pts.length){
      el('path',{d:'M '+g.pts.map(p=>p.join(' ')).join(' L ')+' Z',fill:'#8B0000','fill-opacity':0.06,
        stroke:'#8B0000','stroke-width':2.5,'stroke-dasharray':'5 5'},grp);
      if(g.name){const c=centroidPts(g.pts);txt(el('text',{class:'ghost-name',x:c[0],y:c[1]},grp),g.name);}
    }
  }
  const AMBER='#8a6d1f';
  // displacement arrows: dotted line from the old position to the new, arrowhead at the new end
  for(const mv of diffInfo.moves){
    const dx=mv.to[0]-mv.from[0],dy=mv.to[1]-mv.from[1],L=Math.hypot(dx,dy);
    if(L<24)continue; // too small to draw meaningfully
    const ux=dx/L,uy=dy/L;
    const x1=mv.from[0]+ux*14,y1=mv.from[1]+uy*14;
    const x2=mv.to[0]-ux*22,y2=mv.to[1]-uy*22;
    const grp=el('g',{class:'ghost diff-move'},gGhost);
    el('circle',{cx:mv.from[0],cy:mv.from[1],r:4.5,fill:'none',stroke:AMBER,'stroke-width':2},grp);
    el('line',{x1,y1,x2,y2,stroke:AMBER,'stroke-width':2.5,'stroke-dasharray':'2 6','stroke-linecap':'round'},grp);
    const s=10;
    el('path',{d:`M ${x2+ux*s} ${y2+uy*s} L ${x2-uy*s*0.55} ${y2+ux*s*0.55} L ${x2+uy*s*0.55} ${y2-ux*s*0.55} Z`,fill:AMBER},grp);
  }
  // shape changes: even-odd compound path fills exactly the symmetric difference (the changed area)
  for(const x of diffInfo.xors){
    el('path',{class:'diff-xor',
      d:'M '+x.oldPts.map(p=>p.join(' ')).join(' L ')+' Z M '+x.newPts.map(p=>p.join(' ')).join(' L ')+' Z',
      fill:'#FFD700','fill-opacity':0.35,'fill-rule':'evenodd',
      stroke:AMBER,'stroke-width':1.4,'stroke-dasharray':'3 4','pointer-events':'none'},gGhost);
  }
  // rerouted paths: the old course as a dotted amber trace
  for(const p of diffInfo.oldPaths){
    el('path',{class:'diff-oldpath',d:p.d,fill:'none',stroke:AMBER,'stroke-width':2.5,'stroke-dasharray':'2 6','pointer-events':'none'},gGhost);
  }
}
function applyDiffClasses(){
  if(!diffInfo)return;
  const mark=(selector,type)=>{
    for(const n of document.querySelectorAll(selector)){
      const id=n.dataset?n.dataset.id:null;if(!id)continue;
      const hot=diffInfo.changed.has(type+':'+id);
      const neu=diffInfo.neutral&&diffInfo.neutral.has(type+':'+id); // shape-changed: shown plainly, area wash carries the highlight
      n.classList.toggle('diff-hot',hot);
      n.classList.toggle('diff-dim',!hot&&!neu);
    }
  };
  mark('.planet','planets');mark('.planet-name','planets');mark('.polov','planets');
  mark('.route','routes');mark('.route-name','routes');
  mark('.fleet','fleets');mark('.fleet-name','fleets');
  mark('.event','events');mark('.event-name','events');
  mark('.nebula','nebulae');mark('.neb-label','nebulae');
  mark('.territory','political_territories');mark('.terr-label','political_territories');
  mark('.face','faces');mark('.region-name','faces');mark('.face-wash','faces');
}

/* political territories — user-drawn polygons of political control */
function territories(){return DATA.political_territories=DATA.political_territories||[];}
const territoryById=id=>territories().find(t=>t.id===id);
function ensureTerrDefaults(t){
  t.owner=t.owner??null;
  t.name=t.name??null;
  if(!Array.isArray(t.pt_smooth)||t.pt_smooth.length!==t.pts.length)
    t.pt_smooth=t.pts.map((_,i)=>(t.pt_smooth&&t.pt_smooth[i])?1:0);
  if(!t.label){const c=centroidPts(t.pts);t.label={x:Math.round(c[0]),y:Math.round(c[1])};}
}

/* fleets — pins with owner/commander/ships */
const SHIP_CLASSES=DATA.ship_classes||['Transport','Raider','Frigate','Light Cruiser','Cruiser','Battlecruiser','Grand Cruiser'];
function fleets(){return DATA.fleets=DATA.fleets||[];}
const fleetById=id=>fleets().find(f=>f.id===id);

/* political entities — user-built list, planets reference by id */
const POL_PALETTE=['#8b1f1f','#1f4e8b','#1f7a3a','#8a6b1f','#6b2a7a','#a34d18','#226b6b','#7a2a4a','#4a5a23','#23445a'];
function polEntities(){return DATA.political_entities=DATA.political_entities||[];}
const entityById=id=>polEntities().find(e=>e.id===id);
function addPolEntity(name){
  let base=name.toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'')||'entity';
  let id=base,i=2;while(entityById(id))id=base+'_'+i++;
  const e={id,name,color:POL_PALETTE[polEntities().length%POL_PALETTE.length]};
  polEntities().push(e);
  return e;
}
function ensureNebDefaults(nb){
  nb.name=nb.name??null;
  nb.subtype=nb.subtype||'nebula';
  if(!nb.label){const c=centroidPts(nb.pts);nb.label={x:Math.round(c[0]),y:Math.round(c[1])};}
  nb.style=nb.style||{};
  nb.style.color=nb.style.color||NEB_INK[nb.cls]||'#7a4a7e';
  nb.style.fill=nb.style.fill||'stipple';
  nb.style.density=nb.style.density||13;
  nb.style.fill_visible=nb.style.fill_visible??false; // default: transparent — the chart shows through
  nb.style.border=Object.assign({width:1.6,dash:'dashed',opacity:0.7},nb.style.border||{});
  if(!Array.isArray(nb.pt_smooth)||nb.pt_smooth.length!==nb.pts.length)
    nb.pt_smooth=nb.pts.map((_,i)=>(nb.pt_smooth&&nb.pt_smooth[i])?1:0);
}
const NEB_DASH={solid:'',dashed:'4 6',dotted:'1.5 6'};
function nebPatternDef(nb){ // per-feature fill pattern, rebuilt on every render
  const s=Math.max(6,Math.min(34,+nb.style.density||13));
  const id='nbpat-'+nb.id;
  if(nb.style.fill==='none')return null;
  const rot=(nb.id.split('').reduce((a,c)=>a+c.charCodeAt(0),0)%37); // stable per-feature rotation
  const p=el('pattern',{id,width:s,height:s,patternUnits:'userSpaceOnUse',patternTransform:`rotate(${nb.style.fill==='stipple'?rot:45})`},gNebDefs);
  const ink=nb.style.color;
  if(nb.style.fill==='stipple'){
    [[0.15,0.23,0.10],[0.62,0.54,0.077],[0.38,0.85,0.115],[0.85,0.08,0.069],[0.92,0.77,0.092]]
      .forEach(([fx,fy,fr])=>el('circle',{cx:fx*s,cy:fy*s,r:Math.max(0.8,fr*s),fill:ink,'fill-opacity':0.5},p));
  }else{
    el('line',{x1:s/2,y1:0,x2:s/2,y2:s,stroke:ink,'stroke-width':1.1,'stroke-opacity':0.5},p);
    if(nb.style.fill==='crosshatch')el('line',{x1:0,y1:s/2,x2:s,y2:s/2,stroke:ink,'stroke-width':1.1,'stroke-opacity':0.5},p);
  }
  return id;
}
function renderNebulae(){
  gNeb.innerHTML='';gNebNames.innerHTML='';gNebDefs.innerHTML='';
  if(!$('#ly-nebulae').checked&&mode!=='extra'&&mode!=='nebdraw')return;
  for(const nb of (DATA.nebulae||[])){
    ensureNebDefaults(nb);
    const d=nbPathD(nb);
    const g=el('g',{class:'nebula'+(sel&&sel.type==='nebula'&&sel.id===nb.id?' selected':''),'data-id':nb.id},gNeb);
    const pat=nebPatternDef(nb), b=nb.style.border;
    if(nb.style.fill_visible)el('path',{d,fill:nb.style.color,'fill-opacity':nb.style.fill==='none'?0.16:0.07},g);
    if(pat)el('path',{d,fill:`url(#${pat})`},g);
    el('path',{d,fill:'none',stroke:nb.style.color,'stroke-width':b.width,
      'stroke-dasharray':NEB_DASH[b.dash]??b.dash,'stroke-opacity':b.opacity},g);
    el('path',{class:'neb-hit',d,fill:'#000','fill-opacity':0,'data-id':nb.id},g);
    if(nb.name)txt(el('text',{class:'neb-label','data-id':nb.id,x:nb.label.x,y:nb.label.y,'font-size':30,fill:nb.style.color},gNebNames),nb.name);
  }
}
function drawMarkerGlyph(g,desId,pol){ // marker glyph at local (0,0); shared by planets and the legend
  // pol (boolean): political overlay active — class colours are dropped and the body reverts
  // to translucent paper so the chart shows through. Entity tints/rings live in the gPol layer.
  const st=styleFor(desId);
  const dec=!!pol;
  const bodyFill=dec?PAPER_HI:st.fill, bodyOp=dec?0.25:1;
  if(st.glow&&!dec)el('circle',{r:24,fill:st.fill,opacity:.3,'pointer-events':'none'},g);
  if(st.arms)for(const a of[45,135,225,315]){const r=a*Math.PI/180;
    el('line',{x1:Math.cos(r)*14,y1:Math.sin(r)*14,x2:Math.cos(r)*26,y2:Math.sin(r)*26,stroke:INK,'stroke-width':5,'pointer-events':'none'},g);}
  if(st.ring)el('ellipse',{rx:26,ry:8,fill:'none',stroke:INK,'stroke-width':3,transform:'rotate(-20)','pointer-events':'none'},g);
  if(st.sideDots){el('circle',{cx:-24,cy:0,r:6,fill:INK,'pointer-events':'none'},g);el('circle',{cx:24,cy:0,r:6,fill:INK,'pointer-events':'none'},g);}
  if(st.shape==='hex'){
    const pts=[...Array(6)].map((_,i)=>{const a=Math.PI/3*i;return`${Math.cos(a)*17},${Math.sin(a)*17}`}).join(' ');
    el('polygon',{class:'body',points:pts,fill:bodyFill,'fill-opacity':bodyOp,stroke:INK,'stroke-width':2.5},g);
  }else{
    el('circle',{class:'body',r:15,fill:bodyFill,'fill-opacity':bodyOp,stroke:INK,'stroke-width':2.5},g);
    if(st.half)el('path',{d:'M -15 0 A 15 15 0 0 0 15 0 Z',fill:st.half,'fill-opacity':dec?0.3:1,'pointer-events':'none'},g);
    if(st.glyph==='cross'){el('line',{x1:-9,y1:-9,x2:9,y2:9,stroke:INK,'stroke-width':3.5,'pointer-events':'none'},g);
      el('line',{x1:9,y1:-9,x2:-9,y2:9,stroke:INK,'stroke-width':3.5,'pointer-events':'none'},g);}
    if(st.glyph==='slash')el('line',{x1:-8,y1:8,x2:8,y2:-8,stroke:INK,'stroke-width':3.5,'pointer-events':'none'},g);
    if(st.dotFill)el('circle',{r:6,fill:st.dotFill,'fill-opacity':dec?0.35:1,'pointer-events':'none'},g);
    if(desId==='dead_world')el('circle',{r:15,fill:'none',stroke:'#777','stroke-width':3,'pointer-events':'none'},g);
  }
}
function renderPlanet(p){
  const g=el('g',{class:'planet'+(sel&&sel.type==='planet'&&sel.id===p.id?' selected':''),transform:`translate(${p.x},${p.y})`},gPlanets);
  g.dataset.id=p.id;
  drawMarkerGlyph(g,p.designation,$('#ly-pol').checked);
  el('circle',{class:'halo',r:26},g);
  txt(el('text',{class:'planet-name','data-id':p.id,x:p.x,y:p.y-26},gPlanetNames),p.name);
  const ti=document.createElementNS(SVGNS,'title');
  const c=corpusById[p.designation], reg=TESS.faces.find(f=>f.id===containment[p.id]);
  ti.textContent=`${p.name} — ${desName(p.designation)}${c&&c.greek_class?` (Classis ${c.greek_class})`:''}${reg?` · ${reg.name}`:''}`;
  g.appendChild(ti);
}
function renderFleets(){
  gFleets.innerHTML='';gFleetNames.innerHTML='';
  if(!fleetsVisible())return;
  const polOn=$('#ly-pol').checked;
  for(const f of fleets()){
    const ent=f.owner?entityById(f.owner):null;
    const col=(polOn&&ent)?ent.color:INK_SOFT;
    const g=el('g',{class:'fleet'+(sel&&sel.type==='fleet'&&sel.id===f.id?' selected':''),transform:`translate(${f.x},${f.y})`},gFleets);
    g.dataset.id=f.id;
    el('path',{class:'pin',d:'M 0 0 C -12 -16 -19 -23 -19 -33 A 19 19 0 1 1 19 -33 C 19 -23 12 -16 0 0 Z',
      fill:PAPER_HI,stroke:col,'stroke-width':3.5},g);
    el('circle',{cx:0,cy:-33,r:12,fill:col,'pointer-events':'none'},g);
    txt(el('text',{x:0,y:-27,'font-family':'Oswald,sans-serif','font-size':17,fill:'#f3ecd9','text-anchor':'middle','pointer-events':'none'},g),
      String((f.ships||[]).length));
    el('circle',{class:'halo',r:26,cy:-26},g);
    txt(el('text',{class:'fleet-name','data-id':f.id,x:f.x,y:f.y-60},gFleetNames),f.name);
    const ti=document.createElementNS(SVGNS,'title');
    ti.textContent=`${f.name}${f.commander?' — '+f.commander:''}${ent?' · '+ent.name:''} · ${(f.ships||[]).length} ship(s)`;
    g.appendChild(ti);
  }
}
/* contested-world geometry: equal pie division among contesting factions */
function pieWedgeD(r,a0,a1){
  const x0=Math.cos(a0)*r,y0=Math.sin(a0)*r,x1=Math.cos(a1)*r,y1=Math.sin(a1)*r;
  const large=(a1-a0)>Math.PI?1:0;
  return `M 0 0 L ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1} Z`;
}
function arcSegD(r,a0,a1){
  const x0=Math.cos(a0)*r,y0=Math.sin(a0)*r,x1=Math.cos(a1)*r,y1=Math.sin(a1)*r;
  const large=(a1-a0)>Math.PI?1:0;
  return `M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1}`;
}
const contestants=p=>(p.contested||[]).map(id=>entityById(id)).filter(Boolean);
/* event glyphs — simple original ink drawings */
function drawCrossedSwords(g){
  const ink='#7a1f1f';
  // two crossed blades, hilts at the bottom corners
  el('line',{x1:-11,y1:11,x2:11,y2:-11,stroke:ink,'stroke-width':3.2,'stroke-linecap':'round','pointer-events':'none'},g);
  el('line',{x1:-11,y1:-11,x2:11,y2:11,stroke:ink,'stroke-width':3.2,'stroke-linecap':'round','pointer-events':'none'},g);
  // crossguards
  el('line',{x1:-11.5,y1:4.5,x2:-4.5,y2:11.5,stroke:ink,'stroke-width':2.2,'pointer-events':'none'},g);
  el('line',{x1:4.5,y1:11.5,x2:11.5,y2:4.5,stroke:ink,'stroke-width':2.2,'pointer-events':'none'},g);
  // pommels
  el('circle',{cx:-12.5,cy:12.5,r:2.1,fill:ink,'pointer-events':'none'},g);
  el('circle',{cx:12.5,cy:12.5,r:2.1,fill:ink,'pointer-events':'none'},g);
}
const EVENT_GLYPHS={crossed_swords:drawCrossedSwords};
function renderEvents(){
  gEvents.innerHTML='';gEventNames.innerHTML='';
  if(!eventsVisible())return;
  for(const ev of events()){
    const cat=eventCategories().find(c=>c.id===ev.category)||eventCategories()[0];
    const g=el('g',{class:'event'+(sel&&sel.type==='event'&&sel.id===ev.id?' selected':''),transform:`translate(${ev.x},${ev.y})`},gEvents);
    g.dataset.id=ev.id;
    el('circle',{r:17,fill:PAPER_HI,stroke:INK_SOFT,'stroke-width':2},g); // paper rosette under the glyph
    (EVENT_GLYPHS[cat&&cat.icon]||drawCrossedSwords)(g);
    el('circle',{class:'halo',r:23},g);
    if(ev.name)txt(el('text',{class:'event-name','data-id':ev.id,x:ev.x,y:ev.y-28},gEventNames),ev.name);
  }
}
const territoriesVisible=()=>$('#ly-pol').checked||mode==='pol'||mode==='poldraw';
function renderPol(){ // political overlay layer — territories + rings + entity wash
  gPol.innerHTML='';
  if(territoriesVisible()){
    for(const t of territories()){
      ensureTerrDefaults(t);
      const ent=t.owner?entityById(t.owner):null;
      const col=ent?ent.color:INK_SOFT;
      const d=nbPathD(t); // same per-point smooth machinery as extrasolar features
      const g=el('g',{class:'territory'+(sel&&sel.type==='territory'&&sel.id===t.id?' selected':''),'data-id':t.id},gPol);
      el('path',{d,fill:col,'fill-opacity':0.16,'pointer-events':'none'},g);
      el('path',{d,fill:'none',stroke:col,'stroke-width':2.5,'stroke-dasharray':'8 6','stroke-opacity':0.85,'pointer-events':'none'},g);
      el('path',{class:'terr-hit',d,fill:'#000','fill-opacity':0,'data-id':t.id},g);
      const lbl=t.name||(ent?ent.name:null); // territory name wins; falls back to the entity
      if(lbl)txt(el('text',{class:'terr-label','data-id':t.id,x:t.label.x,y:t.label.y,fill:col},g),lbl.toUpperCase());
    }
  }
  if(!$('#ly-pol').checked||!planetsVisible())return;
  for(const p of DATA.planets){
    const cs=contestants(p);
    if(cs.length>=2){ // contested world: graphics divided equally among the contesting factions
      const g=el('g',{class:'polov contested','data-id':p.id,transform:`translate(${p.x},${p.y})`},gPol);
      const n=cs.length;
      for(let i=0;i<n;i++){
        const a0=-Math.PI/2+i*2*Math.PI/n,a1=-Math.PI/2+(i+1)*2*Math.PI/n;
        el('path',{class:'pol-ring',d:pieWedgeD(30,a0,a1),fill:cs[i].color,'fill-opacity':0.16},g);
        el('path',{class:'pol-ring',d:arcSegD(25,a0,a1),fill:'none',stroke:cs[i].color,'stroke-width':5,'stroke-opacity':0.85},g);
        el('path',{class:'pol-tint',d:pieWedgeD(15,a0,a1),fill:cs[i].color,'fill-opacity':0.35},g);
      }
      continue;
    }
    if(!p.owner)continue;
    const ent=entityById(p.owner);if(!ent)continue;
    const g=el('g',{class:'polov','data-id':p.id,transform:`translate(${p.x},${p.y})`},gPol);
    el('circle',{class:'pol-ring',r:30,fill:ent.color,'fill-opacity':0.16},g);
    el('circle',{class:'pol-ring',r:25,fill:'none',stroke:ent.color,'stroke-width':5,'stroke-opacity':0.85},g);
    if(styleFor(p.designation).shape==='hex'){
      const pts=[...Array(6)].map((_,i)=>{const a=Math.PI/3*i;return`${Math.cos(a)*17},${Math.sin(a)*17}`}).join(' ');
      el('polygon',{class:'pol-tint',points:pts,fill:ent.color,'fill-opacity':0.35},g);
    }else el('circle',{class:'pol-tint',r:15,fill:ent.color,'fill-opacity':0.35},g);
  }
}
const planetById=id=>DATA.planets.find(p=>p.id===id);
function routePoints(r){const a=planetById(r.from),b=planetById(r.to);return(a&&b)?[[a.x,a.y],...r.waypoints,[b.x,b.y]]:null;}
function renderRoute(r){
  const pts=routePoints(r);if(!pts)return;
  const d=(r.style.path==='curved')?crPathD(pts):'M '+pts.map(p=>p.join(' ')).join(' L ');
  const g=el('g',{class:'route'+(sel&&sel.type==='route'&&sel.id===r.id?' selected':'')},gRoutes);
  g.dataset.id=r.id;
  el('path',{class:'route-hit',d},g);
  el('path',{class:'route-path',d,stroke:routeStroke(r),'stroke-width':r.style.width,'stroke-dasharray':r.style.dash},g);
  if(r.label){
    const mid=pts[Math.floor((pts.length-1)/2)],nxt=pts[Math.ceil((pts.length-1)/2+0.01)]||mid;
    txt(el('text',{class:'route-name','data-id':r.id,x:(mid[0]+nxt[0])/2,y:(mid[1]+nxt[1])/2-12,fill:r.style.labelColor||'#6b5134'},gRouteNames),r.label);
  }
  if(sel&&sel.type==='route'&&sel.id===r.id)
    r.waypoints.forEach((w,i)=>{const c=el('circle',{class:'waypoint',cx:w[0],cy:w[1],r:9},g);c.dataset.wp=i;});
}
function renderRoutes(){
  gRoutes.innerHTML='';gRouteNames.innerHTML='';
  if($('#ly-routes').checked)DATA.routes.forEach(renderRoute);
}
function renderTimeline(){
  const list=$('#timeline-list');if(!list)return;
  list.innerHTML='';
  for(const t of timeline()){
    const row=document.createElement('div');
    row.className='tl-row'+(t.id===DATA.current_date_id?' tl-active':'');
    const mark=document.createElement('span');mark.textContent=t.id===DATA.current_date_id?'▶':'·';
    const dt=document.createElement('span');dt.className='tl-date';dt.textContent=t.date;
    const ren=document.createElement('span');ren.className='tl-btn';ren.textContent='✎';ren.title='Rename date';
    const del=document.createElement('span');del.className='tl-btn tl-del';del.textContent='✕';del.title='Remove date';
    row.append(mark,dt,ren,del);
    row.onclick=e=>{
      if(e.target===ren){
        const nm=prompt('Imperial date (e.g. 3 456 817.M41):',t.date);
        if(nm&&nm.trim()){t.date=nm.trim();dirty=true;renderTimeline();}
        return;
      }
      if(e.target===del){
        if(timeline().length<=1){flashHint('The timeline needs at least one date.');return;}
        if(!confirm(`Remove "${t.date}" and its entire map state?`))return;
        if(t.id===DATA.current_date_id){
          const other=timeline().find(x=>x.id!==t.id);
          applyState(other.state);DATA.current_date_id=other.id;
          sel=null;undoStack.length=0;recomputeContainment();
        }
        DATA.timeline=timeline().filter(x=>x.id!==t.id);
        dirty=true;renderAll();
        return;
      }
      switchDate(t.id);
    };
    list.appendChild(row);
  }
  const cd=document.getElementById('cart-date');
  const cur=currentEntry();
  if(cd)cd.textContent='drawn from voidfarers’ rutters'+(cur&&cur.date&&cur.date!=='Undated'?' · '+cur.date:'');
  // compare-with selector: every date except the active one
  const cmp=$('#tl-compare');
  if(cmp){
    const keep=diffCompareId;
    cmp.innerHTML='<option value="">— compare off —</option>'+
      timeline().filter(t=>t.id!==DATA.current_date_id)
        .map(t=>`<option value="${t.id}" ${t.id===keep?'selected':''}>${t.date}</option>`).join('');
    if(keep&&!timeline().some(t=>t.id===keep&&t.id!==DATA.current_date_id)){diffCompareId=null;diffInfo=null;cmp.value='';}
  }
  const di=$('#tl-diffinfo');
  if(di)di.textContent=diffInfo
    ?`${diffInfo.changed.size} changed/added (highlighted) · ${diffInfo.neutral.size} reshaped/moved (area wash & arrows) · ${diffInfo.ghosts.length} removed (red dashed) · unchanged dimmed`
    :'';
}
function renderAll(){
  applyLayerOpacity();
  refreshDiff(); // before the timeline panel so the summary reflects the fresh diff
  renderTimeline();
  renderGridX();renderWashes();renderNebulae();renderFaces();
  renderRoutes();
  gPlanets.innerHTML='';gPlanetNames.innerHTML='';
  if(planetsVisible())DATA.planets.forEach(renderPlanet);
  renderPol();
  renderFleets();
  renderEvents();
  renderGhosts();applyDiffClasses(); // diff view overlays, after all layers exist
  renderHandles();
  renderLegend();
  renderEditor();
  $('#counts').textContent=`${DATA.planets.length} planets · ${DATA.routes.length} routes · ${TESS.faces.length} regions`;
  $('#dirty').textContent=dirty?'● unsaved changes':'';
}

/* ---------------- undo ---------------- */
function snapshot(){
  undoStack.push(JSON.stringify({planets:DATA.planets,routes:DATA.routes,tessellation:DATA.tessellation,nebulae:DATA.nebulae,political_entities:polEntities(),fleets:fleets(),political_territories:territories(),events:events()}));
  if(undoStack.length>60)undoStack.shift();dirty=true;
}
function undo(){
  const s=undoStack.pop();if(!s)return;
  const o=JSON.parse(s);
  DATA.planets=o.planets;DATA.routes=o.routes;DATA.tessellation=o.tessellation;DATA.nebulae=o.nebulae;
  DATA.political_entities=o.political_entities||[];
  DATA.fleets=o.fleets||[];
  DATA.political_territories=o.political_territories||[];
  DATA.events=o.events||[];
  Object.assign(TESS,DATA.tessellation);
  if(sel&&!findSel())sel=null;
  recomputeContainment();renderAll();
}
function findSel(){
  if(!sel)return null;
  if(sel.type==='planet')return planetById(sel.id);
  if(sel.type==='route')return DATA.routes.find(r=>r.id===sel.id);
  if(sel.type==='nebula')return (DATA.nebulae||[]).find(n=>n.id===sel.id);
  if(sel.type==='fleet')return fleetById(sel.id);
  if(sel.type==='territory')return territoryById(sel.id);
  if(sel.type==='event')return eventById(sel.id);
  return TESS.faces.find(f=>f.id===sel.id);
}
function slug(n){let base=n.toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'')||'planet';let s=base,i=2;while(planetById(s))s=base+'_'+i++;return s;}

/* ---------------- editor panel ---------------- */
function desOptions(current){
  let h='<optgroup label="Map legend / local">';
  const legendIds=[...new Set(Object.values(DATA.legend_designation_map))].filter(x=>typeof x==='string'&&!x.startsWith('_'));
  for(const id of legendIds)h+=`<option value="${id}" ${id===current?'selected':''}>${desName(id)}</option>`;
  h+='</optgroup>';
  const byCat={};
  for(const d of CORPUS)(byCat[d.category]=byCat[d.category]||[]).push(d);
  for(const cat of Object.keys(byCat).sort()){
    h+=`<optgroup label="${cat.replace(/_/g,' ')}">`;
    for(const d of byCat[cat])h+=`<option value="${d.id}" ${d.id===current?'selected':''}>${d.name}${d.greek_class?' ('+d.greek_class+')':''}</option>`;
    h+='</optgroup>';
  }
  return h;
}
function renderEditor(){
  const ed=$('#editor'),obj=findSel();
  if(!obj){
    if(mode==='extra'||mode==='nebdraw'){
      ed.innerHTML=`<h2>Extrasolar</h2>
        <div class="hint">Click a nebula or disturbance to edit it, or draw a new one.</div>
        <div class="toolrow" style="margin-top:.5rem"><button id="e-naddf">+ Add Feature (draw outline)</button></div>`;
      $('#e-naddf').onclick=()=>setMode('nebdraw');
      return;
    }
    if(mode==='pol'||mode==='poldraw'||mode==='fleetadd'){
      ed.innerHTML=`<h2>Political</h2>
        <div class="hint">Click a territory or fleet pin to edit it, or add a new one.</div>
        <div class="toolrow" style="margin-top:.5rem">
          <button id="e-taddf">+ Draw Territory</button>
          <button id="e-faddf">+ Add Fleet (place pin)</button>
        </div>`;
      $('#e-taddf').onclick=()=>setMode('poldraw');
      $('#e-faddf').onclick=()=>setMode('fleetadd');
      return;
    }
    if(mode==='events'||mode==='eventadd'){
      ed.innerHTML=`<h2>Events</h2>
        <div class="hint">Click an event marker to edit it, or place a new one.</div>
        <div class="toolrow" style="margin-top:.5rem"><button id="e-evaddf">+ Add Event (place marker)</button></div>`;
      $('#e-evaddf').onclick=()=>setMode('eventadd');
      return;
    }
    ed.innerHTML='<h2>Editor</h2><div class="hint">Nothing selected. Click a planet, route, or region.</div>';return;
  }
  if(sel.type==='planet'){
    const c=corpusById[obj.designation],reg=TESS.faces.find(f=>f.id===containment[obj.id]);
    ed.innerHTML=`<h2>Planet</h2>
      <label class="f">Name</label><input type="text" id="e-name" value="${obj.name.replace(/"/g,'&quot;')}">
      <label class="f">Designation</label><select id="e-des">${desOptions(obj.designation)}</select>
      <div class="des-desc">${c?c.description+'…':''}</div>
      <label class="f">Political entity</label>
      <div class="row2"><div><select id="e-own" ${obj.contested?'disabled':''}>
        <option value="">— none —</option>
        ${polEntities().map(en=>`<option value="${en.id}" ${en.id===obj.owner?'selected':''}>${en.name}</option>`).join('')}
        <option value="__new">+ Add new entity…</option>
      </select></div>${obj.owner&&entityById(obj.owner)&&!obj.contested?`<div style="flex:0 0 64px"><input type="color" id="e-pcol" value="${toHex6(entityById(obj.owner).color)}" title="Entity colour (affects all its planets)"></div>`:''}</div>
      <label class="toggle" style="margin-top:.3rem"><input type="checkbox" id="e-contest" ${obj.contested?'checked':''}> Contested world</label>
      ${obj.contested?`<div class="pl-list" id="e-clist">
        ${polEntities().map(en=>`<label class="toggle"><input type="checkbox" data-cid="${en.id}" ${obj.contested.includes(en.id)?'checked':''}> <span class="swatch" style="background:${en.color}"></span>${en.name}</label>`).join('')||'<div class="hint">no entities yet — create one via the dropdown above</div>'}
      </div>
      <div class="hint">${obj.contested.length>=2?'Marker divides equally between the contesting factions.':'Pick at least two contesting entities.'}</div>`:''}
      <label class="f">Region</label><div class="hint" id="e-reg" style="cursor:pointer;color:#c9a05a">${reg?reg.name:'—'}</div>
      ${(()=>{const fl=fleetsNearPlanet(obj);return `<label class="f">Fleets present (${fl.length})</label>
      <div class="pl-list">${fl.map(f=>`<div class="sr" data-fid="${f.id}">${f.name}${f.commander?' — '+f.commander:''}</div>`).join('')||'<div class="hint">none</div>'}</div>`;})()}
      <div class="row2"><div><label class="f">X</label><input type="number" id="e-x" value="${Math.round(obj.x)}"></div>
      <div><label class="f">Y</label><input type="number" id="e-y" value="${Math.round(obj.y)}"></div></div>
      <div class="toolrow" style="margin-top:.6rem"><button class="danger" id="e-del">Delete Planet</button></div>`;
    $('#e-name').onchange=e=>{snapshot();obj.name=e.target.value;renderAll();};
    $('#e-own').onchange=e=>{
      if(e.target.value==='__new'){
        const nm=prompt('New political entity name:');
        if(!nm||!nm.trim()){renderEditor();return;}
        snapshot();const en=addPolEntity(nm.trim());obj.owner=en.id;renderAll();return;
      }
      snapshot();obj.owner=e.target.value||null;renderAll();
    };
    const pc=$('#e-pcol');
    if(pc){
      pc.oninput=e=>{entityById(obj.owner).color=e.target.value;
        renderPol();renderRoutes();renderLegend();};
      pc.onchange=()=>{snapshot();};
    }
    $('#e-contest').onchange=e=>{
      snapshot();
      if(e.target.checked)obj.contested=(obj.contested&&obj.contested.length)?obj.contested:(obj.owner?[obj.owner]:[]);
      else delete obj.contested;
      renderAll();
    };
    ed.querySelectorAll('[data-cid]').forEach(n=>n.onchange=()=>{
      snapshot();
      const id=n.dataset.cid;
      obj.contested=obj.contested||[];
      if(n.checked){if(!obj.contested.includes(id))obj.contested.push(id);}
      else obj.contested=obj.contested.filter(x=>x!==id);
      renderAll();
    });
    $('#e-des').onchange=e=>{snapshot();obj.designation=e.target.value;renderAll();};
    $('#e-x').onchange=e=>{snapshot();obj.x=+e.target.value;recomputeContainment();renderAll();};
    $('#e-y').onchange=e=>{snapshot();obj.y=+e.target.value;recomputeContainment();renderAll();};
    $('#e-del').onclick=()=>deletePlanet(obj.id);
    if(reg)$('#e-reg').onclick=()=>{sel={type:'region',id:reg.id};renderAll();};
    ed.querySelectorAll('[data-fid]').forEach(n=>n.onclick=()=>{sel={type:'fleet',id:n.dataset.fid};renderAll();});
  }else if(sel.type==='route'){
    const dashes={'Stable (solid)':'none','Standard (dashed)':'10 8','Treacherous (dotted)':'2 7','Theoretical (long dash)':'22 10'};
    ed.innerHTML=`<h2>Warp Route</h2>
      <div class="hint">${planetById(obj.from)?.name||'?'} ⟶ ${planetById(obj.to)?.name||'?'} · ${obj.waypoints.length} waypoint(s)</div>
      <label class="f">Label</label><input type="text" id="e-label" value="${(obj.label||'').replace(/"/g,'&quot;')}">
      <label class="f">Political entity</label><select id="e-rown">
        <option value="">— none —</option>
        ${polEntities().map(en=>`<option value="${en.id}" ${en.id===obj.owner?'selected':''}>${en.name}</option>`).join('')}
        <option value="__new">+ Add new entity…</option>
      </select>
      <div class="row2"><div><label class="f">Colour</label><input type="color" id="e-stroke" value="${toHex6(obj.style.stroke)}"></div>
      <div><label class="f">Width</label><input type="number" id="e-width" step="0.5" min="0.5" value="${obj.style.width}"></div></div>
      <label class="f">Dash style</label><select id="e-dash">${Object.entries(dashes).map(([n,v])=>`<option value="${v}" ${v===(obj.style.dash||'none')?'selected':''}>${n}</option>`).join('')}</select>
      <label class="f">Custom dash pattern</label><input type="text" id="e-dashc" value="${obj.style.dash||''}" placeholder="e.g. 10 8">
      <label class="f">Path</label><select id="e-rpath">
        <option value="angular" ${obj.style.path!=='curved'?'selected':''}>Angular</option>
        <option value="curved" ${obj.style.path==='curved'?'selected':''}>Curved (spline through waypoints)</option>
      </select>
      <div class="toolrow" style="margin-top:.6rem"><button id="e-addwp">+ Waypoint</button><button class="danger" id="e-delr">Delete Route</button></div>
      <div class="hint">Drag handles to bend; double-click a handle to remove it.</div>`;
    $('#e-label').onchange=e=>{snapshot();obj.label=e.target.value;renderAll();};
    $('#e-rown').onchange=e=>{
      if(e.target.value==='__new'){
        const nm=prompt('New political entity name:');
        if(!nm||!nm.trim()){renderEditor();return;}
        snapshot();const en=addPolEntity(nm.trim());obj.owner=en.id;renderAll();return;
      }
      snapshot();obj.owner=e.target.value||null;renderAll();
    };
    $('#e-stroke').oninput=e=>{obj.style.stroke=e.target.value;renderAll();};
    $('#e-stroke').onchange=()=>{snapshot();};
    $('#e-width').onchange=e=>{snapshot();obj.style.width=+e.target.value;renderAll();};
    $('#e-dash').onchange=e=>{snapshot();obj.style.dash=e.target.value==='none'?'':e.target.value;renderAll();};
    $('#e-dashc').onchange=e=>{snapshot();obj.style.dash=e.target.value;renderAll();};
    $('#e-rpath').onchange=e=>{snapshot();obj.style.path=e.target.value;renderAll();};
    $('#e-addwp').onclick=()=>{snapshot();const pts=routePoints(obj);const m=Math.floor(pts.length/2);
      obj.waypoints.splice(Math.max(0,m-1),0,[(pts[m-1][0]+pts[m][0])/2,(pts[m-1][1]+pts[m][1])/2]);renderAll();};
    $('#e-delr').onclick=()=>{snapshot();DATA.routes=DATA.routes.filter(r=>r.id!==obj.id);sel=null;renderAll();};
  }else if(sel.type==='nebula'){
    ensureNebDefaults(obj);
    const b=obj.style.border;
    ed.innerHTML=`<h2>Extrasolar Feature</h2>
      <label class="f">Label (optional)</label><input type="text" id="e-nname" value="${(obj.name||'').replace(/"/g,'&quot;')}" placeholder="unnamed">
      <label class="f">Subtype</label><select id="e-nsub">${Object.entries(FEATURE_SUBTYPES).map(([v,n])=>`<option value="${v}" ${v===obj.subtype?'selected':''}>${n}</option>`).join('')}</select>
      <div class="row2"><div><label class="f">Colour</label><input type="color" id="e-ncolor" value="${toHex6(obj.style.color)}"></div>
      <div><label class="f">Hatching</label><select id="e-nfill">
        ${['stipple','hatch','crosshatch','none'].map(v=>`<option value="${v}" ${v===obj.style.fill?'selected':''}>${v[0].toUpperCase()+v.slice(1)}</option>`).join('')}
      </select></div></div>
      <label class="toggle" style="margin-top:.3rem"><input type="checkbox" id="e-nfillv" ${obj.style.fill_visible?'checked':''}> Colour fill (off = transparent, chart shows through)</label>
      <label class="f">Hatch density (fine ⟷ coarse)</label><input type="range" id="e-ndens" min="6" max="34" step="1" value="${obj.style.density}" style="width:100%">
      <label class="f">Border</label>
      <div class="row2"><div><input type="number" id="e-nbw" step="0.2" min="0" value="${b.width}" title="width"></div>
      <div><select id="e-nbd" title="dash">${['solid','dashed','dotted'].map(v=>`<option value="${v}" ${v===b.dash?'selected':''}>${v[0].toUpperCase()+v.slice(1)}</option>`).join('')}</select></div></div>
      <label class="f">Border opacity</label><input type="range" id="e-nbo" min="0" max="1" step="0.05" value="${b.opacity}" style="width:100%">
      <div class="row2" style="margin-top:.2rem"><div><label class="f">Points</label><div class="hint" style="padding-top:.45rem">${obj.pts.length}</div></div>
      <div><label class="f">Origin</label><div class="hint" style="padding-top:.45rem">${obj._provenance==='drawn_in_tool'?'drawn in tool':'traced from raster'}</div></div></div>
      <div class="toolrow" style="margin-top:.4rem"><button id="e-nsmooth">Smooth all</button><button id="e-nsharp">Sharpen all</button></div>
      <div class="toolrow" style="margin-top:.3rem"><button id="e-naddf2">+ Add Feature</button><button class="danger" id="e-ndel">Delete Feature</button></div>
      <div class="hint">Switch to Extrasolar mode (X) to reshape: drag handles, double-click the outline to add a point, Alt-click a point to remove it, drag the gold diamond to move the label.</div>`;
    $('#e-nname').onchange=e=>{snapshot();obj.name=e.target.value||null;renderAll();};
    $('#e-nsub').onchange=e=>{snapshot();obj.subtype=e.target.value;renderAll();};
    $('#e-ncolor').oninput=e=>{obj.style.color=e.target.value;renderNebulae();};
    $('#e-ncolor').onchange=()=>{snapshot();};
    $('#e-nfill').onchange=e=>{snapshot();obj.style.fill=e.target.value;renderNebulae();};
    $('#e-nfillv').onchange=e=>{snapshot();obj.style.fill_visible=e.target.checked;renderNebulae();};
    $('#e-ndens').oninput=e=>{obj.style.density=+e.target.value;renderNebulae();};
    $('#e-ndens').onchange=()=>{snapshot();};
    $('#e-nbw').onchange=e=>{snapshot();obj.style.border.width=+e.target.value;renderNebulae();};
    $('#e-nbd').onchange=e=>{snapshot();obj.style.border.dash=e.target.value;renderNebulae();};
    $('#e-nbo').oninput=e=>{obj.style.border.opacity=+e.target.value;renderNebulae();};
    $('#e-nbo').onchange=()=>{snapshot();};
    $('#e-nsmooth').onclick=()=>{
      snapshot();const old=obj.pt_smooth.slice();obj.pt_smooth=obj.pts.map(()=>1);
      if(!isSimplePts(flattenNb(obj))){obj.pt_smooth=old;undoStack.pop();flashHint('Smoothing rejected — outline would cross itself.');}
      renderAll();};
    $('#e-nsharp').onclick=()=>{snapshot();obj.pt_smooth=obj.pts.map(()=>0);renderAll();};
    $('#e-naddf2').onclick=()=>setMode('nebdraw');
    $('#e-ndel').onclick=()=>deleteNebula(obj.id);
  }else if(sel.type==='fleet'){
    obj.ships=obj.ships||[];
    ed.innerHTML=`<h2>Fleet</h2>
      <label class="f">Name</label><input type="text" id="e-fname" value="${(obj.name||'').replace(/"/g,'&quot;')}">
      <label class="f">Political entity</label><select id="e-fown">
        <option value="">— none —</option>
        ${polEntities().map(en=>`<option value="${en.id}" ${en.id===obj.owner?'selected':''}>${en.name}</option>`).join('')}
        <option value="__new">+ Add new entity…</option>
      </select>
      <label class="f">Commander</label><input type="text" id="e-fcmd" value="${(obj.commander||'').replace(/"/g,'&quot;')}" placeholder="e.g. Lord-Captain …">
      <label class="f">Voidships (${obj.ships.length})</label>
      <div class="pl-list">${obj.ships.map((s,i)=>`<div class="sr" style="display:flex;gap:.4rem">
        <span style="flex:1">${s.name} — <i>${s.cls}</i></span><span data-sdel="${i}" style="color:#e08080;cursor:pointer" title="Remove ship">✕</span></div>`).join('')||'<div class="hint">none</div>'}</div>
      <div class="row2" style="margin-top:.3rem"><div><input type="text" id="e-shipname" placeholder="Ship name"></div>
      <div><select id="e-shipcls">${SHIP_CLASSES.map(c=>`<option>${c}</option>`).join('')}</select></div></div>
      <div class="toolrow" style="margin-top:.4rem"><button id="e-shipadd">+ Add Ship</button><button class="danger" id="e-fdel">Delete Fleet</button></div>
      <div class="hint">Switch to Political mode (P) to drag the pin. The pin shows the ship count and takes its colour from the owning entity while the Political overlay is on.</div>`;
    $('#e-fname').onchange=e=>{snapshot();obj.name=e.target.value;renderAll();};
    $('#e-fown').onchange=e=>{
      if(e.target.value==='__new'){
        const nm=prompt('New political entity name:');
        if(!nm||!nm.trim()){renderEditor();return;}
        snapshot();const en=addPolEntity(nm.trim());obj.owner=en.id;renderAll();return;
      }
      snapshot();obj.owner=e.target.value||null;renderAll();
    };
    $('#e-fcmd').onchange=e=>{snapshot();obj.commander=e.target.value;dirty=true;renderFleets();};
    $('#e-shipadd').onclick=()=>{
      const nm=$('#e-shipname').value.trim();
      if(!nm){flashHint('Give the ship a name first.');return;}
      snapshot();obj.ships.push({name:nm,cls:$('#e-shipcls').value});renderAll();
    };
    $('#e-fdel').onclick=()=>deleteFleet(obj.id);
    ed.querySelectorAll('[data-sdel]').forEach(n=>n.onclick=()=>{
      snapshot();obj.ships.splice(+n.dataset.sdel,1);renderAll();});
  }else if(sel.type==='territory'){
    ensureTerrDefaults(obj);
    const ent=obj.owner?entityById(obj.owner):null;
    const within=DATA.planets.filter(p=>pointInPts(p.x,p.y,flattenNb(obj)));
    ed.innerHTML=`<h2>Territory</h2>
      <label class="f">Name (optional)</label><input type="text" id="e-tname" value="${(obj.name||'').replace(/"/g,'&quot;')}" placeholder="unnamed — not listed in legend">
      <label class="f">Political entity</label><select id="e-town">
        <option value="">— unclaimed —</option>
        ${polEntities().map(en=>`<option value="${en.id}" ${en.id===obj.owner?'selected':''}>${en.name}</option>`).join('')}
        <option value="__new">+ Add new entity…</option>
      </select>
      ${ent?`<div class="row2" style="margin-top:.3rem"><div><label class="f">Entity colour</label><input type="color" id="e-tcol" value="${toHex6(ent.color)}"></div>
      <div><label class="f">Points</label><div class="hint" style="padding-top:.45rem">${obj.pts.length}</div></div></div>`
      :`<label class="f">Points</label><div class="hint">${obj.pts.length}</div>`}
      <label class="f">Planets within (${within.length})</label>
      <div class="pl-list">${within.map(p=>`<div class="sr" data-pid="${p.id}">${p.name}</div>`).join('')||'<div class="hint">none</div>'}</div>
      <div class="toolrow" style="margin-top:.4rem"><button id="e-tsmooth">Smooth all</button><button id="e-tsharp">Sharpen all</button></div>
      <div class="toolrow" style="margin-top:.3rem"><button id="e-taddf2">+ Draw Territory</button><button class="danger" id="e-tdel">Delete Territory</button></div>
      <div class="hint">Visible whenever the Political overlay is on. Reshape here in Political mode: drag handles, Shift-click toggles corner ↔ smooth, double-click the outline to add a point, Alt-click removes one.</div>`;
    $('#e-tname').onchange=e=>{snapshot();obj.name=e.target.value.trim()||null;renderAll();};
    $('#e-town').onchange=e=>{
      if(e.target.value==='__new'){
        const nm=prompt('New political entity name:');
        if(!nm||!nm.trim()){renderEditor();return;}
        snapshot();const en=addPolEntity(nm.trim());obj.owner=en.id;renderAll();return;
      }
      snapshot();obj.owner=e.target.value||null;renderAll();
    };
    const tc=$('#e-tcol');
    if(tc){
      tc.oninput=e=>{entityById(obj.owner).color=e.target.value;renderPol();renderRoutes();renderLegend();};
      tc.onchange=()=>{snapshot();};
    }
    $('#e-tsmooth').onclick=()=>{
      snapshot();const old=obj.pt_smooth.slice();obj.pt_smooth=obj.pts.map(()=>1);
      if(!isSimplePts(flattenNb(obj))){obj.pt_smooth=old;undoStack.pop();flashHint('Smoothing rejected — outline would cross itself.');}
      renderAll();};
    $('#e-tsharp').onclick=()=>{snapshot();obj.pt_smooth=obj.pts.map(()=>0);renderAll();};
    $('#e-taddf2').onclick=()=>setMode('poldraw');
    $('#e-tdel').onclick=()=>deleteTerritory(obj.id);
    ed.querySelectorAll('[data-pid]').forEach(n=>n.onclick=()=>{sel={type:'planet',id:n.dataset.pid};renderAll();});
  }else if(sel.type==='event'){
    obj.fleets=obj.fleets||[];
    const involved=obj.fleets.map(fleetById).filter(Boolean);
    ed.innerHTML=`<h2>Event</h2>
      <label class="f">Name (optional)</label><input type="text" id="e-evname" value="${(obj.name||'').replace(/"/g,'&quot;')}" placeholder="unnamed">
      <label class="f">Category</label><select id="e-evcat">${eventCategories().map(c=>`<option value="${c.id}" ${c.id===obj.category?'selected':''}>${c.name}</option>`).join('')}</select>
      <label class="f">Involved fleets (${involved.length})</label>
      <div class="pl-list">${fleets().map(f=>{
        const en=f.owner?entityById(f.owner):null;
        return `<label class="toggle"><input type="checkbox" data-evfid="${f.id}" ${obj.fleets.includes(f.id)?'checked':''}> ${f.name}${f.commander?' — '+f.commander:''}${en?' ('+en.name+')':''}</label>`;
      }).join('')||'<div class="hint">no fleets on the map yet</div>'}</div>
      ${involved.length?`<div class="des-desc">${involved.map(f=>{
        const en=f.owner?entityById(f.owner):null;
        return `${f.name} — ${f.commander||'captain unknown'} (${en?en.name:'unaligned'})`;
      }).join(' · ')}</div>`:''}
      <label class="f">Outcome</label><textarea id="e-evout" placeholder="Description of the outcome…">${obj.outcome||''}</textarea>
      <div class="toolrow" style="margin-top:.5rem"><button id="e-evaddf2">+ Add Event</button><button class="danger" id="e-evdel">Delete Event</button></div>
      <div class="hint">Switch to Events mode (E) to drag the marker.</div>`;
    $('#e-evname').onchange=e=>{snapshot();obj.name=e.target.value.trim()||null;renderAll();};
    $('#e-evcat').onchange=e=>{snapshot();obj.category=e.target.value;renderAll();};
    $('#e-evout').onchange=e=>{snapshot();obj.outcome=e.target.value;dirty=true;};
    $('#e-evaddf2').onclick=()=>setMode('eventadd');
    $('#e-evdel').onclick=()=>deleteEvent(obj.id);
    ed.querySelectorAll('[data-evfid]').forEach(n=>n.onchange=()=>{
      snapshot();
      const id=n.dataset.evfid;
      if(n.checked){if(!obj.fleets.includes(id))obj.fleets.push(id);}
      else obj.fleets=obj.fleets.filter(x=>x!==id);
      renderAll();
    });
  }else{ /* region */
    const planets=planetsInFace(obj.id);
    ed.innerHTML=`<h2>Region</h2>
      <label class="f">Name</label><input type="text" id="e-rname" value="${(obj.name||'').replace(/"/g,'&quot;')}">
      <label class="f">Description</label><textarea id="e-rdesc">${obj.description||''}</textarea>
      <label class="f">Warp route stability</label>
      <select id="e-rstab">${STAB_LEVELS.map(s=>`<option value="${s}" ${s===obj.warp_stability?'selected':''}>${s[0].toUpperCase()+s.slice(1)}</option>`).join('')}</select>
      <div class="row2"><div><label class="f">Chart tint</label><input type="color" id="e-rtint" value="${toHex6(obj.tint||'#d9cfb8')}" ${obj.tint_enabled?'':'disabled'}></div>
      <div><label class="f">Vertices</label><div class="hint" style="padding-top:.45rem">${obj.vertices.length}</div></div></div>
      <label class="toggle" style="margin-top:.3rem"><input type="checkbox" id="e-rnotint" ${obj.tint_enabled?'checked':''}> Show chart tint</label>
      <label class="f">Planets within (${planets.length})</label>
      <div class="pl-list">${planets.map(p=>`<div class="sr" data-pid="${p.id}">${p.name} — ${desName(p.designation)}</div>`).join('')||'<div class="hint">none</div>'}</div>
      ${(()=>{const fl=fleetsInFace(obj.id);return `<label class="f">Fleets within (${fl.length})</label>
      <div class="pl-list">${fl.map(f=>`<div class="sr" data-fid="${f.id}">${f.name}${f.commander?' — '+f.commander:''}</div>`).join('')||'<div class="hint">none</div>'}</div>`;})()}
      <div class="toolrow" style="margin-top:.6rem">
        <button id="e-redit">Edit Boundaries</button>
        <button id="e-rsplit">Split Region</button>
        <button class="danger" id="e-rmerge">Merge into neighbor…</button>
      </div>
      <div class="hint">${mode==='region'
        ?'Drag the round handles to reshape (neighbors follow — boundaries always stay shared). Double-click a boundary line to add a handle; Alt-click a handle to remove it. Drag the gold diamond to move the name.'
        :'Attributes are editable here. To reshape this region’s borders, click <b>Edit Boundaries</b> (or press G).'}</div>`;
    $('#e-rname').onchange=e=>{snapshot();obj.name=e.target.value;renderAll();};
    $('#e-rdesc').onchange=e=>{snapshot();obj.description=e.target.value;dirty=true;};
    $('#e-rstab').onchange=e=>{snapshot();obj.warp_stability=e.target.value;renderAll();};
    $('#e-rtint').oninput=e=>{obj.tint=e.target.value;renderWashes();};
    $('#e-rtint').onchange=()=>{snapshot();};
    $('#e-rnotint').onchange=e=>{snapshot();obj.tint_enabled=e.target.checked;renderWashes();renderLegend();renderEditor();};
    $('#e-redit').onclick=()=>{setMode('region');renderEditor();};
    $('#e-rsplit').onclick=()=>{setMode('split');};
    $('#e-rmerge').onclick=()=>{setMode('merge');};
    ed.querySelectorAll('[data-pid]').forEach(n=>n.onclick=()=>{sel={type:'planet',id:n.dataset.pid};renderAll();});
    ed.querySelectorAll('[data-fid]').forEach(n=>n.onclick=()=>{sel={type:'fleet',id:n.dataset.fid};renderAll();});
  }
}
function toHex6(c){if(/^#[0-9a-f]{6}$/i.test(c))return c;
  const d=document.createElement('div');d.style.color=c;document.body.appendChild(d);
  const m=getComputedStyle(d).color.match(/\d+/g);d.remove();
  return m?'#'+m.slice(0,3).map(n=>(+n).toString(16).padStart(2,'0')).join(''):'#d9cfb8';}
function deleteNebula(id){
  const nb=(DATA.nebulae||[]).find(n=>n.id===id);if(!nb)return;
  if(!confirm(`Delete ${nb.name?'"'+nb.name+'"':'this feature'}?`))return;
  snapshot();
  DATA.nebulae=DATA.nebulae.filter(n=>n.id!==id);
  if(sel&&sel.type==='nebula'&&sel.id===id)sel=null;
  renderAll();
}
function deleteEvent(id){
  const ev=eventById(id);if(!ev)return;
  if(!confirm(`Delete ${ev.name?'"'+ev.name+'"':'this event'}?`))return;
  snapshot();
  DATA.events=events().filter(x=>x.id!==id);
  if(sel&&sel.type==='event'&&sel.id===id)sel=null;
  renderAll();
}
function deleteTerritory(id){
  const t=territoryById(id);if(!t)return;
  const ent=t.owner?entityById(t.owner):null;
  if(!confirm(`Delete this ${ent?ent.name+' ':''}territory?`))return;
  snapshot();
  DATA.political_territories=territories().filter(x=>x.id!==id);
  if(sel&&sel.type==='territory'&&sel.id===id)sel=null;
  renderAll();
}
function deleteFleet(id){
  const f=fleetById(id);if(!f)return;
  if(!confirm(`Delete fleet "${f.name}"${f.ships&&f.ships.length?` (${f.ships.length} ship(s))`:''}?`))return;
  snapshot();
  DATA.fleets=fleets().filter(x=>x.id!==id);
  if(sel&&sel.type==='fleet'&&sel.id===id)sel=null;
  renderAll();
}
function deletePlanet(id){
  const touching=DATA.routes.filter(r=>r.from===id||r.to===id);
  if(touching.length&&!confirm(`Deleting this planet also removes ${touching.length} route(s). Continue?`))return;
  snapshot();
  DATA.routes=DATA.routes.filter(r=>r.from!==id&&r.to!==id);
  DATA.planets=DATA.planets.filter(p=>p.id!==id);
  sel=null;recomputeContainment();renderAll();
}

/* ---------------- view transform ---------------- */
function applyView(){world.style.transform=`translate(${view.x}px,${view.y}px) scale(${view.k})`;}
function toMap(e){const r=vp.getBoundingClientRect();return{x:(e.clientX-r.left-view.x)/view.k,y:(e.clientY-r.top-view.y)/view.k};}

/* ---------------- interaction ---------------- */
let drag=null;
vp.addEventListener('mousedown',e=>{
  const pg=e.target.closest('.planet'),wp=e.target.classList.contains('waypoint')?e.target:null,
        rt=e.target.closest('.route'),vtx=e.target.classList.contains('vtx')?e.target:null,
        lblh=e.target.classList.contains('lbl-handle')?e.target:null,
        wash=e.target.classList.contains('face-wash')?e.target:null;
  const m=toMap(e);
  const fl=e.target.closest('.fleet'),evg=e.target.closest('.event');
  if(mode==='select'){
    if(wp&&sel&&sel.type==='route'){snapshot();drag={kind:'wp',i:+wp.dataset.wp};return;}
    if(evg){sel={type:'event',id:evg.dataset.id};renderAll();return;}
    if(fl){sel={type:'fleet',id:fl.dataset.id};renderAll();return;}
    if(pg){sel={type:'planet',id:pg.dataset.id};snapshot();drag={kind:'planet',id:pg.dataset.id,moved:false};renderAll();return;}
    if(rt){sel={type:'route',id:rt.dataset.id};renderAll();return;}
    if(e.target.classList.contains('neb-hit')){sel={type:'nebula',id:e.target.dataset.id};renderAll();return;}
    if(wash){sel={type:'region',id:wash.dataset.id};renderAll();return;}
    sel=null;renderAll();
    drag={kind:'pan',sx:e.clientX,sy:e.clientY,ox:view.x,oy:view.y};vp.classList.add('panning');
  }else if(mode==='events'){
    if(evg){
      sel={type:'event',id:evg.dataset.id};snapshot();
      drag={kind:'event',id:evg.dataset.id,moved:false};
      renderAll();return;
    }
    sel=null;renderAll();
    drag={kind:'pan',sx:e.clientX,sy:e.clientY,ox:view.x,oy:view.y};vp.classList.add('panning');
  }else if(mode==='eventadd'){
    snapshot();
    const id='evt_'+Date.now().toString(36);
    events().push({id,category:eventCategories()[0].id,name:null,fleets:[],outcome:'',
      x:Math.round(m.x),y:Math.round(m.y)});
    sel={type:'event',id};setMode('events');renderAll();
  }else if(mode==='fleetadd'){
    const name=prompt('Fleet name:','New Fleet');if(name===null)return;
    snapshot();
    let base=(name.toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'')||'fleet');
    let id='fleet_'+base,i=2;while(fleetById(id))id='fleet_'+base+'_'+i++;
    fleets().push({id,name:name.trim()||'New Fleet',owner:null,commander:'',ships:[],x:Math.round(m.x),y:Math.round(m.y)});
    sel={type:'fleet',id};setMode('pol');renderAll();
  }else if(mode==='region'){
    const bh=e.target.classList.contains('bend-handle')?e.target:null;
    if(bh){
      const a=+bh.dataset.a,b=+bh.dataset.b,k=edgeKey(a,b);
      if(e.altKey){ // straighten
        if(edgeCurves()[k]){snapshot();delete edgeCurves()[k];recomputeContainment();renderAll();}
        return;
      }
      snapshot();
      const cur=edgeCurves()[k];
      drag={kind:'bend',a,b,orig:cur?{cp:cur.cp.slice()}:null};
      return;
    }
    if(vtx){
      if(e.altKey){snapshot();const r=tryDeleteVertex(+vtx.dataset.vi);
        if(r){undoStack.pop();flashHint('Cannot remove handle: '+r);}else{recomputeContainment();renderAll();}return;}
      snapshot();drag={kind:'vtx',vi:+vtx.dataset.vi,orig:V(+vtx.dataset.vi).slice()};return;
    }
    if(lblh){snapshot();drag={kind:'rlabel'};return;}
    if(e.target.classList.contains('edge-hit'))return; // reserved for double-click vertex insertion
    // click selects a region; drag pans — decided on mouseup by movement
    drag={kind:'pan',sx:e.clientX,sy:e.clientY,ox:view.x,oy:view.y,moved:false,
          maybeSel:wash?wash.dataset.id:null};
    vp.classList.add('panning');
  }else if(mode==='extra'){
    const nbh=e.target.classList.contains('neb-hit')?e.target:null;
    if(vtx&&sel&&sel.type==='nebula'){
      const nb=findSel(),i=+vtx.dataset.i;
      if(e.shiftKey){ // toggle corner ↔ smooth
        snapshot();nb.pt_smooth[i]=nb.pt_smooth[i]?0:1;
        if(!isSimplePts(flattenNb(nb))){nb.pt_smooth[i]=nb.pt_smooth[i]?0:1;undoStack.pop();
          flashHint('Smoothing rejected — outline would cross itself.');}
        renderAll();return;
      }
      if(e.altKey){
        if(nb.pts.length<=3){flashHint('A feature needs at least 3 points.');return;}
        snapshot();const old=nb.pts.splice(i,1)[0];const oldS=nb.pt_smooth.splice(i,1)[0];
        if(!isSimplePts(flattenNb(nb))){nb.pts.splice(i,0,old);nb.pt_smooth.splice(i,0,oldS);undoStack.pop();flashHint('Removal rejected — outline would cross itself.');}
        renderAll();return;
      }
      snapshot();drag={kind:'nvtx',i,orig:nb.pts[i].slice()};return;
    }
    if(lblh&&sel&&sel.type==='nebula'){snapshot();drag={kind:'nlabel'};return;}
    // clicks on a boundary edge-hit are reserved for double-click vertex insertion —
    // starting a pan here would deselect on mouseup and destroy the handles mid-double-click
    if(e.target.classList.contains('edge-hit'))return;
    drag={kind:'pan',sx:e.clientX,sy:e.clientY,ox:view.x,oy:view.y,moved:false,
          maybeSelNeb:nbh?nbh.dataset.id:null};
    vp.classList.add('panning');
  }else if(mode==='nebdraw'){
    if(!pendingNeb)pendingNeb=[];
    pendingNeb.push([Math.round(m.x),Math.round(m.y)]);
    drawPendingNeb(m);
  }else if(mode==='pol'){
    const th=e.target.classList.contains('terr-hit')?e.target:null;
    if(fl){ // fleet pins live in the political layer — select & drag here
      sel={type:'fleet',id:fl.dataset.id};snapshot();
      drag={kind:'fleet',id:fl.dataset.id,moved:false};
      renderAll();return;
    }
    if(vtx&&sel&&sel.type==='territory'){
      const t=findSel(),i=+vtx.dataset.i;
      if(e.shiftKey){ // toggle corner ↔ smooth
        snapshot();t.pt_smooth[i]=t.pt_smooth[i]?0:1;
        if(!isSimplePts(flattenNb(t))){t.pt_smooth[i]=t.pt_smooth[i]?0:1;undoStack.pop();
          flashHint('Smoothing rejected — outline would cross itself.');}
        renderAll();return;
      }
      if(e.altKey){
        if(t.pts.length<=3){flashHint('A territory needs at least 3 points.');return;}
        snapshot();const old=t.pts.splice(i,1)[0];const oldS=t.pt_smooth.splice(i,1)[0];
        if(!isSimplePts(flattenNb(t))){t.pts.splice(i,0,old);t.pt_smooth.splice(i,0,oldS);undoStack.pop();flashHint('Removal rejected — outline would cross itself.');}
        renderAll();return;
      }
      snapshot();drag={kind:'tvtx',i,orig:t.pts[i].slice()};return;
    }
    if(lblh&&sel&&sel.type==='territory'){snapshot();drag={kind:'tlabel'};return;}
    // clicks on a boundary edge-hit are reserved for double-click vertex insertion —
    // starting a pan here would deselect on mouseup and destroy the handles mid-double-click
    if(e.target.classList.contains('edge-hit'))return;
    drag={kind:'pan',sx:e.clientX,sy:e.clientY,ox:view.x,oy:view.y,moved:false,
          maybeSelTerr:th?th.dataset.id:null};
    vp.classList.add('panning');
  }else if(mode==='poldraw'){
    if(!pendingTerr)pendingTerr=[];
    pendingTerr.push([Math.round(m.x),Math.round(m.y)]);
    drawPendingTerr(m);
  }else if(mode==='add'){
    const name=prompt('Planet name:','New World');if(name===null)return;
    snapshot();
    const p={id:slug(name),name,x:Math.round(m.x),y:Math.round(m.y),designation:'unclassified'};
    DATA.planets.push(p);sel={type:'planet',id:p.id};setMode('select');recomputeContainment();renderAll();
  }else if(mode==='route'){
    if(pg){
      if(!pendingRoute){pendingRoute={from:pg.dataset.id,waypoints:[]};drawPending(m);}
      else if(pg.dataset.id!==pendingRoute.from){
        snapshot();
        const id='rt_'+pendingRoute.from+'_'+pg.dataset.id+'_'+Date.now().toString(36);
        DATA.routes.push({id,from:pendingRoute.from,to:pg.dataset.id,waypoints:pendingRoute.waypoints,label:null,
          style:{stroke:'#7a5c2e',width:2.5,dash:'10 8',labelColor:'#6b5134'}});
        sel={type:'route',id};pendingRoute=null;gPendingG.innerHTML='';setMode('select');renderAll();
      }
    }else if(pendingRoute){pendingRoute.waypoints.push([m.x,m.y]);drawPending(m);}
    else{drag={kind:'pan',sx:e.clientX,sy:e.clientY,ox:view.x,oy:view.y};vp.classList.add('panning');}
  }else if(mode==='split'){
    const f=findSel();if(!f||sel.type!=='region'){setMode('region');return;}
    const edge=nearestEdgeOfFace(f,[m.x,m.y],60/Math.min(1,view.k*3));
    if(!pendingCut){
      if(!edge){flashHint('Start the cut on the region boundary.');return;}
      pendingCut={startEdge:edge,startPt:edge.pt,mids:[]};drawPendingCut(m);
    }else if(edge&&(pendingCut.mids.length>0||edge.a!==pendingCut.startEdge.a||edge.b!==pendingCut.startEdge.b)){
      snapshot();
      const err=splitFace(f,pendingCut.startEdge,pendingCut.startPt,pendingCut.mids,edge,edge.pt);
      if(err){undoStack.pop();alert('Split failed: '+err);}
      pendingCut=null;gPendingG.innerHTML='';setMode('region');
      recomputeContainment();renderAll();
    }else if(!edge&&pointInPts(m.x,m.y,flattenLoop(f))){
      pendingCut.mids.push([m.x,m.y]);drawPendingCut(m);
    }else flashHint('End the cut on another stretch of the boundary, or click inside to add a bend.');
  }else if(mode==='merge'){
    const loser=findSel();
    if(!loser||sel.type!=='region'){setMode('region');return;}
    if(wash&&wash.dataset.id!==loser.id){
      const winner=TESS.faces.find(f=>f.id===wash.dataset.id);
      if(!confirm(`Merge "${loser.name}" into "${winner.name}"? "${winner.name}" keeps its attributes; "${loser.name}" is removed.`))return;
      snapshot();
      const err=mergeFaces(loser,winner);
      if(err){undoStack.pop();alert('Merge failed: '+err);}
      else sel={type:'region',id:winner.id};
      setMode('region');recomputeContainment();renderAll();
    }else flashHint('Click the neighboring region that should absorb this one.');
  }
});
window.addEventListener('mousemove',e=>{
  if(drag){
    const m=toMap(e);
    if(drag.kind==='pan'){
      const dx=e.clientX-drag.sx,dy=e.clientY-drag.sy;
      if(Math.abs(dx)+Math.abs(dy)>4)drag.moved=true;
      view.x=drag.ox+dx;view.y=drag.oy+dy;applyView();
    }
    else if(drag.kind==='planet'){const p=planetById(drag.id);p.x=Math.round(m.x);p.y=Math.round(m.y);drag.moved=true;renderAll();}
    else if(drag.kind==='fleet'){const f=fleetById(drag.id);if(f){f.x=Math.round(m.x);f.y=Math.round(m.y);drag.moved=true;renderFleets();}}
    else if(drag.kind==='event'){const ev=eventById(drag.id);if(ev){ev.x=Math.round(m.x);ev.y=Math.round(m.y);drag.moved=true;renderEvents();}}
    else if(drag.kind==='wp'){const r=findSel();if(r){r.waypoints[drag.i]=[Math.round(m.x),Math.round(m.y)];renderAll();}}
    else if(drag.kind==='vtx'){const v=V(drag.vi);
      v[0]=Math.round(m.x*10)/10;v[1]=Math.round(m.y*10)/10;
      // a vertex on the canvas border slides along it, never off it
      if(drag.orig[0]===0||drag.orig[0]===W)v[0]=drag.orig[0];
      if(drag.orig[1]===0||drag.orig[1]===H)v[1]=drag.orig[1];
      renderWashes();renderFaces();renderHandles();}
    else if(drag.kind==='bend'){
      // quadratic through the dragged point at t=0.5: cp = 2M − (A+B)/2
      const A=V(drag.a),B=V(drag.b);
      edgeCurves()[edgeKey(drag.a,drag.b)]={cp:[Math.round((2*m.x-(A[0]+B[0])/2)*10)/10,
                                               Math.round((2*m.y-(A[1]+B[1])/2)*10)/10]};
      renderWashes();renderFaces();renderHandles();
    }
    else if(drag.kind==='rlabel'){const f=findSel();if(f){f.label.x=Math.round(m.x);f.label.y=Math.round(m.y);renderFaces();renderHandles();}}
    else if(drag.kind==='nvtx'){const nb=findSel();if(nb){nb.pts[drag.i]=[Math.round(m.x),Math.round(m.y)];renderNebulae();renderHandles();}}
    else if(drag.kind==='nlabel'){const nb=findSel();if(nb){nb.label.x=Math.round(m.x);nb.label.y=Math.round(m.y);renderNebulae();renderHandles();}}
    else if(drag.kind==='tvtx'){const t=findSel();if(t){t.pts[drag.i]=[Math.round(m.x),Math.round(m.y)];renderPol();renderHandles();}}
    else if(drag.kind==='tlabel'){const t=findSel();if(t){t.label.x=Math.round(m.x);t.label.y=Math.round(m.y);renderPol();renderHandles();}}
  }
  if(mode==='route'&&pendingRoute)drawPending(toMap(e));
  if(mode==='split'&&pendingCut)drawPendingCut(toMap(e));
  if(mode==='nebdraw'&&pendingNeb)drawPendingNeb(toMap(e));
  if(mode==='poldraw'&&pendingTerr)drawPendingTerr(toMap(e));
});
window.addEventListener('mouseup',()=>{
  if(drag){
    if(drag.kind==='pan'&&!drag.moved&&drag.maybeSel){
      sel={type:'region',id:drag.maybeSel};renderAll();
    }
    if(drag.kind==='pan'&&!drag.moved&&drag.maybeSelNeb!==undefined&&mode==='extra'){
      sel=drag.maybeSelNeb?{type:'nebula',id:drag.maybeSelNeb}:null;renderAll();
    }
    if(drag.kind==='pan'&&!drag.moved&&drag.maybeSelTerr!==undefined&&mode==='pol'){
      sel=drag.maybeSelTerr?{type:'territory',id:drag.maybeSelTerr}:null;renderAll();
    }
    if(drag.kind==='nvtx'){
      const nb=findSel();
      if(nb&&!isSimplePts(flattenNb(nb))){nb.pts[drag.i]=drag.orig;undoStack.pop();
        flashHint('Move rejected — outline would cross itself.');renderNebulae();renderHandles();}
    }
    if(drag.kind==='tvtx'){
      const t=findSel();
      if(t&&!isSimplePts(flattenNb(t))){t.pts[drag.i]=drag.orig;undoStack.pop();
        flashHint('Move rejected — outline would cross itself.');renderPol();renderHandles();}
    }
    if(drag.kind==='planet'&&!drag.moved)undoStack.pop();
    if(drag.kind==='planet'&&drag.moved)recomputeContainment();
    if(drag.kind==='fleet'&&!drag.moved)undoStack.pop();
    if(drag.kind==='event'&&!drag.moved)undoStack.pop();
    if(drag.kind==='vtx'){
      const err=validateTess(); // full invariant, not just simplicity — prevents silent corruption
      if(err){const v=V(drag.vi);v[0]=drag.orig[0];v[1]=drag.orig[1];undoStack.pop();
        flashHint('Move rejected — '+err);}
      recomputeContainment();renderAll();
    }
    if(drag.kind==='bend'){
      const k=edgeKey(drag.a,drag.b);
      const err=validateTess();
      if(err){
        if(drag.orig)edgeCurves()[k]=drag.orig;else delete edgeCurves()[k];
        undoStack.pop();flashHint('Bend rejected — '+err);
      }
      recomputeContainment();renderAll();
    }
  }
  drag=null;vp.classList.remove('panning');
});
vp.addEventListener('dblclick',e=>{
  if(mode==='nebdraw'){finishNebDraw();return;}
  if(mode==='poldraw'){finishTerrDraw();return;}
  if(e.target.classList.contains('edge-hit')&&sel&&sel.type==='territory'&&mode==='pol'){
    const m=toMap(e),i=+e.target.dataset.i,t=findSel();
    snapshot();
    const pr=projectToSeg([m.x,m.y],t.pts[i],t.pts[(i+1)%t.pts.length]);
    t.pts.splice(i+1,0,[Math.round(pr.pt[0]),Math.round(pr.pt[1])]);
    t.pt_smooth.splice(i+1,0,0);
    renderAll();return;
  }
  if(e.target.classList.contains('waypoint')&&sel&&sel.type==='route'){
    snapshot();findSel().waypoints.splice(+e.target.dataset.wp,1);renderAll();return;
  }
  if(e.target.classList.contains('edge-hit')&&sel&&sel.type==='region'&&mode==='region'){
    const m=toMap(e),a=+e.target.dataset.a,b=+e.target.dataset.b;
    snapshot();
    const pr=projectToSeg([m.x,m.y],V(a),V(b));
    insertVertexOnEdge(a,b,pr.pt);
    renderAll();return;
  }
  if(e.target.classList.contains('edge-hit')&&sel&&sel.type==='nebula'&&mode==='extra'){
    const m=toMap(e),i=+e.target.dataset.i,nb=findSel();
    snapshot();
    const pr=projectToSeg([m.x,m.y],nb.pts[i],nb.pts[(i+1)%nb.pts.length]);
    nb.pts.splice(i+1,0,[Math.round(pr.pt[0]),Math.round(pr.pt[1])]);
    nb.pt_smooth.splice(i+1,0,0);
    renderAll();
  }
});
function dedupePts(pts,eps=3){ // a finishing double-click deposits coincident points — collapse them
  const out=[];
  for(const p of pts)if(!out.length||Math.hypot(p[0]-out[out.length-1][0],p[1]-out[out.length-1][1])>eps)out.push(p);
  while(out.length>1&&Math.hypot(out[0][0]-out[out.length-1][0],out[0][1]-out[out.length-1][1])<=eps)out.pop();
  return out;
}
function drawPendingNeb(m){
  gPendingG.innerHTML='';
  if(!pendingNeb||!pendingNeb.length)return;
  const pts=[...pendingNeb,[m.x,m.y]];
  el('path',{class:'pending-line',d:'M '+pts.map(p=>p.join(' ')).join(' L ')+(pendingNeb.length>1?' Z':'')},gPendingG);
  el('circle',{cx:pendingNeb[0][0],cy:pendingNeb[0][1],r:10,fill:'#8B0000'},gPendingG);
}
function finishNebDraw(){
  if(pendingNeb)pendingNeb=dedupePts(pendingNeb);
  if(!pendingNeb||pendingNeb.length<3){flashHint('A feature needs at least 3 points — keep clicking, then double-click (or press Enter) to finish.');return;}
  if(!isSimplePts(pendingNeb)){flashHint('Outline crosses itself — adjust your points.');return;}
  snapshot();
  const id='neb_custom_'+Date.now().toString(36);
  const c=centroidPts(pendingNeb);
  DATA.nebulae=DATA.nebulae||[];
  DATA.nebulae.push({id,name:null,cls:null,subtype:'nebula',pts:pendingNeb,label:{x:Math.round(c[0]),y:Math.round(c[1])},
    style:{color:'#7a4a7e',fill:'stipple',density:13,border:{width:1.6,dash:'dashed',opacity:0.7}},
    _provenance:'drawn_in_tool'});
  pendingNeb=null;gPendingG.innerHTML='';
  sel={type:'nebula',id};setMode('extra');renderAll();
}
function drawPendingTerr(m){
  gPendingG.innerHTML='';
  if(!pendingTerr||!pendingTerr.length)return;
  const pts=[...pendingTerr,[m.x,m.y]];
  el('path',{class:'pending-line',d:'M '+pts.map(p=>p.join(' ')).join(' L ')+(pendingTerr.length>1?' Z':'')},gPendingG);
  el('circle',{cx:pendingTerr[0][0],cy:pendingTerr[0][1],r:10,fill:'#8B0000'},gPendingG);
}
function finishTerrDraw(){
  if(pendingTerr)pendingTerr=dedupePts(pendingTerr);
  if(!pendingTerr||pendingTerr.length<3){flashHint('A territory needs at least 3 points — keep clicking, then double-click (or press Enter) to finish.');return;}
  if(!isSimplePts(pendingTerr)){flashHint('Outline crosses itself — adjust your points.');return;}
  snapshot();
  const id='terr_'+Date.now().toString(36);
  const c=centroidPts(pendingTerr);
  territories().push({id,owner:null,pts:pendingTerr,pt_smooth:pendingTerr.map(()=>0),
    label:{x:Math.round(c[0]),y:Math.round(c[1])},_provenance:'drawn_in_tool'});
  pendingTerr=null;gPendingG.innerHTML='';
  sel={type:'territory',id};setMode('pol');renderAll();
}
vp.addEventListener('wheel',e=>{
  e.preventDefault();
  const r=vp.getBoundingClientRect(),mx=e.clientX-r.left,my=e.clientY-r.top;
  const k2=Math.min(8,Math.max(0.1,view.k*(e.deltaY<0?1.18:1/1.18)));
  view.x=mx-(mx-view.x)*(k2/view.k);view.y=my-(my-view.y)*(k2/view.k);view.k=k2;applyView();
},{passive:false});

function drawPending(m){
  gPendingG.innerHTML='';
  if(!pendingRoute)return;
  const a=planetById(pendingRoute.from);
  const pts=[[a.x,a.y],...pendingRoute.waypoints,[m.x,m.y]];
  el('path',{class:'pending-line',d:'M '+pts.map(p=>p.join(' ')).join(' L ')},gPendingG);
}
function drawPendingCut(m){
  gPendingG.innerHTML='';
  if(!pendingCut)return;
  const pts=[pendingCut.startPt,...pendingCut.mids,[m.x,m.y]];
  el('path',{class:'pending-line',d:'M '+pts.map(p=>p.join(' ')).join(' L ')},gPendingG);
  el('circle',{cx:pendingCut.startPt[0],cy:pendingCut.startPt[1],r:10,fill:'#8B0000'},gPendingG);
}

/* ---------------- modes / keys ---------------- */
const HINTS={select:'Click a planet, route, or region to edit its attributes. Drag empty space to pan, wheel to zoom.',
  add:'Click on the chart to place a new planet.',
  route:'Click origin planet → optional waypoints → destination planet. Esc cancels.',
  region:'Click a region to select it. Drag round handles to reshape (neighbors follow); drag the square mid-edge handles to bow a border into a curve (Alt-click to straighten). Double-click a boundary to add a handle; Alt-click a round handle to remove it. Drag the gold diamond to move the name.',
  split:'Click a point on the selected region’s boundary, optionally click inside to bend the cut, then click another boundary point to divide the region. Esc cancels.',
  merge:'Click the neighboring region that should absorb the selected one. Esc cancels.',
  extra:'Click a feature to select it. Drag handles to reshape; Shift-click a handle to toggle corner ↔ smooth (square = corner, round = smooth); double-click the outline to add a point; Alt-click a point to remove it; drag the gold diamond to move the label.',
  nebdraw:'Click to lay down the outline of the new feature; double-click or press Enter to finish (3+ points). Esc cancels.',
  fleetadd:'Click on the chart to plant the new fleet’s pin. Esc cancels.',
  pol:'Click a territory or fleet pin to select it. Drag fleet pins to reposition; drag territory handles to reshape (Shift-click toggles corner ↔ smooth, double-click adds a point, Alt-click removes one). “Draw Territory” and “Add Fleet” are in the editor panel.',
  events:'Click an event marker to select it; drag to reposition. “Add Event” in the editor panel places a new marker.',
  eventadd:'Click on the chart to place the event marker. Esc cancels.',
  poldraw:'Click to outline the territory of control; double-click or press Enter to finish (3+ points). Esc cancels.'};
function flashHint(s){const h=$('#mode-hint');h.textContent=s;h.style.color='#FFD700';setTimeout(()=>{h.style.color='';h.textContent=HINTS[mode];},2600);}
function setMode(m2){
  mode=m2;pendingRoute=null;pendingCut=null;pendingNeb=null;gPendingG.innerHTML='';
  for(const b of['select','add','route','region','extra','pol','event'])$('#m-'+b).classList.toggle('active',
    b===m2||(b==='region'&&(m2==='split'||m2==='merge'))||(b==='extra'&&m2==='nebdraw')
    ||(b==='pol'&&(m2==='poldraw'||m2==='fleetadd'))||(b==='event'&&(m2==='events'||m2==='eventadd')));
  vp.className=m2==='select'?'':'mode-'+m2;
  $('#mode-hint').textContent=HINTS[m2];
  $('#sec-chart').style.display=m2==='select'?'':'none';
  $('#sec-find').style.display=m2==='select'?'':'none';
  renderAll(); // layer visibility depends on mode (planets/regions/nebulae force-shown while edited)
}
$('#m-select').onclick=()=>setMode('select');
$('#m-add').onclick=()=>setMode('add');
$('#m-route').onclick=()=>setMode('route');
$('#m-region').onclick=()=>setMode('region');
$('#m-extra').onclick=()=>setMode('extra');
$('#m-pol').onclick=()=>setMode('pol');
$('#m-event').onclick=()=>setMode('events');
window.addEventListener('keydown',e=>{
  if(e.target.tagName==='INPUT'||e.target.tagName==='SELECT'||e.target.tagName==='TEXTAREA')return;
  if(e.key==='Escape'){
    if(mode==='split'||mode==='merge')setMode('region');
    else if(mode==='nebdraw')setMode('extra');
    else if(mode==='fleetadd')setMode('pol');
    else if(mode==='poldraw')setMode('pol');
    else if(mode==='eventadd')setMode('events');
    else{setMode('select');sel=null;}
    renderAll();
  }
  if(e.key==='Enter'&&mode==='nebdraw'){finishNebDraw();return;}
  if(e.key==='Enter'&&mode==='poldraw'){finishTerrDraw();return;}
  if(e.key==='v'||e.key==='V')setMode('select');
  if(e.key==='a'||e.key==='A')setMode('add');
  if(e.key==='r'||e.key==='R')setMode('route');
  if(e.key==='g'||e.key==='G')setMode('region');
  if(e.key==='x'||e.key==='X')setMode('extra');
  if(e.key==='p'||e.key==='P')setMode('pol');
  if(e.key==='e'||e.key==='E')setMode('events');
  if((e.ctrlKey||e.metaKey)&&e.key==='z'){e.preventDefault();undo();}
  if(e.key==='Delete'&&sel){
    if(sel.type==='planet')deletePlanet(sel.id);
    else if(sel.type==='route'){snapshot();DATA.routes=DATA.routes.filter(r=>r.id!==sel.id);sel=null;renderAll();}
    else if(sel.type==='nebula')deleteNebula(sel.id);
    else if(sel.type==='fleet')deleteFleet(sel.id);
    else if(sel.type==='territory')deleteTerritory(sel.id);
    else if(sel.type==='event')deleteEvent(sel.id);
    else flashHint('Remove a region by merging it into a neighbor.');
  }
  if(sel&&sel.type==='planet'&&e.key.startsWith('Arrow')){
    e.preventDefault();snapshot();const p=findSel(),d=e.shiftKey?10:2;
    if(e.key==='ArrowUp')p.y-=d;if(e.key==='ArrowDown')p.y+=d;
    if(e.key==='ArrowLeft')p.x-=d;if(e.key==='ArrowRight')p.x+=d;
    recomputeContainment();renderAll();
  }
});

/* ---------------- search / layers / io ---------------- */
$('#search').oninput=e=>{
  const q=e.target.value.toLowerCase(),box=$('#search-results');box.innerHTML='';
  if(!q)return;
  const hits=[];
  for(const p of DATA.planets)if(p.name.toLowerCase().includes(q))hits.push({n:`${p.name} — ${desName(p.designation)}`,go:()=>{sel={type:'planet',id:p.id};center(p.x,p.y);}});
  for(const f of TESS.faces)if((f.name||'').toLowerCase().includes(q))hits.push({n:`${f.name} (region)`,go:()=>{sel={type:'region',id:f.id};const c=faceCentroid(f);center(c[0],c[1],0.45);}});
  for(const nb of (DATA.nebulae||[]))if((nb.name||'').toLowerCase().includes(q))hits.push({n:`${nb.name} (${(FEATURE_SUBTYPES[nb.subtype||'nebula']||'feature').toLowerCase()})`,go:()=>{sel={type:'nebula',id:nb.id};const c=centroidPts(nb.pts);center(c[0],c[1],0.5);}});
  for(const f of fleets())if((f.name||'').toLowerCase().includes(q)||(f.commander||'').toLowerCase().includes(q))hits.push({n:`${f.name} (fleet)`,go:()=>{sel={type:'fleet',id:f.id};center(f.x,f.y);}});
  for(const ev of events())if((ev.name||'').toLowerCase().includes(q))hits.push({n:`${ev.name} (${eventCatName(ev.category).toLowerCase()})`,go:()=>{sel={type:'event',id:ev.id};center(ev.x,ev.y);}});
  for(const h of hits.slice(0,12)){
    const d=document.createElement('div');d.className='sr';d.textContent=h.n;d.onclick=()=>{h.go();renderAll();};box.appendChild(d);
  }
};
function center(x,y,k){const r=vp.getBoundingClientRect();view.k=k||Math.max(view.k,0.9);
  view.x=r.width/2-x*view.k;view.y=r.height/2-y*view.k;applyView();}
for(const id of['ly-routes','ly-labels','ly-nebulae','ly-regions','ly-events'])$('#'+id).onchange=renderAll;
$('#ly-stab').onchange=()=>{DATA.render.stability_tint_enabled=$('#ly-stab').checked;dirty=true;renderAll();};
$('#ly-pol').onchange=()=>{DATA.render.political_overlay_enabled=$('#ly-pol').checked;dirty=true;renderAll();};
$('#ly-grid').onchange=()=>{DATA.render.extended_grid_enabled=$('#ly-grid').checked;dirty=true;renderAll();};
for(const [sid,key] of [['op-stab','stability'],['op-reg','regions'],['op-pol','political'],
                        ['op-pla','planets'],['op-rt','routes'],['op-neb','features'],['op-grid','grid']]){
  const s=$('#'+sid);
  s.oninput=()=>{layerOpacity()[key]=+s.value;applyLayerOpacity();};
  s.onchange=()=>{dirty=true;renderAll();};
}
$('#tl-compare').onchange=e=>{
  diffCompareId=e.target.value||null;
  renderAll();
};
$('#b-adddate').onclick=()=>{
  const nm=prompt('Imperial date for the new map state (e.g. 3 456 817.M41):');
  if(!nm||!nm.trim())return;
  syncCurrentDate(); // the new date starts as a copy of the current state
  const id='date_'+Date.now().toString(36);
  timeline().push({id,date:nm.trim(),state:captureState()});
  DATA.current_date_id=id;
  sel=null;undoStack.length=0;dirty=true;
  renderAll();
};
$('#b-undo').onclick=undo;
$('#b-export').onclick=()=>{
  const err=validateTess();
  if(err&&!confirm('Tessellation check failed: '+err+'\nExport anyway?'))return;
  syncCurrentDate(); // stored timeline states stay current with the live map
  const out=JSON.parse(JSON.stringify(DATA));
  compactVertices(out);
  out.version=(()=>{const v=out.version.split('.');v[2]=+v[2]+1;return v.join('.')})();
  out.compiled=new Date().toISOString().slice(0,10);
  const blob=new Blob([JSON.stringify(out,null,2)],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='patavian_reach.json';a.click();
  dirty=false;renderAll();
};
$('#b-import').onclick=()=>$('#file-import').click();
$('#file-import').onchange=e=>{
  const f=e.target.files[0];if(!f)return;
  f.text().then(t=>{
    const o=JSON.parse(t);
    if(!o.planets||!o.routes||!o.tessellation){alert('Not a valid v0.2 map file.');return;}
    snapshot();Object.assign(DATA,o);Object.assign(TESS,DATA.tessellation);
    snapFrameVertices(); // heal off-border drift in imported files
    ensureTimeline();
    sel=null;recomputeContainment();renderAll();
  });
};

/* ---------------- collapsible sidebar sections ---------------- */
$('#panel-scroll').addEventListener('click',e=>{
  const h=e.target.closest('h2');
  if(!h)return;
  const sec=h.parentElement;
  if(sec&&sec.classList.contains('sec'))sec.classList.toggle('collapsed');
});

/* ---------------- hover info card (Select mode) ---------------- */
const hovercard=$('#hovercard');
let hoverKey=null;
function hoverInfo(t){
  if(!t||!t.closest)return null;
  const pg=t.closest('.planet');
  if(pg){
    const p=planetById(pg.dataset.id);if(!p)return null;
    const reg=TESS.faces.find(f=>f.id===containment[p.id]);
    const ent=p.owner?entityById(p.owner):null;
    const fl=fleetsNearPlanet(p);
    const c=corpusById[p.designation];
    const cs=contestants(p);
    return {key:'p'+p.id,title:p.name,rows:[
      desName(p.designation)+(c&&c.greek_class?` (Classis ${c.greek_class})`:''),
      reg?'Region: '+reg.name:null,
      cs.length>=2?'Contested by '+cs.map(e2=>e2.name).join(', '):(ent?'Held by '+ent.name:null),
      fl.length?'Fleets present: '+fl.map(f=>f.name).join(', '):null]};
  }
  const evg=t.closest('.event');
  if(evg){
    const ev=eventById(evg.dataset.id);if(!ev)return null;
    const involved=(ev.fleets||[]).map(fleetById).filter(Boolean);
    return {key:'e'+ev.id,title:ev.name||eventCatName(ev.category),rows:[
      ev.name?eventCatName(ev.category):null,
      ...involved.map(f=>{
        const en=f.owner?entityById(f.owner):null;
        return f.name+' — '+(f.commander||'captain unknown')+(en?' ('+en.name+')':'');
      }),
      ev.outcome?(ev.outcome.length>110?ev.outcome.slice(0,110)+'…':ev.outcome):null]};
  }
  const flg=t.closest('.fleet');
  if(flg){
    const f=fleetById(flg.dataset.id);if(!f)return null;
    const ent=f.owner?entityById(f.owner):null;
    const ships=f.ships||[],byCls={};
    for(const s of ships)byCls[s.cls]=(byCls[s.cls]||0)+1;
    return {key:'f'+f.id,title:f.name,rows:[
      f.commander?'Commander: '+f.commander:null,
      ent?'Allegiance: '+ent.name:null,
      ships.length?ships.length+' voidship(s) — '+Object.entries(byCls).map(([c,n])=>n+'× '+c).join(', '):'No voidships attached']};
  }
  if(t.classList.contains('neb-hit')){
    const nb=(DATA.nebulae||[]).find(n=>n.id===t.dataset.id);if(!nb)return null;
    return {key:'n'+nb.id,title:nb.name||'Uncharted phenomenon',rows:[
      FEATURE_SUBTYPES[nb.subtype||'nebula']||'Extrasolar feature',
      nb._provenance==='drawn_in_tool'?'Charted in-tool':'Traced from survey raster']};
  }
  const rt=t.closest('.route');
  if(rt){
    const r=DATA.routes.find(x=>x.id===rt.dataset.id);if(!r)return null;
    const ent=r.owner?entityById(r.owner):null;
    return {key:'r'+r.id,title:r.label||'Warp route',rows:[
      (planetById(r.from)?.name||'?')+' ⟶ '+(planetById(r.to)?.name||'?'),
      ent?'Controlled by '+ent.name:null,
      r.style.path==='curved'?'Charted as spline':null]};
  }
  if(t.classList.contains('face-wash')){
    const f=TESS.faces.find(x=>x.id===t.dataset.id);if(!f)return null;
    const pl=planetsInFace(f.id),flz=fleetsInFace(f.id);
    return {key:'g'+f.id,title:f.name||'Unnamed region',rows:[
      'Warp stability: '+(f.warp_stability||'unknown'),
      pl.length+' planet(s) · '+flz.length+' fleet(s)']};
  }
  return null;
}
vp.addEventListener('mousemove',e=>{
  if(mode!=='select'||drag){hovercard.style.display='none';hoverKey=null;return;}
  const info=hoverInfo(e.target);
  if(!info){hovercard.style.display='none';hoverKey=null;return;}
  if(info.key!==hoverKey){
    hoverKey=info.key;
    hovercard.innerHTML='';
    const t=document.createElement('div');t.className='hc-title';t.textContent=info.title;hovercard.appendChild(t);
    for(const r of info.rows.filter(Boolean)){
      const d2=document.createElement('div');d2.className='hc-row';d2.textContent=r;hovercard.appendChild(d2);
    }
  }
  const r=vp.getBoundingClientRect();
  let x=e.clientX-r.left+16,y=e.clientY-r.top+16;
  hovercard.style.display='block';
  const cw=hovercard.offsetWidth||0,ch=hovercard.offsetHeight||0;
  if(x+cw>r.width-8)x=Math.max(8,e.clientX-r.left-cw-12);
  if(y+ch>r.height-8)y=Math.max(8,e.clientY-r.top-ch-12);
  hovercard.style.left=x+'px';hovercard.style.top=y+'px';
});
vp.addEventListener('mouseleave',()=>{hovercard.style.display='none';hoverKey=null;});

/* ---------------- boot ---------------- */
buildStatic();
$('#ly-stab').checked=!!DATA.render.stability_tint_enabled;
$('#ly-pol').checked=!!DATA.render.political_overlay_enabled;
$('#ly-grid').checked=!!DATA.render.extended_grid_enabled;
{const o=layerOpacity();$('#op-stab').value=o.stability;$('#op-reg').value=o.regions;$('#op-pol').value=o.political;
 $('#op-pla').value=o.planets;$('#op-rt').value=o.routes;$('#op-neb').value=o.features;$('#op-grid').value=o.grid;}
ensureTimeline();
recomputeContainment();
{const r=vp.getBoundingClientRect();
 view.k=Math.min(r.width/W,r.height/H)*0.98;
 view.x=(r.width-W*view.k)/2;view.y=(r.height-H*view.k)/2;}
applyView();
setMode('select');
renderAll();
let bootErr=validateTess();
if(bootErr&&snapFrameVertices()){ // self-repair: snap drifted border vertices, then re-check
  bootErr=validateTess();
  recomputeContainment();renderAll();
}
if(bootErr){
  console.warn('Tessellation warning:',bootErr);
  flashHint('Map data warning: '+bootErr);
}
