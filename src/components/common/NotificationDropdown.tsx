import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Bell, 
  Check, 
  Trash2, 
  Info, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  Clock
} from "lucide-react";
import { useAtomValue } from "jotai";
import { formatDistanceToNow } from "date-fns";
import { arEG } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications } from "@/queries/notifications";
import { unreadNotificationsCountAtom } from "@/atoms";

export function NotificationDropdown() {
  const { 
    notifications, 
    markReadMutation, 
    markAllReadMutation, 
    deleteMutation 
  } = useNotifications();
  const unreadCount = useAtomValue(unreadNotificationsCountAtom);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleNotificationClick = (notification: any) => {
    if (!notification.isRead) {
      markReadMutation.mutate(notification._id);
    }
    if (notification.link) {
      navigate(notification.link);
      setIsOpen(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "success": return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case "warning": return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case "error": return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full p-0 text-[10px]"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 md:w-96">
        <DropdownMenuLabel className="flex items-center justify-between font-normal">
          <div className="flex items-center gap-2">
            <span className="font-bold">الإشعارات</span>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                {unreadCount} جديد
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 text-xs text-primary"
              onClick={(e) => {
                e.preventDefault();
                markAllReadMutation.mutate();
              }}
              disabled={markAllReadMutation.isPending}
            >
              <Check className="ml-1 h-3 w-3" />
              تحديد الكل كمقروء
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <ScrollArea className="h-[300px] md:h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8 text-center space-y-3">
              <div className="bg-muted p-3 rounded-full">
                <Bell className="h-6 w-6 opacity-50" />
              </div>
              <p className="text-sm">لا توجد إشعارات حالياً</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((notification) => (
                <div 
                  key={notification._id}
                  className={`flex gap-3 p-3 border-b last:border-0 transition-colors ${
                    !notification.isRead ? "bg-primary/5" : "hover:bg-muted/50"
                  } ${notification.link ? "cursor-pointer" : ""}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="shrink-0 mt-1">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm ${!notification.isRead ? "font-bold text-foreground" : "font-medium text-foreground/80"}`}>
                        {notification.title}
                      </p>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(notification.createdAt), { 
                          addSuffix: true,
                          locale: arEG 
                        })}
                      </span>
                    </div>
                    <p className={`text-xs ${!notification.isRead ? "text-foreground/90" : "text-muted-foreground"} line-clamp-2`}>
                      {notification.message}
                    </p>
                  </div>
                  <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                     {/* For a delete button if needed, but usually clicking the item is enough */}
                     <Button 
                       variant="ghost" 
                       size="icon" 
                       className="h-6 w-6 text-muted-foreground hover:text-destructive"
                       onClick={(e) => {
                         e.stopPropagation();
                         deleteMutation.mutate(notification._id);
                       }}
                     >
                       <Trash2 className="h-3 w-3" />
                     </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
