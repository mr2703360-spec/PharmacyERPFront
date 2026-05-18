import { cn } from "@/lib/utils";

type Props = {
  className?: string;
};

export default function Loader({ className }: Readonly<Props>) {
  return (
    <div
      className={cn(
        "animate-in duration-700 ease-linear repeat-infinite spin-in-360 rounded-full size-14 border-2 border-blue-100 border-t-primary",
        className
      )}
    ></div>
  );
}
