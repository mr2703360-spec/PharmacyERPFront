import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Download, Maximize2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImagePreviewDialogProps {
  src?: string;
  alt?: string;
  children: React.ReactNode;
}

export function ImagePreviewDialog({ src, alt, children }: ImagePreviewDialogProps) {
  if (!src) return <>{children}</>;

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = src;
    link.download = alt || "image";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="group relative inline-block cursor-pointer overflow-hidden rounded-md transition-all hover:ring-2 hover:ring-primary/50">
          {children}
          <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-center justify-center backdrop-blur-[1px]">
            <Maximize2 className="text-white h-5 w-5 drop-shadow-lg" />
          </div>
        </div>
      </DialogTrigger>
      
      {/* @ts-ignore - showCloseButton is custom in this shadcn setup */}
      <DialogContent 
        showCloseButton={false} 
        className="max-w-4xl border-white/10 bg-black/80 backdrop-blur-xl p-0 shadow-2xl sm:max-w-5xl overflow-hidden rounded-2xl"
      >
        <div className="flex flex-col w-full h-full relative">
          {/* Header Bar */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-b from-black/70 to-transparent absolute top-0 w-full z-10">
            <p className="text-white/90 font-medium text-sm drop-shadow-md truncate max-w-[80%] px-2">
              {alt || "عرض الصورة"}
            </p>
            <div className="flex items-center gap-2" dir="ltr">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white hover:bg-white/20 rounded-full h-8 w-8 transition-colors"
                onClick={handleDownload}
                title="تحميل الصورة"
              >
                <Download className="h-4 w-4" />
              </Button>
              <DialogClose asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-white hover:bg-red-500/80 hover:text-white rounded-full h-8 w-8 transition-colors"
                >
                  <X className="h-4 w-4" />
                </Button>
              </DialogClose>
            </div>
          </div>
          
          {/* Image Container */}
          <div className="relative flex items-center justify-center w-full min-h-[50vh] p-6 pt-16 pb-12">
            <img
              src={src}
              alt={alt || "Preview"}
              className="max-h-[80vh] w-auto max-w-full rounded-lg object-contain shadow-[0_0_50px_rgba(0,0,0,0.3)] transition-transform duration-700 hover:scale-[1.02] cursor-crosshair"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
