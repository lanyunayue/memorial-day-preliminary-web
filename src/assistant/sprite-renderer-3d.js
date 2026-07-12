(function(global){
  var canvas=null,gl=null,program=null,buffer=null,frame=0,active=false,failed=false,startedAt=0,drawCount=0,lastError=0;
  var vertices=new Float32Array([
    -1,-1,0, 1,-1,0, 1,1,0, -1,-1,0, 1,1,0, -1,1,0
  ]);
  function shader(type,source){var value=gl.createShader(type);gl.shaderSource(value,source);gl.compileShader(value);if(!gl.getShaderParameter(value,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(value)||'shader_compile_failed');return value;}
  function setup(){
    if(gl)return true;
    canvas=document.getElementById('sprite3dCanvas');if(!canvas)return false;
    gl=canvas.getContext('webgl',{alpha:true,antialias:true,preserveDrawingBuffer:true});if(!gl)throw new Error('webgl_unavailable');
    var vs=shader(gl.VERTEX_SHADER,'attribute vec3 p;void main(){gl_Position=vec4(p,1.0);}');
    var fsSource=[
      'precision mediump float;uniform vec2 r;uniform float t;uniform vec3 c;',
      'float e(vec2 p,vec2 o,vec2 s){vec2 q=(p-o)/s;return dot(q,q);}',
      'void main(){vec2 p=(gl_FragCoord.xy/r)*2.0-1.0;p.x*=r.x/r.y;',
      'float bob=sin(t*1.5)*.025;',
      'float body=e(p,vec2(0.,-.42+bob),vec2(.42,.46));',
      'float head=e(p,vec2(0.,.12+bob),vec2(.55,.52));',
      'float le=e(p,vec2(-.42,.52+bob),vec2(.24,.24));',
      'float re=e(p,vec2(.42,.52+bob),vec2(.24,.24));',
      'float shape=min(min(body,head),min(le,re));if(shape>1.0)discard;',
      'float light=clamp(1.18-.36*length(p-vec2(-.28,.48)),.58,1.12);',
      'vec3 col=c*light;float eyeL=e(p,vec2(-.19,.18+bob),vec2(.05,.07));',
      'float eyeR=e(p,vec2(.19,.18+bob),vec2(.05,.07));',
      'float nose=e(p,vec2(0.,-.02+bob),vec2(.075,.055));',
      'if(min(min(eyeL,eyeR),nose)<1.0)col=vec3(.15,.12,.1);',
      'float shine=e(p,vec2(-.22,.35+bob),vec2(.12,.08));',
      'if(shine<1.0)col=mix(col,vec3(1.0),.52);gl_FragColor=vec4(col,1.0);}'
    ].join('');
    var fs=shader(gl.FRAGMENT_SHADER,fsSource);
    program=gl.createProgram();gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error('shader_link_failed');
    buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.STATIC_DRAW);
    return true;
  }
  function hex(value){var m=/^#([0-9a-f]{6})$/i.exec(value||'');if(!m)return[1,.98,.95];var n=parseInt(m[1],16);return[((n>>16)&255)/255,((n>>8)&255)/255,(n&255)/255];}
  function render(now){
    if(!active||!gl)return;
    var dpr=Math.min(2,global.devicePixelRatio||1),w=Math.max(1,Math.round(canvas.clientWidth*dpr)),h=Math.max(1,Math.round(canvas.clientHeight*dpr));
    if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;gl.viewport(0,0,w,h);}
    gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.useProgram(program);
    var loc=gl.getAttribLocation(program,'p');gl.enableVertexAttribArray(loc);gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.vertexAttribPointer(loc,3,gl.FLOAT,false,0,0);
    gl.uniform2f(gl.getUniformLocation(program,'r'),w,h);gl.uniform1f(gl.getUniformLocation(program,'t'),((now||performance.now())-startedAt)/1000);
    var pref=global.ShikeSpriteCustomization?global.ShikeSpriteCustomization.get():{primary:'#fffaf2'};var c=hex(pref.primary);gl.uniform3f(gl.getUniformLocation(program,'c'),c[0],c[1],c[2]);
    gl.drawArrays(gl.TRIANGLES,0,6);
    drawCount+=1;lastError=gl.getError();
    if(!document.hidden&&!(global.ShikeBearState&&global.ShikeBearState.reducedMotion()))frame=global.requestAnimationFrame(render);
  }
  function stop(){active=false;if(frame)global.cancelAnimationFrame(frame);frame=0;}
  function start(){
    if(failed)return false;
    try{if(!setup())return false;stop();active=true;startedAt=performance.now();render(startedAt);return true;}
    catch(error){failed=true;stop();if(global.ShikeBearState)global.ShikeBearState.transition('warning',{reason:'3d-fallback'});if(global.ShikeSpriteCustomization)global.ShikeSpriteCustomization.update({renderer:'2d'});return false;}
  }
  function sync(preferences){if(preferences.renderer==='3d')global.setTimeout(start,0);else stop();}
  function init(){if(global.ShikeSpriteCustomization)global.ShikeSpriteCustomization.subscribe(sync);document.addEventListener('visibilitychange',function(){if(active&&!document.hidden)render(performance.now());});}
  global.ShikeSpriteRenderer3D=Object.freeze({start:start,stop:stop,renderNow:function(){if(active&&gl)render(performance.now());return drawCount;},supported:function(){try{var c=document.createElement('canvas');return !!(c.getContext('webgl')||c.getContext('experimental-webgl'));}catch(error){return false;}},failed:function(){return failed;},debug:function(){return{active:active,drawCount:drawCount,lastError:lastError,linked:!!(gl&&program&&gl.getProgramParameter(program,gl.LINK_STATUS))};}});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})(window);
