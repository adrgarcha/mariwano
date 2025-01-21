import Background from '@/components/background';
import CustomButton from '@/components/custom-button';
import { Handshake } from 'lucide-react';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

const discordServerImg = 'https://cdn.discordapp.com/icons/305023221546352640/a_0bef830ae07176f016d4f1c35b931851.gif?size=128';
const discordServerLink = 'https://discord.gg/4cC2zBVA8e';

export const metadata: Metadata = {
   title: 'Comunidad | Mariwano',
   description: 'La página del servidor de Discord al que pertenece Mariwano.',
};

export default function Community() {
   return (
      <div className="relative flex flex-col md:flex-row items-center justify-center gap-y-16 md:gap-x-20 h-screen md:px-36 overflow-x-hidden">
         <Background />
         <section className="flex flex-col items-center gap-y-4">
            <h1 className="font-semibold text-4xl text-center">Drogueros Unidos</h1>
            <Image src={discordServerImg} alt="drogueros unidos server icon" width={127} height={127} className="size-64 rounded-xl" />
         </section>
         <section className="flex flex-col items-center gap-y-4 md:gap-y-6">
            <h2 className="font-semibold text-xl">👽 ¡Únete a nuestra comunidad!</h2>
            <p className="font-medium text-center w-80 md:w-[600px] mb-4">
               Un servidor donde serás bien recibido y donde te lo pasarás de puta madre. Además, de tener soporte directo con los desarrolladores
               principales del bot para cualquier duda o sugerencia.
            </p>
            <Link href={discordServerLink} target="_blank" rel="noreferrer">
               <CustomButton className="flex items-center gap-x-3">
                  <p className="font-semibold">Unirme al servidor</p>
                  <Handshake size={20} />
               </CustomButton>
            </Link>
         </section>
      </div>
   );
}
