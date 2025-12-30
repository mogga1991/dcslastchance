/**
 * Browser Push Notification Service (Web Push API)
 * Handles push notification delivery to subscribed browsers
 */

import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: {
    url?: string;
    notificationId?: string;
    matchId?: string;
  };
}

export class PushNotificationService {
  private supabase;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);

    // Configure web-push with VAPID keys
    const vapidPublicKey = process.env.VAPID_PUBLIC_KEY!;
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY!;
    const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:support@fedspace.com';

    if (!vapidPublicKey || !vapidPrivateKey) {
      throw new Error('VAPID keys not configured');
    }

    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
  }

  /**
   * Send push notification to all user's active subscriptions
   */
  async sendToUser(userId: string, payload: PushPayload): Promise<{
    sent: number;
    failed: number;
    errors: string[];
  }> {
    // Fetch user's active push subscriptions
    const { data: subscriptions, error } = await this.supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('active', true);

    if (error || !subscriptions || subscriptions.length === 0) {
      return { sent: 0, failed: 0, errors: [] };
    }

    const results = await Promise.allSettled(
      subscriptions.map(sub => this.sendToSubscription(sub, payload))
    );

    let sent = 0;
    let failed = 0;
    const errors: string[] = [];

    results.forEach((result, idx) => {
      const subscription = subscriptions[idx];

      if (result.status === 'fulfilled' && result.value.success) {
        sent++;
      } else {
        failed++;
        const error = result.status === 'rejected'
          ? result.reason
          : result.value.error;

        errors.push(`Subscription ${subscription.endpoint.slice(0, 50)}...: ${error}`);

        // Increment error count
        this.handleSubscriptionError(subscription.id);
      }
    });

    return { sent, failed, errors };
  }

  /**
   * Send to specific subscription
   */
  private async sendToSubscription(
    subscription: any,
    payload: PushPayload
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const pushSubscription = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.p256dh_key,
          auth: subscription.auth_key,
        },
      };

      await webpush.sendNotification(
        pushSubscription,
        JSON.stringify(payload)
      );

      // Update last_sent_at
      await this.supabase
        .from('push_subscriptions')
        .update({
          last_sent_at: new Date().toISOString(),
          last_error: null,
        })
        .eq('id', subscription.id);

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Unknown push error'
      };
    }
  }

  /**
   * Handle subscription error (increment count, possibly deactivate)
   */
  private async handleSubscriptionError(subscriptionId: string) {
    // Increment error_count - the database trigger will auto-deactivate after 5 errors
    const { data: current } = await this.supabase
      .from('push_subscriptions')
      .select('error_count')
      .eq('id', subscriptionId)
      .single();

    if (current) {
      await this.supabase
        .from('push_subscriptions')
        .update({
          error_count: (current.error_count || 0) + 1,
          last_error: new Date().toISOString(),
        })
        .eq('id', subscriptionId);
    }
  }

  /**
   * Process pending push notifications from database
   */
  async processPendingNotifications(): Promise<{
    processed: number;
    sent: number;
    failed: number;
  }> {
    // Fetch notifications that need push delivery
    const { data: notifications } = await this.supabase
      .from('notifications')
      .select('*')
      .eq('sent_push', false)
      .is('push_error', null)
      .order('created_at', { ascending: true })
      .limit(100);

    if (!notifications || notifications.length === 0) {
      return { processed: 0, sent: 0, failed: 0 };
    }

    let sent = 0;
    let failed = 0;

    for (const notif of notifications) {
      const payload: PushPayload = {
        title: notif.title,
        body: notif.message,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-96x96.png',
        data: {
          url: notif.action_url,
          notificationId: notif.id,
          matchId: notif.match_id,
        },
      };

      const result = await this.sendToUser(notif.user_id, payload);

      if (result.sent > 0) {
        sent++;
        await this.supabase
          .from('notifications')
          .update({
            sent_push: true,
            sent_push_at: new Date().toISOString()
          })
          .eq('id', notif.id);
      } else {
        failed++;
        await this.supabase
          .from('notifications')
          .update({
            push_error: result.errors.join('; ')
          })
          .eq('id', notif.id);
      }
    }

    return { processed: notifications.length, sent, failed };
  }
}
