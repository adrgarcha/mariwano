import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Command, Event } from '../lib/types';

interface ReadFilesCallback {
   folderName: string;
   filePath: string;
   obj: Command | Event;
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function readFiles(rootPath: string, callback: ({ folderName, filePath, obj }: ReadFilesCallback) => void) {
   const foldersPath = path.join(__dirname, rootPath);
   const folders = fs.readdirSync(foldersPath);

   for (const folder of folders) {
      const childPath = path.join(foldersPath, folder);
      const files = fs.readdirSync(childPath).filter((file: string) => file.endsWith('.ts'));
      for (const file of files) {
         const filePath = path.join(childPath, file).replace('C:', 'file:///C:');
         const obj = await import(filePath);
         callback({ folderName: folder, filePath, obj });
      }
   }
}
