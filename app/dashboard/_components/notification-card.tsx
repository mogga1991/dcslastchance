'use client';

import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';
import { Star, TrendingUp, FileText, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const NOTIFICATION_ICONS = {
  perfect_match: Star,
  high_quality_match: TrendingUp,
  new_match: FileText,
  match_update: AlertCircle,
  sync_complete: FileText,
  property_action: AlertCircle,
};

const NOTIFICATION_COLORS = {
  perfect_match: 'text-yellow-500',
  high_quality_match: 'text-blue-500',
  new_match: 'text-gray-500',
  match_update: 'text-purple-500',
  sync_complete: 'text-green-500',
  property_action: 'text-red-500',
};

interface NotificationCardProps {
  notification: {
    id: string;
    type: string;
    title: string;
    message: string;
    action_label?: string;
    action_url?: string;
    match_score?: number;
    match_grade?: string;
    ai_insight?: string;
    read: boolean;
    created_at: string;
  };
  onMarkAsRead: () => void;
}

export function NotificationCard({ notification, onMarkAsRead }: NotificationCardProps) {
  const router = useRouter();
  const Icon = NOTIFICATION_ICONS[notification.type as keyof typeof NOTIFICATION_ICONS] || FileText;
  const iconColor = NOTIFICATION_COLORS[notification.type as keyof typeof NOTIFICATION_COLORS] || 'text-gray-500';

  function handleClick() {
    if (!notification.read) {
      onMarkAsRead();
    }

    if (notification.action_url) {
      router.push(notification.action_url);
    }
  }

  return (
    <div
      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
        !notification.read ? 'bg-blue-50/50' : ''
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`mt-1 ${iconColor}`}>
          <Icon className="h-5 w-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className={`font-medium text-sm ${!notification.read ? 'font-semibold' : ''}`}>
              {notification.title}
            </h4>
            {notification.match_grade && (
              <Badge variant="outline" className="shrink-0">
                Grade {notification.match_grade}
              </Badge>
            )}
          </div>

          <p className="text-sm text-gray-600 mb-2">{notification.message}</p>

          {/* AI Insight */}
          {notification.ai_insight && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-2">
              <p className="text-xs text-purple-900 font-medium mb-1">AI Insight</p>
              <p className="text-xs text-purple-800">{notification.ai_insight}</p>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
            </span>

            {notification.action_label && (
              <Button variant="ghost" size="sm" className="h-7 text-xs">
                {notification.action_label}
              </Button>
            )}
          </div>
        </div>

        {/* Unread indicator */}
        {!notification.read && (
          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 shrink-0" />
        )}
      </div>
    </div>
  );
}
