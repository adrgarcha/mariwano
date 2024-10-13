import Command from '@/components/command';

export default function Music() {
   return (
      <>
         <Command title="play" params={['query']}>
            Añade a la cola una canción de YouTube o Spotify, también se puede añadir todas las canciones de una playlist a la cola poniendo el enlace
            de la playlist. También se admiten de YouTube a parte de canciones poner el audio de cualquier vídeo.
         </Command>
         <Command title="pause">Pausa la canción que se esté reproduciendo en ese momento. Si ya está en pausa, renauda la canción.</Command>
         <Command title="now-playing">Muestra la canción que se está reproduciendo.</Command>
         <Command title="clear">Elimina de la cola todas las canciones que se encuentren en ella.</Command>
         <Command title="previous">Reproduce la canción anterior.</Command>
         <Command title="skip">Salta a la siguiente canción de la cola.</Command>
         <Command title="stop">Detiene toda la música actual y provoca que el bot salga del chat de voz.</Command>
         <Command title="shuffle">Mezcla aleatoriamente el orden de las canciones de la cola.</Command>
         <Command title="loop" params={['mode']}>
            Pone la canción/sonido/vídeo actualmente retransmitiéndose o toda la cola en bucle:
            <ul className="list-disc list-inside">
               <li>Modo Off: desactiva el bucle de la cola o la canción actual.</li>
               <li>Modo Track: pone la canción actual en bucle.</li>
               <li>Modo Queue: cuando termine la última canción de la cola, volverá a repetirse la cola hasta que se desactive el modo.</li>
               <li>
                  Modo Autoplay: cuando termine la última canción de la cola, automáticamente se añadirá una nueva canción parecida al último track.
               </li>
            </ul>
         </Command>
         <Command title="clear">Elimina de la cola todas las canciones presentes en ella.</Command>
      </>
   );
}
