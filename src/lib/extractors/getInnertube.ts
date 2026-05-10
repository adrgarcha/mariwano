import { Innertube, UniversalCache, Platform } from 'youtubei.js';

let innertubeInstance: Innertube | null = null;

(Platform.shim as unknown as { eval: (data: { output: string }, env: { n?: string; sig?: string }) => unknown }).eval = async (
   data: { output: string },
   env: { n?: string; sig?: string }
) => {
   const properties: string[] = [];

   if (env.n) properties.push(`n: exportedVars.nFunction("${env.n}")`);
   if (env.sig) properties.push(`sig: exportedVars.sigFunction("${env.sig}")`);

   const code = `${data.output}\nreturn { ${properties.join(', ')} }`;

   return new Function(code)();
};

export async function getInnertube(cookies?: string): Promise<Innertube> {
   if (!innertubeInstance) {
      innertubeInstance = await Innertube.create({
         cache: new UniversalCache(false),
         cookie: cookies,
      });
   }
   return innertubeInstance;
}
