// Liquid glass renderer and audio modules reused from liquid-glass.html.
/* eslint-disable */
// Preserve the familiar 70 = 1x anchor while extending both speed extremes.
// C1 continuous at 70: both branches have slope 1.5/70; 0 stays exactly static.
function motionRate(speed){
 const value=Math.max(0,Math.min(100,speed));
 if(value<=70){const t=value/70;return .5*t+.5*t*t;}
 const x=(value-70)/30;return 1+(9/14)*x+(61/14)*x*x;
}
// Both geometry consumers share this mapping, including silhouette rounding.
const effectiveLiquid=value=>.6*value/100;
const DEFAULTS = {width:100,height:60,radius:30,blur:14,highlight:65,reflection:38,refraction:45,opacity:88,dispersion:35,glow:60,liquid:22,speed:70,hue1:270,hue2:185,hue3:25,glowBlend:'overlay',glowMix:75,deformationMode:'liquid'};
const BLEND_MODES=['overlay','screen','add','soft-light','normal'];
const VERTEX = `attribute vec2 aPosition; varying vec2 vUv; void main(){vUv=aPosition*.5+.5;gl_Position=vec4(aPosition,0.,1.);}`;
const BACKGROUND_FRAGMENT = `precision highp float;
varying vec2 vUv;
uniform vec2 uResolution,uImageSize;
uniform sampler2D uBackground;
uniform float uHasBackground,uScene,uPixel;
float sat(float x){return clamp(x,0.,1.);}
float sdRound(vec2 p,vec2 b,float r){vec2 q=abs(p)-b+r;return length(max(q,0.))+min(max(q.x,q.y),0.)-r;}
float line(float d,float w){return 1.-smoothstep(w,w+uPixel*1.4,abs(d));}
vec3 backdrop(vec2 p){
 if(uHasBackground>.5){
  // Centered CSS cover mapping in the same coordinates as every optical sample.
  float unit=min(uResolution.x,uResolution.y);
  float cover=max(uResolution.x/uImageSize.x,uResolution.y/uImageSize.y);
  vec2 uv=.5+p*unit/(uImageSize*cover);
  return texture2D(uBackground,clamp(uv,vec2(0.),vec2(1.))).rgb;
 }
 float t=0.; vec3 c;
 if(uScene<.5){
  c=vec3(.025,.034,.07);
  c+=vec3(.12,.05,.32)*exp(-2.7*dot(p-vec2(-.35,.22),p-vec2(-.35,.22)));
  c+=vec3(.04,.23,.24)*exp(-6.*dot(p-vec2(.42,-.23),p-vec2(.42,-.23)));
  float band=p.y-.16*sin(p.x*2.8+t*.12)-.14;
  c+=vec3(.21,.21,.62)*exp(-80.*band*band)*exp(-.7*p.x*p.x);
  float ribbon=p.x*.77+p.y-.07;
  c+=vec3(.28,.54,.34)*exp(-90.*ribbon*ribbon)*exp(-.8*dot(p,p));
  float ring=abs(length(p-vec2(.38,.16))-.31);
  c+=vec3(.40,.72,.61)*(.72*line(ring,.002));
  float orb=length(p-vec2(-.32,-.13));
  c=mix(c,vec3(.44,.32,.83)*(1.-orb*.8),1.-smoothstep(.077,.082,orb));
  c+=vec3(.14,.19,.29)*line(p.y+.30,.0015)*(1.-smoothstep(.55,.65,abs(p.x)));
 }else if(uScene<1.5){
  c=vec3(.89,.88,.83)+vec3(.05,.06,.07)*p.y;
  float ring=length(p-vec2(.28,.08));
  c=mix(c,vec3(.32,.42,.33),1.-smoothstep(.19,.195,ring));
  c=mix(c,vec3(.87,.88,.77),1.-smoothstep(.115,.12,ring));
  float stripe=p.x+p.y*.55+.18;
  c=mix(c,vec3(.60,.64,.77),1.-smoothstep(.07,.075,abs(stripe)));
  float ball=length(p-vec2(-.23,-.21));
  c=mix(c,vec3(.89,.49,.26)+.12*p.y,1.-smoothstep(.12,.125,ball));
  c-=.035*(1.-smoothstep(.001,.003,abs(fract(p.y*8.)-.5)));
 }else if(uScene<2.5){
  vec2 cell=floor(p*10.); float check=mod(cell.x+cell.y,2.);
  c=mix(vec3(.075,.09,.12),vec3(.15,.18,.22),check);
  vec2 g=abs(fract(p*10.)-.5);
  c+=vec3(.06,.09,.12)*(smoothstep(.475,.495,max(g.x,g.y)));
  c+=vec3(.29,.67,.61)*line(p.x+p.y*.55,.005);
  c+=vec3(.44,.29,.71)*line(length(p)-.29,.004);
 }else{
  c=mix(vec3(.23,.075,.16),vec3(.91,.43,.28),sat(p.y+.55));
  c+=vec3(.35,.19,.025)*exp(-5.*dot(p-vec2(.3,.15),p-vec2(.3,.15)));
  float sun=length(p-vec2(.22,.12));
  c=mix(c,vec3(1.,.79,.39),1.-smoothstep(.18,.184,sun));
  float wave=p.y+.15+.07*sin(p.x*4.+.7);
  c=mix(c,vec3(.52,.19,.22),1.-smoothstep(-.008,.008,wave));
  float wave2=p.y+.29+.05*sin(p.x*5.-.6);
  c=mix(c,vec3(.26,.10,.21),1.-smoothstep(-.008,.008,wave2));
  c+=vec3(.23,.10,.05)*line(p.x*.25+p.y+.015,.002);
 }
 return c;
}
void main(){vec2 p=(vUv-.5)*uResolution/min(uResolution.x,uResolution.y);gl_FragColor=vec4(clamp(backdrop(p),0.,1.),1.);}
`;
const DOWNSAMPLE_FRAGMENT = `precision highp float;
varying vec2 vUv;
uniform sampler2D uSource;
uniform vec2 uFootprint;
void main(){
 vec2 d=uFootprint*.25;
 vec3 c=texture2D(uSource,vUv+vec2(-d.x,-d.y)).rgb;
 c+=texture2D(uSource,vUv+vec2(d.x,-d.y)).rgb;
 c+=texture2D(uSource,vUv+vec2(-d.x,d.y)).rgb;
 c+=texture2D(uSource,vUv+d).rgb;
 gl_FragColor=vec4(c*.25,1.);
}`;
const GAUSSIAN_FRAGMENT = `precision highp float;
varying vec2 vUv;
uniform sampler2D uSource;
uniform vec2 uStep;
uniform float uSigma;
void main(){
 if(uSigma<.08){gl_FragColor=texture2D(uSource,vUv);return;}
 float sigma=max(uSigma,.08); float total=1.;
 vec3 color=texture2D(uSource,vUv).rgb;
 // Contiguous texel taps cover +/- 3 standard deviations; there are no sparse duplicate images.
 for(int i=1;i<=24;i++){
  float x=float(i);
  if(x<=ceil(sigma*3.)){
   float w=exp(-.5*x*x/(sigma*sigma));
   vec2 offset=uStep*x;
   color+=(texture2D(uSource,clamp(vUv+offset,vec2(0.),vec2(1.))).rgb+texture2D(uSource,clamp(vUv-offset,vec2(0.),vec2(1.))).rgb)*w;
   total+=2.*w;
  }
 }
 gl_FragColor=vec4(color/total,1.);
}
`;
const FRAGMENT = `precision highp float;
varying vec2 vUv;
uniform vec2 uResolution,uShape,uCenter;
uniform sampler2D uSharp,uBlurred;
uniform vec3 uHues,uTransientMotion,uModeWeights;
uniform float uEdgeGlowOnly,uTailPolarityOffset;
uniform float uRadius,uTime,uScene,uHighlight,uReflection,uRefraction,uOpacity,uDispersion,uGlow,uLiquid,uPixel,uAmplitude,uGlowBlend,uGlowMix;
float sat(float x){return clamp(x,0.,1.);}
float stableLength(vec2 v){float m=max(max(abs(v.x),abs(v.y)),.00001);return length(v/m)*m;}
float sdRound(vec2 p,vec2 b,float r){vec2 q=abs(p)-b+r;return stableLength(max(q,0.))+min(max(q.x,q.y),0.)-r;}
// Physical arc-distance shoulders: bubbles retain a round footprint on long panes.
vec2 bubbleShoulder(vec2 direction,vec2 tangent,vec2 ratio,float angle){
 vec2 delta=(direction-vec2(cos(angle),sin(angle)))*ratio;
 if(stableLength(delta)>4.)return vec2(0.);
 float weight=exp(-1.7*dot(delta,delta));
 return vec2(weight,-3.4*dot(delta,tangent*ratio)*weight);
}
// A separable, invertible neck map: two rounded reservoirs pull apart while
// a connected waist narrows. Cross-section scale remains strictly positive.
void adhesiveGeometry(vec2 p,out vec2 point,out mat2 jacobian){
 bool tall=uShape.y>uShape.x;
 vec2 q=tall?p.yx:p,halfSize=(tall?uShape.yx:uShape)*.5;
 float cycle=.5-.5*cos(uTime*1.65);
 float pull=(1.-exp(-3.*uLiquid*uAmplitude))*uModeWeights.z*(.18+.82*cycle);
 float stretch=1.+.65*pull,k=q.x/(halfSize.x*stretch);
 float shoulder=min(abs(k)/.8,1.),s=shoulder*shoulder;
 float bulb=s*s*s*(10.-15.*s+6.*s*s),slope=0.;
 if(abs(k)<.8)slope=30.*s*s*(1.-s)*(1.-s)*2.*k/(.64*halfSize.x*stretch);
 float profile=1.+pull*(.98*bulb-.68),derivative=pull*.98*slope;
 vec2 mapped=vec2(q.x/stretch,q.y/profile);
 mat2 local=mat2(vec2(1./stretch,-q.y*derivative/(profile*profile)),vec2(0.,1./profile));
 point=tall?mapped.yx:mapped;
 jacobian=tall?mat2(local[1].yx,local[0].yx):local;
}
// A star-shaped radial map in pane-normalized coordinates. Its angular lobes
// have the same relative curvature at 10 px and 1000 px. Positive radius and a
// monotone radial shoulder prevent folds; the origin remains the fixed anchor.
void liquidGeometry(vec2 p,out vec2 point,out mat2 jacobian){
 // Affine stretch followed by a radial tail is globally invertible.
 // Motion direction is already converted from CSS down to GL up by the API.
 vec2 travel=uTransientMotion.xy;float movement=uTransientMotion.z;
 float along=1./(1.+movement*1.1),across=1.+movement*.6;
 mat2 motion=mat2(vec2(across,0.),vec2(0.,across))+(along-across)*mat2(travel*travel.x,travel*travel.y);
 p=motion*p;
 mat2 adhesive;vec2 pulled;adhesiveGeometry(p,pulled,adhesive);p=pulled;
 motion=adhesive*motion;
 vec2 halfSize=uShape*.5,n=p/halfSize;
 float radial=stableLength(n),amount=uLiquid*uAmplitude;
 float areaScale=inversesqrt(1.+amount*amount*.0117);
 float radius=areaScale;vec2 radiusGradient=vec2(0.);
 if(radial>.0001){
  vec2 direction=n/radial;
  float angle=atan(direction.y,direction.x),t=uTime;
  float a=angle*3.+t*.71,b=angle*5.-t*.53+.8,c=angle*2.+t*.37-1.1;
  float lobes=.13*sin(a)+.07*sin(b)+.04*cos(c);
  float angular=.39*cos(a)+.35*cos(b)-.08*sin(c);
  float classicLobes=lobes,classicAngular=angular;
  {
   vec2 tangent=vec2(-direction.y,direction.x),ratio=halfSize/min(halfSize.x,halfSize.y);
   float physicalRadius=stableLength(direction*ratio),roundScale=1./physicalRadius;
   float roundSlope=-dot(direction*ratio/physicalRadius,tangent*ratio/physicalRadius)/physicalRadius;
   vec2 bubbles=.90*bubbleShoulder(direction,tangent,ratio,t*.55)+.75*bubbleShoulder(direction,tangent,ratio,-t*.39+2.3)+.60*bubbleShoulder(direction,tangent,ratio,t*.31-1.8)-vec2(.09,0.);
   lobes=bubbles.x*roundScale;
   angular=bubbles.y*roundScale+bubbles.x*roundSlope;
  }
  float sphericalLobes=lobes,sphericalAngular=angular;
  {
   float a1=2.*angle-t*.61,a2=3.*angle+t*.39+.7;
   lobes=0.;
   angular=0.;
  }
  lobes=dot(uModeWeights,vec3(classicLobes,sphericalLobes,lobes));
  angular=dot(uModeWeights,vec3(classicAngular,sphericalAngular,angular));
  // A rear-weighted radial extension makes a viscous, joined trailing shoulder.
  vec2 localTravel=travel/halfSize;float travelLength=stableLength(localTravel);
  float rear=dot(direction,localTravel/max(travelLength,.00001));
  float rearAngular=dot(vec2(-direction.y,direction.x),localTravel/max(travelLength,.00001));
  // The stretch axis is unoriented; only the odd tail component reverses.
  // Offset zero retains the original signed-direction API and shader defaults.
  float tail=.08*movement*(1.-rear)*(1.-rear);
  float tailAngular=-.16*movement*(1.-rear)*rearAngular;
  if(uTailPolarityOffset==-2.){
   tail=.08*movement*(1.+rear)*(1.+rear);
   tailAngular=.16*movement*(1.+rear)*rearAngular;
  }else if(uTailPolarityOffset!=0.){
   tail-=.16*movement*rear*uTailPolarityOffset;
   tailAngular-=.16*movement*rearAngular*uTailPolarityOffset;
  }
  float shoulder=min(radial/.55,1.);
  float gate=shoulder*shoulder*(3.-2.*shoulder);
  float slope=radial<.55?6.*shoulder*(1.-shoulder)/.55:0.;
  radius=areaScale*(1.+gate*(amount*lobes+tail));
  radiusGradient=areaScale*(slope*(amount*lobes+tail)*direction+(gate/radial)*(amount*angular+tailAngular)*vec2(-direction.y,direction.x))/halfSize;
 }
 point=p/radius;
 vec2 scaled=p/(radius*radius);
 jacobian=mat2(vec2(1./radius,0.)-scaled*radiusGradient.x,vec2(0.,1./radius)-scaled*radiusGradient.y)*motion;
}
vec2 warpedPoint(vec2 p){vec2 point;mat2 jacobian;liquidGeometry(p,point,jacobian);return point;}
float puddleMix(){float base=uLiquid*uLiquid*(3.-2.*uLiquid);return mix(base,1.,uModeWeights.z*(1.-exp(-3.*uLiquid))*.7);}
float shape(vec2 p){
 vec2 point=warpedPoint(p),halfSize=uShape*.5;
 float rounded=sdRound(point,halfSize,uRadius);
 float ellipse=(stableLength(point/halfSize)-1.)*min(halfSize.x,halfSize.y);
 return mix(rounded,ellipse,puddleMix());
}
// sqrt(x*x+1) without overflowing mediump for high-aspect-ratio panes.
// Scale only large arguments, keeping the normal-size arithmetic unchanged.
vec2 smoothRoot(vec2 x){
 vec2 scale=max(abs(x)/64.,vec2(1.));
 vec2 v=x/scale,one=1./scale;
 return scale*sqrt(v*v+one*one);
}
float smoothRoot(float x){return smoothRoot(vec2(x,0.)).x;}
vec3 opticalSurface(vec2 p,float smoothing){
 // The exact SDF is only silhouette geometry: its nearest-edge gradient jumps
 // on the medial axis. Use a differentiable rounded-box heightfield for optics.
 // Smooth abs/max/positive-part operations give one continuous surface, including
 // zero slope at its center, rather than normalizing an undefined 2D direction.
 // Evaluate in smoothing-width units to keep squared terms in mediump range,
 // including panes fitted down to a narrow mobile viewport.
 vec2 point;mat2 jacobian;liquidGeometry(p,point,jacobian);
 vec2 w=point/smoothing;
 vec2 a=smoothRoot(w);
 vec2 q=a-uShape*.5/smoothing+uRadius/smoothing;
 vec2 root=smoothRoot(q);
 vec2 positive=.5*(q+root);
 float outside=max(max(positive.x,positive.y)>64.?stableLength(positive):length(positive),.00001);
 float difference=q.x-q.y;
 float diagonal=smoothRoot(difference);
 // Avoid subtracting nearly equal large terms on extremely long, thin panes.
 float maximum=abs(difference)>64.?max(q.x,q.y)+.5/(diagonal+abs(difference)):.5*(q.x+q.y+diagonal);
 float interiorRoot=smoothRoot(maximum);
 float distance=(outside+.5*(maximum-interiorRoot))*smoothing-uRadius;
 vec2 maximumGradient=.5*(vec2(1.)+vec2(difference,-difference)/diagonal);
 vec2 g=(positive/outside)*.5*(vec2(1.)+q/root)+.5*(1.-maximum/interiorRoot)*maximumGradient;
 g*=w/a;
 // The progressively rounded puddle has a smooth elliptical heightfield.
 // Both silhouette components and their analytic gradients share the same map.
 vec2 halfSize=uShape*.5,ellipsePoint=point/halfSize;
 float halfMin=min(halfSize.x,halfSize.y),soft=smoothing/halfMin;
 float ellipseRoot=stableLength(vec2(stableLength(ellipsePoint),soft));
 vec2 ellipseGradient=ellipsePoint/max(ellipseRoot,.00001)/halfSize*halfMin;
 float ellipseDistance=(ellipseRoot-1.)*halfMin;
 float blend=puddleMix();
 g=mix(g,ellipseGradient,blend);
 distance=mix(distance,ellipseDistance,blend);
 // Chain rule through the identical radial deformation, without finite differences.
 return vec3(dot(g,jacobian[0]),dot(g,jacobian[1]),distance);
}
vec3 opticalSample(vec2 p){
 vec2 uv=.5+p*min(uResolution.x,uResolution.y)/uResolution;
 return texture2D(uBlurred,clamp(uv,vec2(0.),vec2(1.))).rgb;
}
vec3 hueColor(float hue){
 vec3 k=abs(fract(vec3(hue)+vec3(0.,2./3.,1./3.))*6.-3.);
 return mix(vec3(.035),vec3(1.),clamp(k-1.,0.,1.));
}
vec3 blendLight(vec3 base,vec3 light){
 base=clamp(base,0.,1.);light=clamp(light,0.,1.);
 if(uGlowBlend<.5)return mix(2.*base*light,1.-2.*(1.-base)*(1.-light),step(vec3(.5),base));
 if(uGlowBlend<1.5)return 1.-(1.-base)*(1.-light);
 if(uGlowBlend<2.5)return min(base+light,vec3(1.));
 if(uGlowBlend<3.5){
  vec3 low=base-(1.-2.*light)*base*(1.-base);
  vec3 d=mix(((16.*base-12.)*base+4.)*base,sqrt(max(base,vec3(0.))),step(vec3(.25),base));
  vec3 high=base+(2.*light-1.)*(d-base);
  return mix(low,high,step(vec3(.5),light));
 }
 return light;
}
vec3 transmittedLight(vec3 base,vec2 p){
 vec2 q=p/max(uShape*.5,vec2(.025)); float t=uTime;
 // Three lights actually travel through the pane. Independent, nonmatching paths
 // cross and separate naturally; no hue, intensity or size is animated.
 // Audio amplitude only expands the paths; the existing clock controls speed.
 vec2 c1=uAmplitude*vec2(.72*sin(t*.78-.75)+.10*sin(t*1.23+.4),.62*cos(t*.61+.8)+.08*sin(t*.97));
 vec2 c2=uAmplitude*vec2(.73*sin(t*.67+1.55)+.10*cos(t*1.11),.61*sin(t*.83-.5)+.08*cos(t*.73+1.5));
 vec2 c3=uAmplitude*vec2(.71*sin(t*.74-.65)+.10*sin(t*.93),.62*sin(t*.69+4.)+.08*cos(t*1.17+.7));
 vec2 a=(q-c1)*vec2(.95,1.08),b=(q-c2)*vec2(1.08,.95),c=(q-c3)*vec2(.96,1.06);
 // Localized Gaussian shoulders keep each moving light legible but soft.
 float w1=exp(-3.4*dot(a,a)),w2=exp(-3.4*dot(b,b)),w3=exp(-3.4*dot(c,c));
 vec3 light=(hueColor(uHues.x)*w1+hueColor(uHues.y)*w2+hueColor(uHues.z)*w3)/max(w1+w2+w3,.001);
 float coverage=1.-exp(-1.8*(w1+w2+w3));
 float rim=exp(-abs(shape(p))/max(min(uShape.x,uShape.y)*.055,uPixel*2.));
 float strength=clamp(uGlow*uGlowMix*1.9,0.,1.)*coverage*mix(1.,rim,uEdgeGlowOnly);
 // The image covers the transmitted field in card mode. A restrained radiance
 // at the exposed rim preserves moving colored light, even on dark backdrops.
 // Coverage and hue still come from the same three moving lights, never a flat border.
 vec3 radiance=light*(uEdgeGlowOnly*rim*coverage*uGlow*uGlowMix*.42);
 return mix(base,blendLight(base,light),strength)+radiance;
}
void main(){
 float unit=min(uResolution.x,uResolution.y);
 // Geometry and lighting use pane-local coordinates; texture samples stay in world space.
 vec2 world=(vUv-.5)*uResolution/unit;
 vec2 p=world-uCenter;
 // Overlay mode: the canvas sits above the page, so everything outside the pane
 // and its shadow is transparent. Far pixels skip the silhouette entirely.
 vec2 reach=uShape*.75+vec2(.1);
 if(abs(p.x)>reach.x||abs(p.y)>reach.y){gl_FragColor=vec4(0.);return;}
 float d=shape(p); float aa=uPixel*1.2;
 float shadow=exp(-max(shape(p-vec2(.012,-.022)),0.)*35.)*.23;
 vec4 outColor=vec4(0.,0.,0.,shadow);
 
 if(d<aa*2.){
  // Keep the original bevel on normal panes; thin panes need a proportionate
  // surface depth so opposite bevels settle into a flat, continuous interior.
  float bevelWidth=min(1./32.,min(uShape.x,uShape.y)*.15);
  vec3 surface=opticalSurface(p,bevelWidth*.65);
  vec2 gradient=surface.xy;
  float normalScale=max(abs(gradient.x),abs(gradient.y));
  vec2 n=normalScale>64.?gradient*(1.41421356/smoothRoot(stableLength(gradient))):gradient*inversesqrt(1.+dot(gradient,gradient))*1.41421356;
  float inside=max(-d,0.);
  float opticalDepth=surface.z/bevelWidth;
  // Subpixel fitted panes can put an AA sample far outside the optical surface.
  // Bound exponential tails before mediump overflows, even when its mask is zero.
  float edge=exp(min(opticalDepth*(55./32.),10.));
  float bevel=exp(min(opticalDepth,6.));
  // This is the gradient of the smooth exponential bevel heightfield. Refraction
  // and chromatic separation share it and naturally tend to zero at the center.
  // Thickness follows bevel width too: a 60 px pane must not refract by the
  // same absolute 50 px as a full-size pane and fold across its own center.
  vec2 transport=gradient*bevel*(bevelWidth*32.);
  vec2 refracted=uCenter+p*(1.-uRefraction*.10)-transport*(.006+uRefraction*.065);
  vec3 glass=opticalSample(refracted);
  vec2 split=transport*uDispersion*.014*1.2;
  glass.r=mix(glass.r,opticalSample(refracted+split).r,uDispersion);
  glass.b=mix(glass.b,opticalSample(refracted-split).b,uDispersion);
  vec3 tint=uScene>0.5&&uScene<1.5?vec3(.96,.98,1.):vec3(.72,.84,.93);
  glass=mix(glass,tint,1.-uOpacity);
  glass=transmittedLight(glass,p);
  float key=pow(sat(dot(n,normalize(vec2(-.65,.85)))),5.);
  float rim=pow(sat(dot(n,normalize(vec2(.8,-.5)))),8.);
  float reflectionA=(p.y-p.x*.43-.14)*8.;
  float reflection=exp(-reflectionA*reflectionA)*.16;
  float reflectionB=(p.y+p.x*.25+.2)*26.;
  reflection+=exp(-reflectionB*reflectionB)*.045;
  glass+=uReflection*reflection*vec3(.79,.88,1.);
  glass+=uHighlight*(key*.65+rim*.46+.06)*edge*vec3(.84,.93,1.);
  glass-=bevel*.10*(1.-key);
  float thin=exp(-inside*220.);
  glass+=thin*(.10+uHighlight*.4)*(key+rim+.18);
  float noise=fract(sin(dot(mod(gl_FragCoord.xy,vec2(128.)),vec2(12.9898,78.233)))*43758.5453)-.5;
  glass+=noise*.003;
  outColor=mix(outColor,vec4(clamp(glass,0.,1.),1.),1.-smoothstep(-aa,aa,d));
 }
 gl_FragColor=outColor;
}`;

