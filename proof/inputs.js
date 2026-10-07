const q=new URLSearchParams(location.search);
const chosen=Number(q.get('height'));
const D=Math.PI/180,el=11*D,r=28.52;
// Exact resting DayBuoy pose, including its off-axis horizon composition.
export const CAMERA={x:0,y:4.56+Math.sin(el)*r,z:Math.cos(el)*r,pitch:-el,yaw:0,fov:2*Math.atan(.59)/D,shear:.59*(1-2*.23)-Math.tan(el),bearing:201};
export const TEST={feet:[1,3,5].includes(chosen)?chosen:3,period:8,tide:0,windKnots:8,cloudCover:.2,date:'2026-10-05T12:00:00-05:00'};
export const PIN='4811ba48d795197de5621985f404e765c0b7c0ef';
