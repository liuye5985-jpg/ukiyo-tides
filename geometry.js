// Editable, responsive Bauhaus composition. No image or camera data leaves the browser.
const PAPER='#eee9dc',INK='#202322',TAU=Math.PI*2;
export const palettes=[['#234f83','#427ba5','#cf442c','#d6ad37'],['#183d48','#5c8d91','#c05b40','#d5b66a'],['#393e78','#747cab','#c94738','#dfb94a']];
const limit=(v,a,b)=>Math.max(a,Math.min(b,v));
export function layout(w,h){const portrait=w/h<.8;const W=portrait?900:1440,H=portrait?1440:900,s=Math.min(w/W,h/H);return {portrait,W,H,s,x:(w-W*s)/2,y:(h-H*s)/2};}
export function toArt(x,y,l){return {x:(x-l.x)/l.s,y:(y-l.y)/l.s};}
export function snap(v,grid=24){return Math.round(v/grid)*grid;}
function shapeSet(p){return p?[
 {id:'wave',x:365,y:735,r:305},{id:'sun',x:726,y:346,r:70},{id:'mountain',x:750,y:940,r:135},{id:'boat',x:566,y:1020,r:110}
]:[{id:'wave',x:375,y:525,r:315},{id:'sun',x:1160,y:302,r:76},{id:'mountain',x:1090,y:534,r:145},{id:'boat',x:840,y:576,r:100}];}
export class GeometricScene{
 constructor(onNote,onChange){this.onNote=onNote;this.onChange=onChange;this.mode=1;this.palette=0;this.points=new Map();this.pulses=[];this.beat=0;this.nextBeat=0;this.lastManual=-1e5;this.hover=null;this.raised=false;this.reset();}
 reset(){this.pieces=shapeSet(this.l?.portrait||false).map(p=>({...p,homeX:p.x,homeY:p.y,scale:1,angle:0,pulse:0}));this.points.clear();this.drag=null;this.pulses=[];this.palette=0;this.beat=0;this.nextBeat=0;}
 resize(w,h){this.vw=w;this.vh=h;const next=layout(w,h);if(!this.l||next.portrait!==this.l.portrait){this.l=next;this.reset();}else this.l=next;}
 setMode(mode){this.mode=mode;this.points.clear();this.drag=null;this.nextBeat=0;this.onChange?.(mode);}
 cyclePalette(){this.palette=(this.palette+1)%palettes.length;this.pieces.forEach(p=>p.pulse=1);}
 hit(p){return [...this.pieces].reverse().find(s=>Math.hypot(p.x-s.x,p.y-s.y)<s.r*s.scale*1.12);}
 down(e,x,y){this.lastManual=performance.now();const p=toArt(x,y,this.l);this.points.set(e.pointerId,p);if(this.points.size===1){this.drag=this.hit(p)||null;if(this.drag){this.offset={x:p.x-this.drag.x,y:p.y-this.drag.y};this.drag.pulse=1;this.play(this.drag);}}if(this.points.size===2&&this.drag){const [a,b]=[...this.points.values()];this.pinch={distance:Math.max(1,Math.hypot(a.x-b.x,a.y-b.y)),angle:Math.atan2(b.y-a.y,b.x-a.x),scale:this.drag.scale,rotation:this.drag.angle};}}
 move(e,x,y){const p=toArt(x,y,this.l);this.hover=this.hit(p)?.id||null;if(!this.points.has(e.pointerId))return;this.lastManual=performance.now();this.points.set(e.pointerId,p);if(!this.drag||this.mode===3)return;if(this.points.size>=2&&this.pinch){const [a,b]=[...this.points.values()];this.drag.scale=limit(this.pinch.scale*Math.hypot(a.x-b.x,a.y-b.y)/this.pinch.distance,.55,1.6);this.drag.angle=this.pinch.rotation+Math.atan2(b.y-a.y,b.x-a.x)-this.pinch.angle;}else{this.drag.x=limit(p.x-this.offset.x,60,this.l.W-60);this.drag.y=limit(p.y-this.offset.y,230,this.l.H-100);}}
 up(e){this.points.delete(e.pointerId);if(!this.points.size){if(this.drag&&this.mode===2){this.drag.x=snap(this.drag.x);this.drag.y=snap(this.drag.y);this.drag.angle=Math.round(this.drag.angle/(Math.PI/12))*Math.PI/12;}this.drag=null;this.pinch=null;}else if(this.drag){const p=[...this.points.values()][0];this.offset={x:p.x-this.drag.x,y:p.y-this.drag.y};}}
 wheel(e){if(!this.hover)return;const p=this.pieces.find(s=>s.id===this.hover);this.lastManual=performance.now();if(e.shiftKey)p.angle+=e.deltaY*.002;else p.scale=limit(p.scale-e.deltaY*.001,.55,1.6);}
 play(piece){piece.pulse=1;this.pulses.push({x:piece.x,y:piece.y,r:piece.r*.3,life:1});if(this.pulses.length>16)this.pulses.shift();const pitch={wave:.7,sun:.1,mountain:.35,boat:.5}[piece.id];this.onNote?.(pitch);}
 update(dt,t,input){if(!this.l)return;for(const p of this.pieces)p.pulse=Math.max(0,p.pulse-dt*1.8);for(const p of this.pulses){p.r+=dt*130;p.life-=dt*.9;}this.pulses=this.pulses.filter(p=>p.life>0);
  if(input.tracking&&this.mode!==2&&performance.now()-this.lastManual>2000){const sun=this.pieces[1],boat=this.pieces[3];const a=toArt(input.hands[0].x*this.vw,input.hands[0].y*this.vh,this.l);const b=toArt(input.hands[1].x*this.vw,input.hands[1].y*this.vh,this.l);sun.x+=(limit(a.x,70,this.l.W-70)-sun.x)*.05;sun.y+=(limit(a.y,240,this.l.H-160)-sun.y)*.05;boat.x+=(limit(b.x,80,this.l.W-80)-boat.x)*.05;boat.y+=(limit(b.y,280,this.l.H-160)-boat.y)*.05;this.pieces[0].scale+=(.85+input.open*.45-this.pieces[0].scale)*.035;this.pieces[2].angle+=(limit((input.hands[1].y-input.hands[0].y)*1.4,-.5,.5)-this.pieces[2].angle)*.06;
   if(input.light>.7&&!this.raised){this.cyclePalette();this.pieces.forEach(p=>this.play(p));this.raised=true;}if(input.light<.3)this.raised=false;
  }
  if(this.mode===3&&t>=this.nextBeat){const order=[0,3,2,1,0,2,3,1];this.play(this.pieces[order[this.beat++%8]]);this.nextBeat=t+60/(70+input.energy*90+input.open*30);}
 }
 draw(canvas,t,input){if(!this.l)return;const {W,H,portrait}=this.l;if(canvas.width!==W||canvas.height!==H){canvas.width=W;canvas.height=H;}const c=canvas.getContext('2d');const [blue,pale,red,yellow]=palettes[this.palette];c.fillStyle=PAPER;c.fillRect(0,0,W,H);
  c.strokeStyle='#20232230';c.lineWidth=1;c.strokeRect(60,60,W-120,H-120);c.beginPath();c.moveTo(60,portrait?260:222);c.lineTo(W-60,portrait?260:222);c.moveTo(portrait?620:920,60);c.lineTo(portrait?620:920,H-60);c.stroke();
  c.fillStyle=INK;c.font='19px Helvetica, Arial, sans-serif';c.fillText('UKIYO / TIDES',92,portrait?128:113);c.font='800 78px Helvetica, Arial, sans-serif';c.fillText('WAVE STUDY',88,portrait?216:190);
  if(this.mode===2){c.strokeStyle='#20232212';for(let x=84;x<W-60;x+=48){c.beginPath();c.moveTo(x,portrait?285:245);c.lineTo(x,H-80);c.stroke();}for(let y=portrait?308:270;y<H-80;y+=48){c.beginPath();c.moveTo(80,y);c.lineTo(W-60,y);c.stroke();}}
  const horizon=portrait?1084:660;c.fillStyle=INK;c.fillRect(60,horizon,W-120,portrait?36:27);c.fillStyle=pale;c.fillRect(60,horizon+66,W-120,portrait?86:72);c.fillStyle=blue;c.fillRect(portrait?365:690,horizon+66,W-(portrait?425:750),portrait?86:72);c.fillStyle=INK;c.fillRect(60,portrait?1266:808,W-120,portrait?24:14);
  for(const p of this.pieces){c.save();c.translate(p.x,p.y);c.rotate(p.angle+(this.mode===1&&p.id==='wave'?Math.sin(t*.55)*input.energy*.04:0));const k=p.scale*(1+p.pulse*.08);c.scale(k,k);
   if(p.id==='wave'){const r=p.r,inner=r-110;c.fillStyle=blue;c.beginPath();c.arc(0,0,r,Math.PI,TAU);c.arc(0,0,inner,0,Math.PI,true);c.closePath();c.fill();const leg=portrait?349:135;c.fillRect(-r,0,110,leg);c.fillRect(inner,0,110,portrait?305:135);c.fillStyle=INK;c.beginPath();c.arc(0,0,108,Math.PI,TAU);c.lineTo(108,89);c.lineTo(0,89);c.lineTo(0,0);c.closePath();c.fill();c.strokeStyle=PAPER;c.lineWidth=3;for(let i=0;i<5;i++){c.beginPath();const rad=r-33-i*21;c.arc(0,0,rad,Math.PI+p.pulse*i*.025,TAU-p.pulse*.25);c.stroke();}}
   if(p.id==='sun'){c.fillStyle=red;c.beginPath();c.arc(0,0,p.r,0,TAU);c.fill();c.strokeStyle=INK;c.lineWidth=1.5;c.beginPath();c.arc(0,0,p.r+12+p.pulse*25,0,TAU);if(p.pulse>.02)c.stroke();}
   if(p.id==='mountain'){c.fillStyle=yellow;c.beginPath();c.moveTo(-p.r,126);c.lineTo(0,-126);c.lineTo(p.r,126);c.closePath();c.fill();c.fillStyle=PAPER;c.beginPath();c.moveTo(-38,-62);c.lineTo(0,-126);c.lineTo(38,-62);c.fill();}
   if(p.id==='boat'){c.fillStyle=red;c.beginPath();c.moveTo(-p.r,-10);c.lineTo(p.r,-10);c.lineTo(p.r-26,12);c.lineTo(-p.r+26,12);c.closePath();c.fill();}
   if(this.mode===2&&(this.hover===p.id||this.drag===p)){c.strokeStyle=red;c.lineWidth=2;c.setLineDash([8,8]);c.strokeRect(-p.r-15,-p.r-15,p.r*2+30,p.r*2+30);c.setLineDash([]);c.font='14px Helvetica,Arial';c.fillStyle=INK;c.fillText(p.id.toUpperCase(),-p.r,-p.r-24);}
   c.restore();
  }
  for(const p of this.pulses){c.globalAlpha=p.life*.5;c.strokeStyle=red;c.lineWidth=2;c.beginPath();c.arc(p.x,p.y,p.r,0,TAU);c.stroke();c.globalAlpha=1;}
  c.fillStyle=INK;c.font='15px Helvetica,Arial';c.fillText(portrait?'HOKUSAI / 1830—1833':'MOTION / FORM / SEA',portrait?92:744,portrait?1350:620);c.font='700 32px Helvetica,Arial';c.fillText('0'+this.mode,W-150,portrait?H-85:111);
 }
}
