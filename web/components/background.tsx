'use client';

import { createParticleGeometry, createParticleProgram } from '@/lib/shader';
import { Camera, Mesh, Renderer } from 'ogl';
import { useEffect, useRef } from 'react';

export default function Background() {
   const canvasRef = useRef<HTMLCanvasElement>(null);
   const mouseCoords = useRef({ x: 0, y: 0 });

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

      const geometry = createParticleGeometry(gl, 50);
      const program = createParticleProgram(gl);
      const particles = new Mesh(gl, { mode: gl.POINTS, geometry, program });

      const update = (t: number) => {
         requestAnimationFrame(update);
         particles.rotation.x = Math.sin(t * 0.0001) * 0.1;
         particles.rotation.y = Math.cos(t * 0.0002) * 0.15;
         particles.rotation.z += 0.005;
         program.uniforms.uTime.value = t * 0.0005;
         program.uniforms.uMouseCoords.value = [mouseCoords.current.x, mouseCoords.current.y];
         renderer.render({ scene: particles, camera });
      };

      const handleMouseMove = (event: MouseEvent) => {
         mouseCoords.current.x = (event.clientX / window.innerWidth) * 2 - 1;
         mouseCoords.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
      };

      window.addEventListener('mousemove', handleMouseMove);
      requestAnimationFrame(update);

      return () => {
         gl.canvas.remove();
         window.removeEventListener('resize', resize);
         window.removeEventListener('mousemove', handleMouseMove);
      };
   }, []);

   return <canvas ref={canvasRef} className="absolute inset-0 -z-10 w-full h-full" />;
}
