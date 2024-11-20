import CustomButton from '@/components/custom-button';
import Github from '@/components/icons/github';
import { OrthographicCamera, Plane, shaderMaterial } from '@react-three/drei';
import { Canvas, extend, RootState, ShaderMaterialProps, useFrame, useThree } from '@react-three/fiber';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';
import { ShaderMaterial } from 'three';
import mariwanoIcon from '../../assets/mariwano-icon.png';

const discordInviteLink = 'https://discord.com/api/oauth2/authorize?client_id=1159902116979146782&permissions=8&scope=bot';
const githubLink = 'https://github.com/adrgarcha/mariwano';

// glsl
import { default as fragmentShaderSource } from '../components/shaders/backdrop.frag';
import { default as vertexShaderSource } from '../components/shaders/backdrop.vert';
type Uniforms = {};

const fragmentShader = fragmentShaderSource;
const vertexShader = vertexShaderSource;
const BackdropPlaneShader = shaderMaterial(
   {
      uTime: 0,
      iResolution: [0, 0, 1],
   },
   vertexShader,
   fragmentShader
);
extend({ BackdropPlaneShader });

declare global {
   namespace JSX {
      interface IntrinsicElements {
         backdropPlaneShader: ShaderMaterialProps & Uniforms;
      }
   }
}

export function BackdropPlane(): any {
   const { viewport } = useThree();
   const shader = useRef<ShaderMaterial & Partial<Uniforms>>(null);

   useFrame(({ clock }: RootState) => {
      if (!shader.current) return;
      shader.current.uniforms.uTime.value = clock.getElapsedTime();
      shader.current.uniforms.iResolution.value = [viewport.width, viewport.height, 1];
   });

   return (
      <Plane args={[viewport.width, viewport.height]} position={[0, 0, 0]}>
         <backdropPlaneShader key={BackdropPlaneShader.key} ref={shader} />
      </Plane>
   );
}

export function BackgroundCanvas() {
   return (
      <Canvas
         gl={{
            alpha: false, // Permitir transparencia
            antialias: true, // Mejorar la calidad visual
            preserveDrawingBuffer: true,
         }}
         className="!fixed inset-0 -z-10">
         <OrthographicCamera makeDefault={true} position={[0, 0, 5]} />
         <BackdropPlane />
      </Canvas>
   );
}

export default function Home() {
   return (
      <div className="relative flex flex-col items-center justify-center gap-y-10 h-screen overflow-x-hidden ">
         <BackgroundCanvas />
         <section className="flex flex-col items-center gap-y-2">
            <h1 className="font-bold text-6xl">Mariwano</h1>
            <h2 className="font-medium text-center text-white/80 w-96 md:w-full">El bot que transforma el aburrimiento en diversión y buen rollo.</h2>
         </section>
         <Image src={mariwanoIcon} alt="Mariwano icon" priority className="size-52 rounded-full" />
         <section className="flex items-center gap-x-2">
            <Link href={discordInviteLink} target="_blank" rel="noreferrer">
               <CustomButton className="flex items-center gap-x-2">
                  <p className="font-semibold">Invita a Mariwano</p>
                  <ArrowRight size={18} strokeWidth={3} />
               </CustomButton>
            </Link>
            <Link href={githubLink} target="_blank" rel="noreferrer" aria-label="mariwano-github-link" className="flex items-center h-full">
               <CustomButton aria-label="github-button" className="flex items-center py-3">
                  <Github />
               </CustomButton>
            </Link>
         </section>
      </div>
   );
}
