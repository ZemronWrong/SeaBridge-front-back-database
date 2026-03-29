import { useState, useEffect, useRef } from 'react';
import { Bell, BellRing, Check, CheckCircle2, Info, AlertTriangle, AlertCircle, X, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { apiFetch } from '../api';
import { toast } from 'sonner';

interface Notification {
  id: number;
  title: string;
  message: string;
  notification_type: 'success' | 'info' | 'warning' | 'error';
  link: string;
  is_read: boolean;
  created_at: string;
}

interface HeaderProps {
  title: string;
  onNavigate?: (view: any) => void;
}

export function Header({ title, onNavigate }: HeaderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const data = await apiFetch('/notifications/?unread_only=true');
      setNotifications(data);
      setUnreadCount(data.length);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 45000);
    
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      clearInterval(interval);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const markAsRead = async (id: number) => {
    try {
      await apiFetch(`/notifications/${id}/mark-read/`, { method: 'PATCH' });
      setNotifications(notifications.filter((n) => n.id !== id));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      toast.error('Failed to update notification status');
    }
  };

  const markAllRead = async () => {
    try {
      await apiFetch('/notifications/mark-all-read/', { method: 'POST' });
      setNotifications([]);
      setUnreadCount(0);
      setIsOpen(false);
      toast.success('All alerts marked as read');
    } catch (error) {
      toast.error('Failed to clear alerts');
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-6">
        <h2 className="text-lg font-bold text-gray-800">{title}</h2>
        
        {/* BELL MOVED TO LEFT NEXT TO TITLE FOR 100% VISIBILITY */}
        <div className="relative" ref={dropdownRef}>
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative h-10 w-10 focus:ring-2 focus:ring-blue-500 bg-gray-50"
            onClick={() => setIsOpen(!isOpen)}
          >
            {unreadCount > 0 ? (
              <>
                <BellRing className="w-5 h-5 text-blue-600 animate-pulse" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] bg-red-600 border-2 border-white pointer-events-none text-white">
                  {unreadCount}
                </Badge>
              </>
            ) : (
              <Bell className="w-5 h-5 text-gray-500" />
            )}
          </Button>

          {isOpen && (
            <div 
              style={{ backgroundColor: 'white', opacity: 1, border: '2px solid #2563eb' }}
              className="absolute left-0 top-12 w-80 max-w-[90vw] rounded-lg shadow-2xl z-[100] animate-in slide-in-from-top-2 duration-200"
            >
              <div 
                style={{ backgroundColor: '#ebf5ff' }}
                className="p-4 border-b flex items-center justify-between rounded-t-sm"
              >
                <h3 className="font-bold text-sm text-blue-900">System Alerts</h3>
                {unreadCount > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs h-8 text-blue-600 hover:text-blue-800"
                    onClick={markAllRead}
                  >
                    <Check className="w-3 h-3 mr-1" /> Clear All
                  </Button>
                )}
              </div>
              <ScrollArea className="h-[350px]">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 flex flex-col items-center gap-2">
                    <div className="bg-gray-100 p-3 rounded-full">
                      <Bell className="w-6 h-6 text-gray-300" />
                    </div>
                    <p className="text-sm">No unread alerts.</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {notifications.map((n) => (
                      <div key={n.id} className="p-4 hover:bg-blue-50/30 transition-colors relative group">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">{getIcon(n.notification_type)}</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold leading-none text-gray-900 mb-1">{n.title}</p>
                            <p className="text-xs text-gray-600 line-clamp-2">{n.message}</p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-[10px] text-gray-400">
                                {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              <div className="flex gap-2">
                                {n.link && onNavigate && (
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-6 w-6 bg-blue-50" 
                                    onClick={() => {
                                      onNavigate(n.link);
                                      markAsRead(n.id);
                                      setIsOpen(false);
                                    }}
                                  >
                                    <ExternalLink className="w-3 h-3 text-blue-600" />
                                  </Button>
                                )}
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-6 w-6 hover:bg-green-50" 
                                  onClick={() => markAsRead(n.id)}
                                >
                                  <Check className="w-3 h-3 text-gray-400 hover:text-green-600" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* User profile info moved to far right */}
        <div className="flex flex-col items-end">
          <span className="text-xs font-bold text-gray-900 capitalize">Active Session</span>
          <span className="text-[10px] text-gray-500 leading-none">Enterprise Platform</span>
        </div>
      </div>
    </header>
  );
}
