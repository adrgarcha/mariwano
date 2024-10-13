'use client';

import { cn } from '@/lib/utils';
import { AudioLines, CircleDollarSign, Cog, Gavel, Globe2, PartyPopper } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const categories = [
   {
      id: 1,
      name: 'General',
      href: '/commands/general',
      icon: <Globe2 />,
   },
   {
      id: 2,
      name: 'Administración',
      href: '/commands/admin',
      icon: <Cog />,
   },
   {
      id: 3,
      name: 'Moderación',
      href: '/commands/moderation',
      icon: <Gavel />,
   },
   {
      id: 4,
      name: 'Economía',
      href: '/commands/economy',
      icon: <CircleDollarSign />,
   },
   {
      id: 5,
      name: 'Diversión',
      href: '/commands/fun',
      icon: <PartyPopper />,
   },
   {
      id: 6,
      name: 'Música',
      href: '/commands/music',
      icon: <AudioLines />,
   },
];

export default function CommandsLayout({ children }: { children: React.ReactNode }) {
   const pathname = usePathname();
   return (
      <div className="min-h-screen bg-slate-950">
         <div className="flex pt-12 min-h-screen">
            <aside className="min-h-full bg-slate-900">
               <ul className="px-5 py-1">
                  {categories.map(category => (
                     <li
                        key={category.id}
                        className={cn(
                           'my-4 px-3 py-1 rounded-lg hover:bg-indigo-900 transition-colors',
                           pathname === category.href && 'bg-indigo-900'
                        )}>
                        <Link href={category.href} className="flex items-center gap-x-4">
                           {category.icon}
                           <p className="font-semibold text-lg">{category.name}</p>
                        </Link>
                     </li>
                  ))}
               </ul>
            </aside>
            <section className="flex flex-col gap-y-8 mx-32 my-12 w-full">{children}</section>
         </div>
      </div>
   );
}
