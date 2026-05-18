import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ViewItemDialogProps<T> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: T | null;
  title: string;
  labels?: Partial<Record<keyof T, string>>;
  excludeKeys?: (keyof T)[];
}

export function ViewItemDialog<T extends Record<string, unknown>>({
  open,
  onOpenChange,
  item,
  title,
  labels = {},
  excludeKeys = ["_id", "__v", "createdAt", "updatedAt"], // default hidden
}: ViewItemDialogProps<T>) {
  if (!item) return null;

  const displayEntries = Object.entries(item).filter(
    ([key]) => !excludeKeys.includes(key as keyof T),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-w-2xl" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {displayEntries.map(([key, value]) => (
            <div key={key} className="flex flex-col gap-1">
              <span className="text-sm font-medium text-muted-foreground">
                {labels[key as keyof T] || key}
              </span>
              <div className="rounded-md border bg-muted/50 p-2 text-sm">
                {
                typeof value === "object" ? JSON.stringify(value, null, 2)  : String(value)  
                  }
              </div>
              {key === "image" && typeof value === "string" && (
                <img
                  src={value}
                  alt={key}
                  className=" size-16 rounded-md object-cover"
                />
              )}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
