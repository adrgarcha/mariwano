import Command from '@/components/command';

export default function Fun() {
   return (
      <>
         <Command title="arabfunny">
            هذا الأمر يتضمن اقتراح إرسال رسائل باللغة العربية. يمكن تغيير نصوص الأوامر حسب الرغبة دون أن تتجاوز مليوني حر
         </Command>
         <Command title="crearmeme" params={['urlimagen', 'textoarriba', 'textoabajo', 'efectos']}>
            A partir de la url de una imagen (una que acabe en .jpg o .png o .gif) añade un texto inferior y uno superior. Existe la opción de añadir
            un efecto (esferizar, desenfocar, etc.). Envía el resultado de la imagen (por ahora no puede enviar gifs).
         </Command>
         <Command title="fakeyou" params={['voz', 'textardo']}>
            Envía un audio con la voz hecha con la plataforma de IA FakeYou de tu ídolo/youtuber/streamer favorito. Introduce a la persona que quieres
            que recite el texto en el parametro voz (el código coge el primero que encuentre) y el texto en el otro parámetro.
         </Command>
         <Command title="frasejoker" params={['add', 'all']}>
            Envía una frase aleatoria digna de cita del Joker.
         </Command>
         <Command title="kahoot" params={['hardcore']}>
            Un trivia de cultura general, si respondes en 15 segundos con la respuesta correcta, te corresponde una recompensa en relación a la
            dificultad de la pregunta. En el modo hardcore sólo aparecen preguntas difíciles. Hay un límite de 5 preguntas diarias.
         </Command>
         <Command title="padalustro">⚠️ Advierte sobre el consumo de cannabis.</Command>
         <Command title="ryangosling">Envía una foto aleatoria de Ryan Gosling.</Command>
         <Command title="wordle">Juega al Wordle con el bot en el chat, intenta adivinar una palabra de 5 letras en 6 intentos.</Command>
         <Command title="imagendura">Envía una imagen más dura que el pan de ayer.</Command>
      </>
   );
}
