import Command from '@/components/command';
import { Metadata } from 'next';

export const metadata: Metadata = {
   title: 'Comandos generales | Mariwano',
   description: 'Información sobre los comandos de propósito general de Mariwano.',
};

export default function General() {
   return (
      <>
         <Command title="help">Muestra una lista con todos los comandos del bot.</Command>
         <Command title="server-info">Muestra información relevante acerca del servidor de Discord en el que te encuentres.</Command>
         <Command title="suggest">
            Envia una sugerencia en el canal de sugerencias que se haya configurado previamente en el servidor, si no existe un canal de sugerencias
            el bot enviara un mensaje indicando el comando a usar para configurarlo. Una vez creada la sugerencia, apareceran dos botones con los
            cuales podras votar a favor o en contra de la sugerencia. Y un administrador del servidor podra aprobar o rechazar dicha sugerencia.
         </Command>
         <Command title="report">
            Su funcionamiento es similar al comando anterior. Envia un informe en el canal de informes que se haya configurado previamente en el
            servidor, si no existe un canal de informes el bot enviara un mensaje indicando el comando a usar para configurarlo. Una vez creado el
            informe, el administrador podra marcarlo como solucionado o como falso si no se trataba de un informe válido.
         </Command>
      </>
   );
}
