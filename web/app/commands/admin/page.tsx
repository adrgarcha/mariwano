import Command from '@/components/command';

export default function Admin() {
   return (
      <>
         <Command title="config-suggestions" params={['channel']}>
            Añade (add) o elimina (remove) respectivamente la habilidad de los usuarios de poder usar el comando /suggest en el canal determinado en
            el parámetro channel.
         </Command>
         <Command title="config-reports" params={['channel']}>
            Añade (add) o elimina (remove) respectivamente la habilidad de los usuarios de poder usar el comando /report en el canal determinado en el
            parámetro channel.
         </Command>
         <Command title="config-welcome" params={['channel']}>
            Activa (add) o desactiva (remove) respectivamente el mensaje de bienvenida en el canal determinado en channel.
         </Command>
         <Command title="autorole-configure" params={['role']}>
            Determina el auto-rol del servidor, el rol que se asignará automáticamente por el bot a todos los usuarios nuevos del servidor.
         </Command>
         <Command title="autorole-disable">Desactiva la aplicación del auto-rol hacia los usuarios para todo el servidor.</Command>
         <Command title="notification-remove" params={['youtube-channel-id', 'notification-channel']}>
            Quitar las notificaciones por parte del bot del canal de YouTube cuyo ID es youtube-channel-id en el canal (del servidor de Discord)
            notification-channel.
         </Command>
         <Command title="notification-setup" params={['youtube-channel-id', 'notification-channel', 'custom-message']}>
            Añadir notificaciones de los nuevos vídeos que se suben al canal de YouTube con ID youtube-channel-id en el canal (del servidor de
            Discord) notification-channel.
         </Command>
         <Command title="meme-ranking" params={['channel']}>
            Añade (setup) o elimina (disable) el canal de ranking de memes que le indiques mediante el parámetro channel. Cada 7 días enviará un
            mensaje en el cual se mostrará un ranking con el top 3 mejores memes de la semana en función del número de reacciones de cada meme. Al
            ganador del primer puesto se le recompensará con un premio de 10.000 gramos, y si la misma persona se encuentra en los 3 puestos del
            ranking el premio será de 5.000 gramos.
         </Command>
      </>
   );
}
