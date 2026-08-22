import { useEffect, useRef } from "react";

export default function BelentaniAtmosphere() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const gl = canvas.getContext("webgl", { alpha: true, antialias: false });
    if (!gl) return;
    const vertex = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";
    const fragment = `precision highp float;uniform vec2 r;uniform float t;uniform vec2 m;
      float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1.,0.)),f.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.)),f.x),f.y);}
      void main(){vec2 u=(gl_FragCoord.xy-.5*r)/min(r.x,r.y);u+=m*.035;float d=length(u),a=atan(u.y,u.x);float ring=exp(-70.*abs(d-.64))+exp(-110.*abs(d-.86));float glow=exp(-3.5*d);float grain=n(u*5.+t*.015);vec3 c=vec3(.02,.02,.022)+vec3(.72,.58,.38)*(ring*.12+glow*.035)+grain*.008;float v=1.-smoothstep(.35,1.2,d);gl_FragColor=vec4(c*v,.34*v);}`;
    const shader = (type: number, source: string) => { const s = gl.createShader(type)!; gl.shaderSource(s, source); gl.compileShader(s); return s; };
    const program = gl.createProgram()!; gl.attachShader(program, shader(gl.VERTEX_SHADER, vertex)); gl.attachShader(program, shader(gl.FRAGMENT_SHADER, fragment)); gl.linkProgram(program);
    const buffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buffer); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
    const p = gl.getAttribLocation(program, "p"), r = gl.getUniformLocation(program, "r"), t = gl.getUniformLocation(program, "t"), m = gl.getUniformLocation(program, "m");
    let mx = 0, my = 0;
    const move = (e: PointerEvent) => { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; };
    const resize = () => { const d = Math.min(devicePixelRatio || 1, 2); canvas.width = innerWidth*d; canvas.height = innerHeight*d; gl.viewport(0,0,canvas.width,canvas.height); };
    addEventListener("pointermove", move, { passive: true }); addEventListener("resize", resize); resize();
    const start = performance.now(); let frame = 0;
    const draw = (now: number) => { gl.useProgram(program); gl.enableVertexAttribArray(p); gl.vertexAttribPointer(p,2,gl.FLOAT,false,0,0); gl.uniform2f(r,canvas.width,canvas.height); gl.uniform1f(t,(now-start)/1000); gl.uniform2f(m,mx,my); gl.drawArrays(gl.TRIANGLES,0,6); frame=requestAnimationFrame(draw); };
    frame = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(frame); removeEventListener("pointermove", move); removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={ref} className="belentani-atmosphere" aria-hidden="true" />;
}
