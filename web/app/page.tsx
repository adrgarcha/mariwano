import Background from '@/components/background';
import CustomButton from '@/components/custom-button';
import Github from '@/components/icons/github';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import mariwanoIcon from '../../assets/mariwano-icon.png';

const discordInviteLink = 'https://discord.com/api/oauth2/authorize?client_id=1159902116979146782&permissions=8&scope=bot';
const githubLink = 'https://github.com/adrgarcha/mariwano';

export default function Home() {
   return (
      <div className="relative flex flex-col items-center justify-center gap-y-10 h-screen bg-slate-950">
         <Background />
         <section className="flex flex-col items-center gap-y-2">
            <h1 className="font-bold text-6xl">Mariwano</h1>
            <h2 className="font-medium text-white/80">El bot que transforma el aburrimiento en diversión y buen rollo.</h2>
         </section>
         <Image src={mariwanoIcon} alt="Mariwano icon" className="size-52 rounded-full" />
         <section className="flex items-center gap-x-2">
            <Link href={discordInviteLink} target="_blank" rel="noreferrer">
               <CustomButton className="flex items-center gap-x-2">
                  <p className="font-semibold">Invita a Mariwano</p>
                  <ArrowRight size={18} strokeWidth={3} />
               </CustomButton>
            </Link>
            <Link href={githubLink} target="_blank" rel="noreferrer" className="flex items-center h-full">
               <CustomButton className="flex items-center py-3">
                  <Github />
               </CustomButton>
            </Link>
         </section>
      </div>
   );
}
