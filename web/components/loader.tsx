import { LoaderCircle } from 'lucide-react';

export default function Loader() {
   return (
      <div className="flex items-center justify-center h-full">
         <LoaderCircle size={52} strokeWidth={3} color="#3730a3" className="animate-spin" />
      </div>
   );
}