class GlassRenderer {
 constructor(canvas,onStatus=()=>{}){
  this.canvas=canvas; this.onStatus=onStatus; this.params={...DEFAULTS}; this.scene='aurora'; this.playing=true; this.quality='auto'; this._scale=1; this._fps=60; this._time=0; this._last=0; this._frames=0; this._sampleStart=0; this._disposed=false; this._lost=false; this._backgroundVersion=0; this._backgroundSource=null; this._backgroundTexture=null; this._targets=[];this._backgroundDirty=true;this._blurDirty=true;this._motionResponse={speedMultiplier:1,amplitudeMultiplier:1};this._position={x:.5,y:.5};this._transientMotion={x:1,y:0,amount:0};this._morphMotion={x:1,y:0,amount:0};this._edgeGlowOnly=0;this._modeWeights=[1,0,0];this._modeTransition=null;
  this._motion=window.matchMedia('(prefers-reduced-motion: reduce)'); this._reduced=this._motion.matches;this.playing=!this._reduced;
  this._onMotion=()=>{this._reduced=this._motion.matches;if(this._reduced)this.playing=false;this._last=0;this.renderOnce();this._schedule();};
  this._motion.addEventListener?.('change',this._onMotion);
  this._onVisibility=()=>{this._last=0;this._frames=0;this._sampleStart=0;if(!document.hidden)this._schedule();};document.addEventListener('visibilitychange',this._onVisibility);
  this._onLost=e=>{e.preventDefault();this._lost=true;cancelAnimationFrame(this._raf);this._raf=0;this.onStatus({type:'lost',message:'图形上下文已暂停，正在等待恢复'});};
  this._onRestored=()=>{this._lost=false;try{this._init();this._resize();this._schedule();this.onStatus({type:'restored',message:'WebGL 已恢复'});}catch(e){this.onStatus({type:'error',message:e.message});}};
  canvas.addEventListener('webglcontextlost',this._onLost);canvas.addEventListener('webglcontextrestored',this._onRestored);
  this._init();
  this._observer=typeof ResizeObserver!=='undefined'?new ResizeObserver(()=>this._resize()):null;this._observer?.observe(canvas);
  this._onResize=()=>this._resize();window.addEventListener('resize',this._onResize);this._resize();this._schedule();
 }
 _init(){
  const gl=this.canvas.getContext('webgl',{alpha:true,premultipliedAlpha:true,antialias:false,depth:false,stencil:false,preserveDrawingBuffer:false,powerPreference:'low-power'})||this.canvas.getContext('experimental-webgl',{alpha:true,premultipliedAlpha:true});
  if(!gl)throw new Error('此浏览器暂不支持 WebGL，请开启硬件加速后重试。');this.gl=gl;
  const precision=gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER,gl.HIGH_FLOAT);this._highp=!!(precision&&precision.precision>0);
  const make=(fragment,names)=>{
   const compile=(type,source)=>{const shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){const message=gl.getShaderInfoLog(shader);gl.deleteShader(shader);throw new Error('着色器编译失败：'+message);}return shader;};
   const vs=compile(gl.VERTEX_SHADER,VERTEX),fs=compile(gl.FRAGMENT_SHADER,this._highp?fragment:fragment.replace('precision highp float','precision mediump float'));
   const program=gl.createProgram();gl.attachShader(program,vs);gl.attachShader(program,fs);gl.bindAttribLocation(program,0,'aPosition');gl.linkProgram(program);gl.deleteShader(vs);gl.deleteShader(fs);
   if(!gl.getProgramParameter(program,gl.LINK_STATUS)){const message=gl.getProgramInfoLog(program);gl.deleteProgram(program);throw new Error('图形程序初始化失败：'+message);}
   const u={};for(const name of names)u[name]=gl.getUniformLocation(program,'u'+name);return {program,u};
  };
  this._backgroundPass=make(BACKGROUND_FRAGMENT,['Resolution','ImageSize','Background','HasBackground','Scene','Pixel']);
  this._downsamplePass=make(DOWNSAMPLE_FRAGMENT,['Source','Footprint']);
  this._gaussianPass=make(GAUSSIAN_FRAGMENT,['Source','Step','Sigma']);
  this._glassPass=make(FRAGMENT,['Resolution','Shape','Center','Radius','Time','Scene','Highlight','Reflection','Refraction','Opacity','Dispersion','Glow','Liquid','Pixel','Sharp','Blurred','Hues','Amplitude','GlowBlend','GlowMix','ModeWeights','TransientMotion','EdgeGlowOnly','TailPolarityOffset']);
  this.program=this._glassPass.program;this.uniforms=this._glassPass.u;
  this.buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,this.buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
  this._targets=[];this._backgroundDirty=true;this._blurDirty=true;this._backgroundTexture=this._createBackgroundTexture(this._backgroundSource);
  this.onStatus({type:'ready',message:'WebGL · 多通道高斯渲染'});
 }
 _deleteTargets(){if(this.gl&&!this._lost)for(const target of this._targets){this.gl.deleteTexture(target.texture);this.gl.deleteFramebuffer(target.framebuffer);}this._targets=[];}
 _target(width,height){
  const gl=this.gl,texture=gl.createTexture(),framebuffer=gl.createFramebuffer();gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,texture);
  for(const name of [gl.TEXTURE_WRAP_S,gl.TEXTURE_WRAP_T])gl.texParameteri(gl.TEXTURE_2D,name,gl.CLAMP_TO_EDGE);
  for(const name of [gl.TEXTURE_MIN_FILTER,gl.TEXTURE_MAG_FILTER])gl.texParameteri(gl.TEXTURE_2D,name,gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,width,height,0,gl.RGBA,gl.UNSIGNED_BYTE,null);gl.bindFramebuffer(gl.FRAMEBUFFER,framebuffer);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,texture,0);
  if(gl.checkFramebufferStatus(gl.FRAMEBUFFER)!==gl.FRAMEBUFFER_COMPLETE){gl.deleteTexture(texture);gl.deleteFramebuffer(framebuffer);throw new Error('无法建立高斯模糊渲染缓冲区，请尝试低画质。');}
  const target={texture,framebuffer,width,height};this._targets.push(target);return target;
 }
 _prepareTargets(){
  const w=this.canvas.width,h=this.canvas.height,sigma=this.params.blur*w/(this.cssWidth||1);
  const factor=Math.max(1,sigma/8),bw=Math.max(1,Math.ceil(w/factor)),bh=Math.max(1,Math.ceil(h/factor));
  if(!this._sharpTarget||this._sharpTarget.width!==w||this._sharpTarget.height!==h||this._blurTarget?.width!==bw||this._blurTarget?.height!==bh||!this._targets.length){
   this._deleteTargets();this._sharpTarget=this._target(w,h);this._downsampleTargets=[];
   let sw=w,sh=h;
   while(sw>bw||sh>bh){sw=Math.max(bw,Math.ceil(sw/2));sh=Math.max(bh,Math.ceil(sh/2));this._downsampleTargets.push(this._target(sw,sh));}
   this._horizontalTarget=this._target(bw,bh);this._blurTarget=this._target(bw,bh);this._backgroundDirty=true;this._blurDirty=true;
  }
  this._sigma=sigma;
 }
 _drawPass(pass,target){const gl=this.gl;gl.useProgram(pass.program);gl.bindFramebuffer(gl.FRAMEBUFFER,target?target.framebuffer:null);gl.viewport(0,0,target?target.width:this.canvas.width,target?target.height:this.canvas.height);}
 _bindTexture(texture,unit){const gl=this.gl;gl.activeTexture(gl.TEXTURE0+unit);gl.bindTexture(gl.TEXTURE_2D,texture);}
 _renderBackground(){
  const gl=this.gl,pass=this._backgroundPass,u=pass.u;this._drawPass(pass,this._sharpTarget);this._bindTexture(this._backgroundTexture,0);gl.uniform1i(u.Background,0);gl.uniform1f(u.HasBackground,this._backgroundSource?1:0);gl.uniform2f(u.ImageSize,this._backgroundSource?.naturalWidth||this._backgroundSource?.width||1,this._backgroundSource?.naturalHeight||this._backgroundSource?.height||1);gl.uniform2f(u.Resolution,this.canvas.width,this.canvas.height);gl.uniform1f(u.Scene,['aurora','studio','grid','sunset'].indexOf(this.scene));gl.uniform1f(u.Pixel,1/Math.min(this.canvas.width,this.canvas.height));gl.drawArrays(gl.TRIANGLES,0,6);this._backgroundDirty=false;this._blurDirty=true;
 }
 _renderGaussian(){
  if(this.params.blur<=.02){this._blurDirty=false;return;}
  const gl=this.gl,pass=this._gaussianPass,u=pass.u,w=this.canvas.width,h=this.canvas.height,bw=this._blurTarget.width,bh=this._blurTarget.height;
  let source=this._sharpTarget;
  for(const target of this._downsampleTargets){const down=this._downsamplePass;this._drawPass(down,target);this._bindTexture(source.texture,0);gl.uniform1i(down.u.Source,0);gl.uniform2f(down.u.Footprint,1/target.width,1/target.height);gl.drawArrays(gl.TRIANGLES,0,6);source=target;}
  this._drawPass(pass,this._horizontalTarget);this._bindTexture(source.texture,0);gl.uniform1i(u.Source,0);gl.uniform2f(u.Step,1/bw,0);gl.uniform1f(u.Sigma,Math.min(8,this._sigma*bw/w));gl.drawArrays(gl.TRIANGLES,0,6);
  this._drawPass(pass,this._blurTarget);this._bindTexture(this._horizontalTarget.texture,0);gl.uniform1i(u.Source,0);gl.uniform2f(u.Step,0,1/bh);gl.uniform1f(u.Sigma,Math.min(8,this._sigma*bh/h));gl.drawArrays(gl.TRIANGLES,0,6);this._blurDirty=false;
 }
 _resize(){if(this._disposed||this._lost)return;const r=this.canvas.getBoundingClientRect();this.cssWidth=Math.max(1,r.width);this.cssHeight=Math.max(1,r.height);const cap=this.quality==='high'?2:this.quality==='low'?1:1.5;const dpr=Math.min(window.devicePixelRatio||1,cap)*this._scale;const w=Math.max(1,Math.round(this.cssWidth*dpr)),h=Math.max(1,Math.round(this.cssHeight*dpr));if(this.canvas.width!==w||this.canvas.height!==h){this.canvas.width=w;this.canvas.height=h;}this.gl.viewport(0,0,w,h);this.renderOnce();}
 setParams(partial){
  for(const [k,v]of Object.entries(partial)){
   if(k==='deformationMode'){
    const index=['liquid','spherical','adhesive'].indexOf(v);
    if(index>=0&&v!==this.params[k]){
     this.params[k]=v;const to=[0,0,0];to[index]=1;
     if(this._reduced){this._modeWeights=to;this._modeTransition=null;}
     else this._modeTransition={from:[...this._modeWeights],to,elapsed:0};
    }
    continue;
   }
   if(k==='glowBlend'){if(BLEND_MODES.includes(v))this.params[k]=v;continue;}
   if(!(k in DEFAULTS)||!Number.isFinite(Number(v)))continue;
   const min=k==='width'||k==='height'?10:0,max=k==='width'||k==='height'?32768:k==='radius'?500:k==='blur'?40:k.startsWith('hue')?360:100;
   const value=Math.max(min,Math.min(max,Number(v)));if(k==='blur'&&value!==this.params.blur)this._blurDirty=true;this.params[k]=value;
  }
  if(!this.playing||document.hidden)this.renderOnce();
  if(this.playing||this._modeTransition)this._schedule();
 }
 // Public positions are canvas-relative, with y=0 at the top, independent of DPR.
 get position(){return {...this._position};}
 setPosition(partial={}){
  let changed=false;
  for(const key of ['x','y']){
   if(!Number.isFinite(partial?.[key]))continue;
   const value=Math.max(0,Math.min(1,partial[key]));
   if(value!==this._position[key]){this._position[key]=value;changed=true;}
  }
  if(changed)this.renderOnce();
  return this.position;
 }
 // No secondary RAF or clock: controllers own all transient animation.
 setTransientMotion({x=1,y=0,amount=0,tailPolarity=1}={}){
  if(![x,y,amount,tailPolarity].every(Number.isFinite))return;
  const length=Math.hypot(x,y);
  this._transientMotion={x:length>1e-6?x/length:1,y:length>1e-6?y/length:0,amount:Math.max(0,Math.min(1,amount)),tailPolarity:Math.max(-1,Math.min(1,tailPolarity))};
  this.renderOnce();
 }
 setMorphMotion({x=1,y=0,amount=0}={}){
  if(![x,y,amount].every(Number.isFinite))return;
  const length=Math.hypot(x,y);
  this._morphMotion={x:length>1e-6?x/length:1,y:length>1e-6?y/length:0,amount:Math.max(0,Math.min(1,amount))};
  this.renderOnce();
 }
 _combinedMotion(){
  const travel=this._transientMotion||{x:1,y:0,amount:0},morph=this._morphMotion||{x:1,y:0,amount:0};
  const x=travel.x*travel.amount+morph.x*morph.amount,y=travel.y*travel.amount+morph.y*morph.amount,length=Math.hypot(x,y);
  return {x:length>1e-6?x/length:travel.x,y:length>1e-6?y/length:travel.y,amount:Math.min(1,travel.amount+morph.amount),tailPolarity:travel.amount>1e-6?(travel.tailPolarity??1):1};
 }
 setPresentation({edgeGlowOnly=0}={}){
  if(!Number.isFinite(edgeGlowOnly))return;
  this._edgeGlowOnly=Math.max(0,Math.min(1,edgeGlowOnly));this.renderOnce();
 }
 getDisplayGeometry(){
  const shape=this._shapeGeometry(),unit=Math.min(this.canvas.width,this.canvas.height);
  const sx=unit/this.canvas.width*this.cssWidth,sy=unit/this.canvas.height*this.cssHeight;
  return {x:this._position.x*this.cssWidth,y:this._position.y*this.cssHeight,width:shape.width*sx,height:shape.height*sy,radius:shape.radius*Math.min(sx,sy),scale:shape.width*sx/this.params.width};
 }
 _shapeGeometry(){
  const p=this.params,width=this.cssWidth||1,height=this.cssHeight||1,unit=Math.min(width,height);
  const fit=Math.min(1,width*.82/p.width,height*.74/p.height);
  return {width:p.width*fit/unit,height:p.height*fit/unit,radius:Math.min(p.radius,Math.min(p.width,p.height)/2)*fit/unit};
 }
 // CPU mirror of the shader silhouette for exact mouse/touch targeting.
 _shapeDistance(x,y){
  const shape=this._shapeGeometry(),hx=shape.width*.5,hy=shape.height*.5;
  const motion=this._combinedMotion(),tx=motion.x,ty=-motion.y,movement=motion.amount;
  const along=1/(1+movement*1.1),across=1+movement*.6,dot=x*tx+y*ty;
  x=x*across+(along-across)*dot*tx;y=y*across+(along-across)*dot*ty;
  const liquid=effectiveLiquid(this.params.liquid),weights=this._modeWeights||[this.params.deformationMode==='liquid'||!this.params.deformationMode?1:0,this.params.deformationMode==='spherical'?1:0,this.params.deformationMode==='adhesive'?1:0];
  const tall=hy>hx,cycle=.5-.5*Math.cos(this._time*1.65),pull=(1-Math.exp(-3*liquid*this._motionResponse.amplitudeMultiplier))*weights[2]*(.18+.82*cycle);
  const stretch=1+.65*pull,k=(tall?y:x)/((tall?hy:hx)*stretch),s=Math.min(Math.abs(k)/.8,1)**2,bulb=s*s*s*(10-15*s+6*s*s),profile=1+pull*(.98*bulb-.68);
  if(tall){y/=stretch;x/=profile;}else{x/=stretch;y/=profile;}
  const nx=x/hx,ny=y/hy,radial=Math.hypot(nx,ny);
  const amount=liquid*this._motionResponse.amplitudeMultiplier,t=this._time;
  let radius=1/Math.sqrt(1+amount*amount*.0117);
  if(radial>.0001){
   const angle=Math.atan2(ny,nx),shoulder=Math.min(radial/.55,1),gate=shoulder*shoulder*(3-2*shoulder);
   let lobes=.13*Math.sin(angle*3+t*.71)+.07*Math.sin(angle*5-t*.53+.8)+.04*Math.cos(angle*2+t*.37-1.1);
   const classic=lobes;
   const minHalf=Math.min(hx,hy),rx=hx/minHalf,ry=hy/minHalf,dx=nx/radial,dy=ny/radial;
   const bubble=center=>{const bx=(dx-Math.cos(center))*rx,by=(dy-Math.sin(center))*ry;return Math.hypot(bx,by)>4?0:Math.exp(-1.7*(bx*bx+by*by));};
   const spherical=(.9*bubble(t*.55)+.75*bubble(-t*.39+2.3)+.6*bubble(t*.31-1.8)-.09)/Math.hypot(dx*rx,dy*ry);
   const adhesive=0.;
   lobes=weights[0]*classic+weights[1]*spherical+weights[2]*adhesive;
   const travelLength=Math.hypot(tx/hx,ty/hy),rear=(nx/radial*tx/hx+ny/radial*ty/hy)/Math.max(travelLength,.00001);
   radius*=1+gate*(amount*lobes+.08*movement*((1-rear)*(1-rear)+2*rear*(1-motion.tailPolarity)));
  }
  const wx=x/radius,wy=y/radius,qx=Math.abs(wx)-hx+shape.radius,qy=Math.abs(wy)-hy+shape.radius;
  const rounded=Math.hypot(Math.max(qx,0),Math.max(qy,0))+Math.min(Math.max(qx,qy),0)-shape.radius;
  const ellipse=(Math.hypot(wx/hx,wy/hy)-1)*Math.min(hx,hy),baseBlend=liquid*liquid*(3-2*liquid),blend=baseBlend+(1-baseBlend)*weights[2]*(1-Math.exp(-3*liquid))*.7;
  return rounded*(1-blend)+ellipse*blend;
 }
 hitTest(clientX,clientY){
  if(this._disposed||this._lost||!Number.isFinite(clientX)||!Number.isFinite(clientY))return false;
  const rect=this.canvas.getBoundingClientRect();
  if(!(rect.width>0&&rect.height>0))return false;
  const nx=(clientX-(rect.left||0))/rect.width,ny=(clientY-(rect.top||0))/rect.height;
  if(nx<0||nx>1||ny<0||ny>1)return false;
  // Catch a layout change before ResizeObserver's next callback. Use the same
  // backing-buffer aspect ratio as GLSL, including fractional-DPR rounding.
  if(rect.width!==this.cssWidth||rect.height!==this.cssHeight)this._resize();
  const unit=Math.min(this.canvas.width,this.canvas.height);
  const x=(nx-this._position.x)*this.canvas.width/unit,y=(this._position.y-ny)*this.canvas.height/unit;
  return this._shapeDistance(x,y)<=0;
 }
 setMotionResponse(partial={}){
  for(const [key,min,max]of [['speedMultiplier',.55,2],['amplitudeMultiplier',.5,1.6]])if(Number.isFinite(Number(partial[key])))this._motionResponse[key]=Math.max(min,Math.min(max,Number(partial[key])));
 }
 setScene(name){if(['aurora','studio','grid','sunset'].includes(name)){this.scene=name;this.setBackgroundImage(null);}this.renderOnce();}
 _createBackgroundTexture(source){
  const gl=this.gl,texture=gl.createTexture();
  if(!texture)throw new Error('无法创建背景纹理');
  try{
   gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,texture);
   gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
   gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
   gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
   if(source)gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,source);
   else gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([0,0,0,255]));
   const error=gl.getError();if(error!==gl.NO_ERROR)throw new Error('背景纹理上传失败 ('+error+')');
   return texture;
  }catch(error){gl.deleteTexture(texture);throw error;}
  finally{gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);}
 }
 async setBackgroundImage(dataUrlOrNull){
  if(this._disposed)return false;
  const version=++this._backgroundVersion;
  if(dataUrlOrNull===null){
   this._backgroundSource=null;this._backgroundDirty=true;
   // Keep a complete texture bound even when only procedural sampling is used.
   if(!this._lost){const texture=this._createBackgroundTexture(null);this.gl.deleteTexture(this._backgroundTexture);this._backgroundTexture=texture;}
   this.renderOnce();return true;
  }
  if(typeof dataUrlOrNull!=='string'||!/^data:image\//i.test(dataUrlOrNull))throw new Error('背景必须是本地图片的 data URL');
  let image;
  try{image=await new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(new Error('背景图片无法解码'));img.src=dataUrlOrNull;});}
  catch(error){if(this._disposed||version!==this._backgroundVersion)return false;throw error;}
  if(this._disposed||version!==this._backgroundVersion)return false;
  if(!image.naturalWidth||!image.naturalHeight)throw new Error('背景图片尺寸无效');
  const max=this._lost?2048:this.gl.getParameter(this.gl.MAX_TEXTURE_SIZE);
  const scale=Math.min(1,max/image.naturalWidth,max/image.naturalHeight);
  let source=image;
  if(scale<1){source=document.createElement('canvas');source.width=Math.max(1,Math.floor(image.naturalWidth*scale));source.height=Math.max(1,Math.floor(image.naturalHeight*scale));const ctx=source.getContext('2d');if(!ctx)throw new Error('无法缩放背景图片');ctx.drawImage(image,0,0,source.width,source.height);}
  if(!this._lost){const texture=this._createBackgroundTexture(source);this.gl.deleteTexture(this._backgroundTexture);this._backgroundTexture=texture;}
  this._backgroundSource=source;this._backgroundDirty=true;this.renderOnce();return true;
 }
 setPlaying(bool){this.playing=!!bool;this._last=0;this._frames=0;this._sampleStart=0;this._schedule();this.renderOnce();}
 setQuality(value){if(!['auto','high','low'].includes(value))return;this.quality=value;this._scale=1;this._sampleStart=0;this._frames=0;this._resize();}
 resetTime(){this._time=0;this._last=0;this.renderOnce();}
 get stats(){return{fps:Math.round(this._fps),backend:'WebGL 1.0',scale:this._scale};}
 _schedule(){if(!this._raf&&!this._disposed&&!this._lost&&!document.hidden)this._raf=requestAnimationFrame(t=>this._tick(t));}
 _tick(now){this._raf=0;if(this._disposed||this._lost||document.hidden)return;const dt=this._last?Math.min((now-this._last)/1000,.1):0;this._last=now;
  const modeWasAnimating=!!this._modeTransition;
  if(modeWasAnimating){
   const transition=this._modeTransition;transition.elapsed+=dt;
   const progress=Math.min(1,transition.elapsed/.3),ease=progress*progress*(3-2*progress);
   this._modeWeights=transition.from.map((value,index)=>value+(transition.to[index]-value)*ease);
   if(progress===1)this._modeTransition=null;
  }
  if(!this.playing&&modeWasAnimating)this.renderOnce();
  if(this.playing){this._time+=dt*motionRate(this.params.speed)*this._motionResponse.speedMultiplier;this.renderOnce();if(!this._sampleStart)this._sampleStart=now;this._frames++;if(now-this._sampleStart>1800){this._fps=this._frames*1000/(now-this._sampleStart);this._frames=0;this._sampleStart=now;if(this.quality==='auto'){let next=this._scale;if(this._fps<38)next=Math.max(.55,this._scale-.1);else if(this._fps>57)next=Math.min(1,this._scale+.05);if(next!==this._scale){this._scale=next;this._resize();}}}}
  if(this.playing||this._modeTransition)this._schedule();
 }
 renderOnce(){
  if(this._disposed||this._lost||!this.gl)return;
  const gl=this.gl,p=this.params;this._prepareTargets();if(this._backgroundDirty)this._renderBackground();if(this._blurDirty)this._renderGaussian();
  const pass=this._glassPass,u=pass.u;this._drawPass(pass,null);this._bindTexture(this._sharpTarget.texture,0);this._bindTexture(p.blur>.02?this._blurTarget.texture:this._sharpTarget.texture,1);gl.uniform1i(u.Sharp,0);gl.uniform1i(u.Blurred,1);
  const shape=this._shapeGeometry(),unit=Math.min(this.canvas.width,this.canvas.height);
  gl.uniform2f(u.Center,(this._position.x-.5)*this.canvas.width/unit,(.5-this._position.y)*this.canvas.height/unit);
  gl.uniform2f(u.Resolution,this.canvas.width,this.canvas.height);gl.uniform2f(u.Shape,shape.width,shape.height);gl.uniform1f(u.Radius,shape.radius);gl.uniform1f(u.Time,this._time);gl.uniform1f(u.Scene,['aurora','studio','grid','sunset'].indexOf(this.scene));gl.uniform1f(u.Pixel,1/Math.min(this.canvas.width,this.canvas.height));
  gl.uniform1f(u.Liquid,effectiveLiquid(p.liquid));
  gl.uniform3f(u.ModeWeights,...this._modeWeights);
  const motion=this._combinedMotion();gl.uniform3f(u.TransientMotion,motion.x,-motion.y,motion.amount);gl.uniform1f(u.TailPolarityOffset,motion.tailPolarity-1);gl.uniform1f(u.EdgeGlowOnly,this._edgeGlowOnly);
  for(const key of ['highlight','reflection','refraction','opacity','dispersion','glow'])gl.uniform1f(u[key[0].toUpperCase()+key.slice(1)],p[key]/100);
  gl.uniform3f(u.Hues,p.hue1/360,p.hue2/360,p.hue3/360);gl.uniform1f(u.Amplitude,this._motionResponse.amplitudeMultiplier);gl.uniform1f(u.GlowMix,p.glowMix/100);gl.uniform1f(u.GlowBlend,Math.max(0,BLEND_MODES.indexOf(p.glowBlend)));gl.drawArrays(gl.TRIANGLES,0,6);
 }
 capture(){this.renderOnce();return this.canvas.toDataURL('image/png');}
 dispose(){this._disposed=true;this._backgroundVersion++;this._backgroundSource=null;cancelAnimationFrame(this._raf);this._observer?.disconnect();window.removeEventListener('resize',this._onResize);document.removeEventListener('visibilitychange',this._onVisibility);this._motion.removeEventListener?.('change',this._onMotion);this.canvas.removeEventListener('webglcontextlost',this._onLost);this.canvas.removeEventListener('webglcontextrestored',this._onRestored);if(this.gl&&!this._lost){this.gl.deleteTexture(this._backgroundTexture);this.gl.deleteBuffer(this.buffer);this._deleteTargets();for(const pass of [this._backgroundPass,this._downsamplePass,this._gaussianPass,this._glassPass])this.gl.deleteProgram(pass.program);}}
}

