import Command from '@/components/command';
import { Metadata } from 'next';

export const metadata: Metadata = {
   title: 'Comandos de moderación | Mariwano',
   description: 'Información sobre los comandos destinados a moderar el servidor de Mariwano.',
};

export default function Moderation() {
   return (
      <>
         <Command title="ban" params={['target-user', 'reason']}>
            Banea a el usuario introducido en target-user con la opción de dar una razón en la casilla de reason. El usuario no podrá volver a entrar
            hasta que un administrador le quite el baneo.
         </Command>
         <Command title="kick" params={['target-user', 'reason']}>
            Expulsa del servidor al usuario introducido en target-user con la opción de dar una razón con el parámetro reason. El usuario podrá ser
            invitado de vuelta al servidor.
         </Command>
         <Command title="timeout" params={['target-user', 'duration', 'reason']}>
            Banea a un usuario por un determinado tiempo puesto en duration. En dicho parámetro se debe introducir la cantidad de tiempo junto la
            primera letra de la unidad de tiempo, por ejemplo 15m resultaría en un baneo de 15 minutos.
         </Command>
      </>
   );
}
