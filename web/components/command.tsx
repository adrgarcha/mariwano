interface CommandProps {
   title: string;
   params?: string[];
   children: React.ReactNode;
}

export default function Command({ title, params, children }: CommandProps) {
   return (
      <section className="flex flex-col gap-y-1">
         <h1 className="font-bold text-2xl">/{title}</h1>
         <h2 className="font-semibold">Parámetros: {params ? params.join(', ') : 'Ninguno'}</h2>
         <p className="font-medium text-white/80">{children}</p>
      </section>
   );
}
