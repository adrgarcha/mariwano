'use client';
import { Camera, Geometry, Mesh, Program, Renderer } from 'ogl';
import { useEffect, useRef } from 'react';

function Background() {
   const canvasRef = useRef<HTMLCanvasElement>(null);

   useEffect(() => {
      if (!canvasRef.current) return;

      const renderer = new Renderer({ canvas: canvasRef.current, depth: false });
      const gl = renderer.gl;
      document.body.appendChild(gl.canvas);
      gl.clearColor(0.01, 0, 0.12, 0.15);

      const camera = new Camera(gl, { fov: 15 });
      camera.position.z = 15;

      const resize = () => {
         renderer.setSize(window.innerWidth, window.innerHeight);
         camera.perspective({ aspect: gl.canvas.width / gl.canvas.height });
      };
      window.addEventListener('resize', resize, false);
      resize();

      const num = 100;
      const position = new Float32Array(num * 3);
      const random = new Float32Array(num * 4);

      for (let i = 0; i < num; i++) {
         position.set([Math.random(), Math.random(), Math.random()], i * 3);
         random.set([Math.random(), Math.random(), Math.random(), Math.random()], i * 4);
      }

      const geometry = new Geometry(gl, {
         position: { size: 3, data: position },
         random: { size: 4, data: random },
      });

      const vertex = `
         attribute vec3 position;
         attribute vec4 random;

         uniform mat4 modelMatrix;
         uniform mat4 viewMatrix;
         uniform mat4 projectionMatrix;
         uniform float uTime;

         varying vec4 vRandom;

         void main() {
            vRandom = random;
            vec3 pos = position * 2.0 - 1.0;
            pos.z *= 10.0;
            vec4 mPos = modelMatrix * vec4(pos, 1.0);
            float t = uTime * 0.6;
            mPos.x += sin(t * random.z + 6.28 * random.w) * mix(0.1, 1.5, random.x);
            mPos.y += sin(t * random.y + 6.28 * random.x) * mix(0.1, 1.5, random.w);
            mPos.z += sin(t * random.w + 6.28 * random.y) * mix(0.1, 1.5, random.z);
            vec4 mvPos = viewMatrix * mPos;
            gl_PointSize = 300.0 / length(mvPos.xyz) * (random.x + 0.1);
            gl_Position = projectionMatrix * mvPos;
         }
      `;

      const fragment = `
         precision highp float;

         uniform float uTime;

         varying vec4 vRandom;

         void main() {
            vec2 uv = gl_PointCoord.xy;
            float circle = smoothstep(0.5, 0.4, length(uv - 0.5)) * 0.8;
            gl_FragColor.rgb = 0.1 + 0.2 * sin(uv.yxx + uTime + vRandom.y * 6.28) + vec3(0.1, 0.0, 0.3);

            //0.01, 0, 0.12
            gl_FragColor.a = circle;
         }
      `;

      const program = new Program(gl, {
         vertex,
         fragment,
         uniforms: {
            uTime: { value: 0 },
         },
         transparent: true,
         depthTest: false,
      });

      const particles = new Mesh(gl, { mode: gl.POINTS, geometry, program });

      function update(t: number) {
         requestAnimationFrame(update);
         particles.rotation.x = Math.sin(t * 0.0002) * 0.1;
         particles.rotation.y = Math.cos(t * 0.0005) * 0.15;
         particles.rotation.z += 0.01;
         program.uniforms.uTime.value = t * 0.001;
         renderer.render({ scene: particles, camera });
      }
      requestAnimationFrame(update);

      return () => {
         gl.canvas.remove();
         window.removeEventListener('resize', resize);
      };
   }, []);

   return <canvas ref={canvasRef} className="!fixed inset-0 -z-10 w-full h-full" />;
}

export default Background;
