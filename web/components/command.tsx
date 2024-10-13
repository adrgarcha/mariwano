interface CommandProps {
   title: string;
   params?: string[];
   children: React.ReactNode;
}

export default function Command({ title, params, children }: CommandProps) {
   return (
      <section className="flex flex-col gap-y-1">
         <h3 className="font-bold text-2xl">/{title}</h3>
         <h5 className="font-semibold">Parámetros: {params ? params : 'Ninguno'}</h5>
         <p className="font-medium text-white/80">{children}</p>
      </section>
   );
}
