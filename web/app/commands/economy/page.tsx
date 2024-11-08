import Command from '@/components/command';
import { Metadata } from 'next';

export const metadata: Metadata = {
   title: 'Comandos de economía | Mariwano',
   description: 'Información sobre los comandos para gestionar la economía del servidor de Mariwano.',
};

export default function Economy() {
   return (
      <>
         <Command title="balance" params={['user']}>
            Muestra tu propio balance o el de un usuario que hayas mencionado en el parámetro opcional.
         </Command>
         <Command title="daily">Recolectas tus 1.000 gramos diarios. Úsalo cada día para ganar unos pocos gramos.</Command>
         <Command title="donate" params={['user', 'amount']}>
            Envía una cantidad de dinero específica al usuario que quieras. Como mínimo tiene que ser 1.
         </Command>
         <Command title="gamble" params={['amount']}>
            Apuesta una cantidad de gramos, como mínimo 100.
         </Command>
         <Command title="invertir" params={['amount', 'user']}>
            Invierte en un usuario que esté en un canal. Cuanto más gramos ganéis, más beneficios generáis entre tú y el usuario y más rentable hacéis
            el canal. Cuanto más rentable sea el canal, más gramos se podrán ganar. Si el canal está en déficit, no podréis ganar nada pero podréis
            sacar al canal del déficit. Para recargar los beneficios o pérdidas pon /invertir claim pero antes debes hacer una inversión con /invertir
            new.
         </Command>
         <Command title="leaderboard">Muestra el top 10 de personas más ricas del servidor.</Command>
         <Command title="level" params={['user']}>
            Muestra el nivel de experiencia de la persona mencionada si es que se ha mencionado, sino muestra la del propio usuario.
         </Command>
         <Command title="shop">
            Compra un rango personalizado del servidor por el precio de 7000 gramos. Se puede elegir el color, el nombre y se puede editar el mismo
            por 3000 gramos.
         </Command>
      </>
   );
}