/** All capture, decoding, and spectral analysis stay on this device. */
class AudioReactive {
 constructor(onLevel=()=>{},onStatus=()=>{}){
  this.onLevel=onLevel;this.onStatus=onStatus;this.sensitivity=100;this._active=false;this._generation=0;this._disposed=false;this._raf=0;this._last=0;this._envelope=0;this._average=0;this._beat=0;this._bass=0;this._treble=0;this._lastBeat=0;
  this._visibility=()=>{if(document.hidden){cancelAnimationFrame(this._raf);this._raf=0;this._zero();}else if(this._active){this._resume().then(ok=>{if(ok)this._schedule();});}};
  document.addEventListener('visibilitychange',this._visibility);
 }
 get active(){return this._active;}
 setSensitivity(value){if(Number.isFinite(Number(value)))this.sensitivity=Math.max(0,Math.min(200,Number(value)));}
 _status(type,message,filename){this.onStatus({...{type,message},...(filename?{filename}:{})});}
 _zero(){this._last=0;this._envelope=0;this._average=0;this._beat=0;this._bass=0;this._treble=0;this.onLevel({level:0,bass:0,beat:0,treble:0});}
 _context(){const AudioCtx=window.AudioContext||window.webkitAudioContext;if(!AudioCtx)throw new Error('此浏览器不支持音频分析，请使用新版 Safari 或 Chrome。');this._ctx=new AudioCtx();this._analyser=this._ctx.createAnalyser();this._analyser.fftSize=2048;this._analyser.smoothingTimeConstant=.65;this._analyser.minDecibels=-90;this._analyser.maxDecibels=-15;this._wave=new Uint8Array(this._analyser.fftSize);this._spectrum=new Uint8Array(this._analyser.frequencyBinCount);return this._ctx;}
 async _resume(){const ctx=this._ctx;if(!ctx)return false;try{if(ctx.state!=='running')await ctx.resume();if(ctx!==this._ctx)return false;if(ctx.state!=='running'){this._status('paused','音频已被系统暂停，请点击音频按钮恢复。',this._filename);return false;}return true;}catch{this._status('paused','请点击音频按钮恢复播放或收音。',this._filename);return false;}}
 async startMicrophone(){
  this.stop(false);if(this._disposed)return;const token=this._generation;
  this._status('requesting','正在请求麦克风权限…');
  let stream;
  try{
   if(!window.isSecureContext)throw new Error('麦克风需要 HTTPS 安全连接或 localhost，请在安全地址打开。');
   if(!navigator.mediaDevices?.getUserMedia)throw new Error('当前浏览器无法访问麦克风，请使用新版 Safari 或 Chrome。');
   const ctx=this._context();
   // Resume synchronously within the initiating user gesture, before permission UI.
   const resumed=ctx.resume().catch(()=>{});
   stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:false,autoGainControl:false},video:false});
   if(this._disposed||token!==this._generation){stream.getTracks().forEach(t=>t.stop());return;}
   this._stream=stream;this._source=ctx.createMediaStreamSource(stream);this._source.connect(this._analyser);
   // Deliberately never connect the microphone graph to ctx.destination.
   this._mode='microphone';this._active=true;
   for(const track of stream.getAudioTracks())track.addEventListener('ended',()=>{if(this._stream===stream){this.stop(false);this._status('error','麦克风已断开，请重新开启。');}},{once:true});
   await resumed;if(token!==this._generation)return;
   if(await this._resume()){this._status('microphone','麦克风实时响应中 · 仅本地分析');this._schedule();}
  }catch(error){
   if(token!==this._generation)return;
   if(stream&&stream!==this._stream)stream.getTracks().forEach(t=>t.stop());
   this.stop(false);const messages={NotAllowedError:'麦克风权限未开启，请在浏览器网站设置中允许麦克风后重试。',NotFoundError:'没有找到麦克风，请连接麦克风后重试。',NotReadableError:'无法读取麦克风，可能正被其他应用占用。',AbortError:'麦克风请求已中断，请重试。',SecurityError:'浏览器安全设置阻止了麦克风访问。'};this._status('error',messages[error.name]||error.message||'麦克风启动失败，请重试。');
  }
 }
 async useFile(file){
  this.stop(false);if(this._disposed)return;
  const token=this._generation;
  try{
   if(!(file instanceof Blob)||!file.size)throw new Error('请选择一个非空音频文件。');
   const ctx=this._context();const resumed=ctx.resume().catch(()=>{});
   this._filename=file.name||'本地音频';this._url=URL.createObjectURL(file);const element=new Audio();this._audio=element;element.preload='auto';element.playsInline=true;element.src=this._url;
   this._source=ctx.createMediaElementSource(element);this._source.connect(this._analyser);this._analyser.connect(ctx.destination);this._mode='file';
   element.onended=()=>{if(this._audio!==element)return;this._active=false;cancelAnimationFrame(this._raf);this._raf=0;this._zero();this._status('paused','音频播放结束，可重新播放。',this._filename);};
   element.onerror=()=>{if(this._audio!==element)return;const name=this._filename;this.stop(false);this._status('error','无法解码此音频，请尝试 MP3、WAV 或 AAC 文件。',name);};
   await resumed;if(token!==this._generation)return;
   this._status('file','本地音频已载入，点击播放开始响应。',this._filename);
  }catch(error){if(token!==this._generation)return;this.stop(false);this._status('error',error.message||'无法打开音频文件。');}
 }
 async playFile(){
  const element=this._audio,token=this._generation;if(!element){this._status('error','请先选择一个本地音频文件。');return;}
  try{
   // Trigger both playback and context resume in the same user activation.
   const contextReady=this._resume();if(element.ended)element.currentTime=0;
   const playback=element.play();await playback;if(token!==this._generation)return;
   if(!await contextReady){element.pause();return;}
   this._active=true;this._status('file','音频播放中 · 仅本地分析',this._filename);this._schedule();
  }catch(error){if(token!==this._generation)return;this._active=false;this._zero();this._status(error.name==='NotAllowedError'?'paused':'error',error.name==='NotAllowedError'?'请再次点击播放，以允许浏览器播放音频。':'播放失败，请检查音频格式后重试。',this._filename);}
 }
 pauseFile(){if(!this._audio)return;this._audio.pause();this._active=false;cancelAnimationFrame(this._raf);this._raf=0;this._zero();this._status('paused','音频已暂停。',this._filename);}
 _schedule(){if(!this._raf&&this._active&&!this._disposed&&!document.hidden)this._raf=requestAnimationFrame(now=>this._analyse(now));}
 _analyse(now){
  this._raf=0;if(!this._active||!this._analyser||this._disposed||document.hidden)return;
  if(this._ctx.state!=='running'){this._zero();this._status('paused','音频被系统暂停，请点击音频按钮恢复。',this._filename);return;}
  const dt=this._last?Math.min((now-this._last)/1000,.1):1/60;this._last=now;
  this._analyser.getByteTimeDomainData(this._wave);this._analyser.getByteFrequencyData(this._spectrum);
  let sum=0;for(const value of this._wave){const x=(value-128)/128;sum+=x*x;}
  const rms=Math.sqrt(sum/this._wave.length),gain=this.sensitivity/100;
  const target=Math.min(1,Math.max(0,rms-.003)*5.5*gain);
  const smooth=(old,value,attack=.045,release=.18)=>old+(value-old)*(1-Math.exp(-dt/(value>old?attack:release)));
  const band=(lo,hi)=>{const hz=this._ctx.sampleRate/this._analyser.fftSize;const first=Math.max(1,Math.floor(lo/hz)),last=Math.min(this._spectrum.length-1,Math.ceil(hi/hz));let power=0;for(let i=first;i<=last;i++)power+=this._spectrum[i]/255;return last>=first?Math.min(1,power/(last-first+1)*gain):0;};
  this._envelope=smooth(this._envelope,target);this._bass=smooth(this._bass,band(35,250));this._treble=smooth(this._treble,band(2500,10000));
  const novelty=Math.max(0,target-this._average);this._average+=(target-this._average)*(1-Math.exp(-dt/.32));
  if(novelty>.055&&target>.075&&now-this._lastBeat>130){this._beat=Math.min(1,novelty*5+target*.35);this._lastBeat=now;}else this._beat*=Math.exp(-dt/.17);
  this.onLevel({level:this._envelope,bass:this._bass,beat:this._beat,treble:this._treble});this._schedule();
 }
 stop(notify=true){
  this._generation++;this._active=false;cancelAnimationFrame(this._raf);this._raf=0;
  if(this._audio){this._audio.onended=null;this._audio.onerror=null;this._audio.pause();this._audio.removeAttribute('src');this._audio.load();this._audio=null;}
  if(this._stream){for(const track of this._stream.getTracks())track.stop();this._stream=null;}
  try{this._source?.disconnect();this._analyser?.disconnect();}catch{}
  this._source=null;this._analyser=null;if(this._ctx){const ctx=this._ctx;this._ctx=null;ctx.close().catch(()=>{});}
  if(this._url){URL.revokeObjectURL(this._url);this._url=null;}
  this._mode=null;this._filename=null;this._lastBeat=0;this._zero();if(notify)this._status('stopped','音频响应已关闭。');
 }
 dispose(){this._disposed=true;this.stop(false);document.removeEventListener('visibilitychange',this._visibility);}
}

