import Navbar from '@/components/navbar';
import { ThemeProvider } from '@/components/theme-provider';
import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';

const font = Poppins({ weight: ['400', '500', '600', '700', '800', '900'], subsets: ['latin'] });

export const metadata: Metadata = {
   title: 'Inicio | Mariwano',
   description: 'La página de inicio de Mariwano.',
};

export default function RootLayout({
   children,
}: Readonly<{
   children: React.ReactNode;
}>) {
   return (
      <html lang="es" className={font.className} suppressHydrationWarning>
         <body className="font-[unset]" suppressHydrationWarning>
            <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
               <header>
                  <Navbar />
               </header>
               <main className="h-full">{children}</main>
            </ThemeProvider>
         </body>
      </html>
   );
}
