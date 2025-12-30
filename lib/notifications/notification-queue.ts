/**
 * Notification Queue Service
 * Queues notifications for delivery and handles deduplication
 */

import { createClient } from '@supabase/supabase-js';
import { createHash } from 'crypto';

export interface NotificationPayload {
  userId: string;
  type: 'perfect_match' | 'high_quality_match' | 'new_match' | 'match_update' | 'sync_complete' | 'property_action';
  priority: 'urgent' | 'high' | 'normal' | 'low';
  title: string;
  message: string;
  actionLabel?: string;
  actionUrl?: string;
  propertyId?: string;
  opportunityId?: string;
  matchId?: string;
  matchScore?: number;
  matchGrade?: string;
  aiInsight?: string;
  aiGenerated?: boolean;
}

export interface NotificationQueueOptions {
  skipDuplicateCheck?: boolean;
  expiresInDays?: number;
  sendPush?: boolean;
}

export class NotificationQueue {
  private supabase;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Generate deduplication key for notification
   */
  private generateDedupKey(payload: NotificationPayload): string {
    const components = [
      payload.userId,
      payload.matchId || '',
      payload.type,
      payload.matchScore || '',
    ].join('|');

    return createHash('sha256').update(components).digest('hex');
  }

  /**
   * Check if notification was already sent (within last 24 hours)
   */
  private async isDuplicate(dedupKey: string): Promise<boolean> {
    const { data } = await this.supabase
      .from('notification_history')
      .select('id')
      .eq('dedup_key', dedupKey)
      .gte('expires_at', new Date().toISOString())
      .single();

    return !!data;
  }

  /**
   * Check user's notification preferences
   */
  private async getUserPreferences(userId: string) {
    const { data, error } = await this.supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      // Return defaults if preferences not set
      return {
        in_app_enabled: true,
        push_enabled: true,
        perfect_match_notify: true,
        perfect_match_push: true,
        high_quality_notify: true,
        high_quality_push: false,
        standard_match_notify: true,
        standard_match_push: false,
        quiet_hours_enabled: false,
      };
    }

    return data;
  }

  /**
   * Check if we're in user's quiet hours
   */
  private isQuietHours(preferences: any): boolean {
    if (!preferences.quiet_hours_enabled) return false;

    const now = new Date();
    const userTime = new Intl.DateTimeFormat('en-US', {
      timeZone: preferences.quiet_hours_timezone || 'America/Denver',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(now);

    const currentTime = userTime.replace(':', '');
    const startTime = preferences.quiet_hours_start?.replace(':', '') || '2200';
    const endTime = preferences.quiet_hours_end?.replace(':', '') || '0800';

    if (startTime > endTime) {
      // Overnight quiet hours (e.g., 22:00 - 08:00)
      return currentTime >= startTime || currentTime < endTime;
    } else {
      return currentTime >= startTime && currentTime < endTime;
    }
  }

  /**
   * Queue a notification for delivery
   */
  async queue(
    payload: NotificationPayload,
    options: NotificationQueueOptions = {}
  ): Promise<{ success: boolean; notificationId?: string; reason?: string }> {
    // 1. Check user preferences
    const preferences = await this.getUserPreferences(payload.userId);

    if (!preferences.in_app_enabled) {
      return { success: false, reason: 'User has disabled in-app notifications' };
    }

    // Check type-specific preferences
    const typePreferences: Record<string, boolean> = {
      perfect_match: preferences.perfect_match_notify,
      high_quality_match: preferences.high_quality_notify,
      new_match: preferences.standard_match_notify,
    };

    if (payload.type in typePreferences && !typePreferences[payload.type]) {
      return { success: false, reason: `User has disabled ${payload.type} notifications` };
    }

    // 2. Check for duplicates (unless explicitly skipped)
    if (!options.skipDuplicateCheck && payload.matchId) {
      const dedupKey = this.generateDedupKey(payload);
      const isDupe = await this.isDuplicate(dedupKey);

      if (isDupe) {
        return { success: false, reason: 'Duplicate notification (already sent within 24h)' };
      }

      // Record in history
      await this.supabase.from('notification_history').insert({
        user_id: payload.userId,
        dedup_key: dedupKey,
        notification_type: payload.type,
        match_id: payload.matchId,
      });
    }

    // 3. Create notification record
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (options.expiresInDays || 30));

    const { data, error } = await this.supabase
      .from('notifications')
      .insert({
        user_id: payload.userId,
        type: payload.type,
        priority: payload.priority,
        title: payload.title,
        message: payload.message,
        action_label: payload.actionLabel,
        action_url: payload.actionUrl,
        property_id: payload.propertyId,
        opportunity_id: payload.opportunityId,
        match_id: payload.matchId,
        match_score: payload.matchScore,
        match_grade: payload.matchGrade,
        ai_insight: payload.aiInsight,
        ai_generated: payload.aiGenerated || false,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create notification:', error);
      return { success: false, reason: error.message };
    }

    // 4. Queue push notification if enabled and not in quiet hours
    const shouldSendPush =
      options.sendPush !== false &&
      preferences.push_enabled &&
      !this.isQuietHours(preferences);

    if (shouldSendPush) {
      // Push sending will be handled by separate service
      // Just mark that we intend to send it
      await this.supabase
        .from('notifications')
        .update({ sent_push: false })
        .eq('id', data.id);
    }

    return { success: true, notificationId: data.id };
  }

  /**
   * Batch queue notifications (for bulk matching)
   */
  async queueBatch(
    payloads: NotificationPayload[],
    options: NotificationQueueOptions = {}
  ): Promise<{ queued: number; skipped: number; errors: string[] }> {
    const results = await Promise.allSettled(
      payloads.map(payload => this.queue(payload, options))
    );

    let queued = 0;
    let skipped = 0;
    const errors: string[] = [];

    results.forEach((result, idx) => {
      if (result.status === 'fulfilled' && result.value.success) {
        queued++;
      } else if (result.status === 'fulfilled') {
        skipped++;
      } else {
        errors.push(`Payload ${idx}: ${result.reason}`);
      }
    });

    return { queued, skipped, errors };
  }
}
