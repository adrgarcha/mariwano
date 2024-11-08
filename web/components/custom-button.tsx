import { cn } from '@/lib/utils';

interface CustomButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
   children: React.ReactNode;
   className?: string;
}

export default function CustomButton({ children, className, ...props }: CustomButtonProps) {
   return (
      <button
         {...props}
         className="relative h-full inline-flex items-center justify-center p-0.5 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800">
         <span
            className={cn(
               className,
               'relative h-full px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0 font-bold text-lg'
            )}>
            {children}
         </span>
      </button>
   );
}