/** Smooth RMS-only audio modulation. This module intentionally touches motion only. */
class AudioMotionBridge {
  constructor(renderer, onState = () => {}) {
    this.renderer = renderer;
    this.onState = onState;
    this.strength = 1;
    this.active = false;
    this.input = 0;
    this.energy = 0;
    this.speedMultiplier = 1;
    this.amplitudeMultiplier = 1;
    this.frame = null;
    this.lastTime = null;
    this.disposed = false;
    this.tick = this.tick.bind(this);
    this.visibilityChanged = () => {
      this.cancelFrame();
      if (!document.hidden && this.needsFrame()) this.schedule();
    };
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', this.visibilityChanged);
    }
    this.publish();
  }

  setInput(levels, active) {
    if (this.disposed) return;
    this.active = Boolean(active);
    // Deliberately ignore bass, beat and treble: transients must not flash the material.
    const level = Number(levels?.level);
    this.input = this.active && Number.isFinite(level)
      ? Math.max(0, Math.min(1, level * 1.6)) : 0;
    this.schedule();
  }

  setStrength(value) {
    if (this.disposed) return;
    const number = Number(value);
    this.strength = Number.isFinite(number) ? Math.max(0, Math.min(100, number)) / 100 : 0;
    this.schedule();
  }

  // Stopping audio releases smoothly, instead of snapping the running animation.
  reset() {
    this.setInput({ level: 0 }, false);
  }

  needsFrame() {
    return this.active || this.energy !== 0 || this.speedMultiplier !== 1 || this.amplitudeMultiplier !== 1;
  }

  schedule() {
    if (this.disposed || this.frame !== null || !this.needsFrame()) return;
    if (typeof document !== 'undefined' && document.hidden) return;
    this.frame = requestAnimationFrame(this.tick);
  }

  cancelFrame() {
    if (this.frame !== null) cancelAnimationFrame(this.frame);
    this.frame = null;
    this.lastTime = null;
  }

  tick(now) {
    this.frame = null;
    if (this.disposed) return;
    // Cap elapsed time so a suspended tab cannot produce a large first-frame jump.
    const dt = this.lastTime === null ? 1 / 60 : Math.max(0, Math.min(1 / 30, (now - this.lastTime) / 1000));
    this.lastTime = now;
    const approach = (current, target, tau, rate) => {
      const delta = (target - current) * (1 - Math.exp(-dt / tau));
      const next = current + Math.max(-rate * dt, Math.min(rate * dt, delta));
      return Math.abs(next - target) < 0.00001 ? target : next;
    };
    const targetEnergy = this.active ? this.input : 0;
    this.energy = approach(this.energy, targetEnergy, targetEnergy > this.energy ? 0.2 : 0.55, 2.4);
    const speed = this.active ? 1 + this.strength * (0.65 + 1.2 * this.energy - 1) : 1;
    const amplitude = this.active ? 1 + this.strength * (0.55 + 0.95 * this.energy - 1) : 1;
    this.speedMultiplier = approach(this.speedMultiplier, speed, 0.12, 1.5);
    this.amplitudeMultiplier = approach(this.amplitudeMultiplier, amplitude, 0.12, 1.2);
    this.publish();
    if (this.needsFrame()) this.schedule();
    else this.lastTime = null;
  }

  publish() {
    this.renderer?.setMotionResponse?.({
      speedMultiplier: this.speedMultiplier,
      amplitudeMultiplier: this.amplitudeMultiplier
    });
    this.onState({ energy: this.energy, speedMultiplier: this.speedMultiplier, amplitudeMultiplier: this.amplitudeMultiplier });
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.cancelFrame();
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this.visibilityChanged);
    }
    this.active = false;
    this.input = this.energy = 0;
    this.speedMultiplier = this.amplitudeMultiplier = 1;
    this.publish();
  }
}


export { DEFAULTS, GlassRenderer, AudioReactive, AudioMotionBridge };
