import { Metadata } from 'next';

export const metadata: Metadata = {
   title: 'Comandos | Mariwano',
   description: 'Información sobre los comandos que puedes usar con Mariwano.',
};

export default function Commands() {
   return (
      <div className="flex flex-col items-center justify-center gap-y-4 w-full h-full">
         <h2 className="font-semibold text-center text-3xl">Comandos de Mariwano</h2>
         <p className="font-medium text-center w-80 md:w-[575px] text-white/80">
            Aquí podrás consultar todos los comandos disponibles de Mariwano, para cualquier duda puedes utilizar el comando /help dentro del servidor
            para más información.
         </p>
      </div>
   );
}
