export function areaDefaults(item){
 const s=item.system,match=String(s.aoe||'').match(/(\d+)\s*[x×]\s*(\d+)/i);
 const arc=String(s.arc||'').trim().toLowerCase();
 const explicit=s.templateShape&&s.templateShape!=='auto'?s.templateShape:null;
 return {shape:explicit??(match?'rectangle':arc==='cone'?'cone':['straight','line','ray'].includes(arc)?'line':'single'),width:match?Number(match[1]):Number(s.templateWidth)||1,height:match?Number(match[2]):Number(s.templateHeight)||1,angle:Number(s.templateAngle)||90};
}
export function attackShapeLabel(item){
 const s=item.system,d=areaDefaults(item),arc=String(s.arc||'360');
 return `Arc: ${arc}; area: ${s.aoe||d.shape}`;
}
export function buildAttackShape({shape,length,width=1,height=1,angle=90,direction=0},size){
 const n=v=>Number.isFinite(Number(v))&&Number(v)>0;
 if(!n(size)||!n(length)||!n(width)||!n(height))throw Error('Template dimensions must be positive.');
 if(!Number.isFinite(Number(direction))||!n(angle)||angle>180)throw Error('Use a finite direction and cone angle between 1 and 180 degrees.');
 const r=Number(direction)*Math.PI/180,cos=Math.cos(r),sin=Math.sin(r);
 const point=(x,y)=>[x*cos-y*sin,x*sin+y*cos];
 const polygon=points=>({type:'polygon',hole:false,points:points.flatMap(([x,y])=>point(x,y))});
 if(shape==='single')return {type:'rectangle',x:0,y:0,width:size,height:size,rotation:0};
 if(shape==='rectangle')return {type:'rectangle',x:0,y:0,width:width*size,height:height*size,rotation:Number(direction)};
 if(shape==='circle')return {type:'circle',x:0,y:0,radius:length*size,gridBased:true};
 if(shape==='line'){const w=width*size/2,l=length*size;return polygon([[0,-w],[l,-w],[l,w],[0,w]]);}
 if(shape==='cone'){
  const radius=length*size,half=Number(angle)*Math.PI/360,points=[[0,0]];
  for(let i=0;i<=32;i++){const a=-half+2*half*i/32;points.push([radius*Math.cos(a),radius*Math.sin(a)]);}
  return polygon(points);
 }
 throw Error('Unsupported attack shape.');
}
