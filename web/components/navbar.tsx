import { Home, Menu, Terminal, Users2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import mariwanoIcon from '../../assets/mariwano-icon.png';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';

const navbarLinks = [
   {
      id: 1,
      name: 'Inicio',
      href: '/',
      icon: <Home size={18} />,
   },
   {
      id: 2,
      name: 'Comandos',
      href: '/commands',
      icon: <Terminal size={18} />,
   },
   {
      id: 3,
      name: 'Comunidad',
      href: '/community',
      icon: <Users2 size={18} />,
   },
];

export default function Navbar() {
   return (
      <nav className="flex items-center justify-between w-full fixed z-10 px-3 pr-6 bg-indigo-950 border-b-2 border-b-indigo-900/20">
         <section className="flex items-center gap-x-1">
            <Image src={mariwanoIcon} alt="mariwano bot logo" className="size-10 m-1 rounded-lg" />
            <p className="font-semibold text-lg">Mariwano</p>
         </section>
         <ul className="hidden md:flex gap-x-8">
            {navbarLinks.map(link => (
               <li key={link.id} className="px-2 py-1 rounded-lg hover:bg-indigo-900 transition-colors">
                  <Link href={link.href} className="flex gap-x-2 items-center">
                     {link.icon}
                     <p className="font-semibold">{link.name}</p>
                  </Link>
               </li>
            ))}
         </ul>
         <DropdownMenu>
            <DropdownMenuTrigger className="md:hidden">
               <Menu size={24} />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
               {navbarLinks.map(link => (
                  <Link key={link.id} href={link.href}>
                     <DropdownMenuItem className="flex gap-x-2 items-center">
                        {link.icon}
                        <p className="font-semibold">{link.name}</p>
                     </DropdownMenuItem>
                  </Link>
               ))}
            </DropdownMenuContent>
         </DropdownMenu>
      </nav>
   );
}
