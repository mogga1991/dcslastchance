/**
 * Subscribe to Push Notifications API
 * Registers browser push subscription for a user
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { endpoint, p256dhKey, authKey, userAgent } = await request.json();

    if (!endpoint || !p256dhKey || !authKey) {
      return NextResponse.json(
        { error: 'Missing required fields: endpoint, p256dhKey, authKey' },
        { status: 400 }
      );
    }

    // Detect device type from user agent
    const deviceType = detectDeviceType(userAgent || '');

    // Upsert subscription
    const { data, error } = await supabase
      .from('push_subscriptions')
      .upsert({
        user_id: user.id,
        endpoint,
        p256dh_key: p256dhKey,
        auth_key: authKey,
        user_agent: userAgent,
        device_type: deviceType,
        active: true,
      }, {
        onConflict: 'endpoint',
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, subscription: data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

function detectDeviceType(userAgent: string): string {
  if (/mobile/i.test(userAgent)) return 'mobile';
  if (/tablet/i.test(userAgent)) return 'tablet';
  return 'desktop';
}
