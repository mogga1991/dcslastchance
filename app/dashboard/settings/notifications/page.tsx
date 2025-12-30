'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function NotificationSettingsPage() {
  const [preferences, setPreferences] = useState({
    in_app_enabled: true,
    push_enabled: true,
    perfect_match_notify: true,
    perfect_match_push: true,
    high_quality_notify: true,
    high_quality_push: false,
    standard_match_notify: true,
    standard_match_push: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    loadPreferences();
  }, []);

  async function loadPreferences() {
    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .single();

    if (!error && data) {
      setPreferences(data);
    }

    setLoading(false);
  }

  async function savePreferences() {
    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('notification_preferences')
      .upsert({
        user_id: user.id,
        ...preferences,
      });

    if (!error) {
      toast.success('Preferences saved!');
    } else {
      toast.error('Failed to save preferences');
    }

    setSaving(false);
  }

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Notification Settings</h1>
        <p className="text-gray-600 mt-2">
          Manage how you receive updates about property matches
        </p>
      </div>

      {/* Channels */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Channels</CardTitle>
          <CardDescription>Choose how you want to receive notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="in_app" className="text-base">In-App Notifications</Label>
              <p className="text-sm text-gray-500">Show notifications in the app</p>
            </div>
            <Switch
              id="in_app"
              checked={preferences.in_app_enabled}
              onCheckedChange={(checked) => setPreferences({ ...preferences, in_app_enabled: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="push" className="text-base">Browser Push Notifications</Label>
              <p className="text-sm text-gray-500">Get push alerts in your browser</p>
            </div>
            <Switch
              id="push"
              checked={preferences.push_enabled}
              onCheckedChange={(checked) => setPreferences({ ...preferences, push_enabled: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Match Tiers */}
      <Card>
        <CardHeader>
          <CardTitle>Match Quality Preferences</CardTitle>
          <CardDescription>Control which types of matches trigger notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Perfect Matches */}
          <div className="border-l-4 border-yellow-500 pl-4">
            <h4 className="font-semibold mb-2">Perfect Matches (Grade A, 85+)</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="perfect_notify">Show in notification center</Label>
                <Switch
                  id="perfect_notify"
                  checked={preferences.perfect_match_notify}
                  onCheckedChange={(checked) => setPreferences({ ...preferences, perfect_match_notify: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="perfect_push">Send browser push</Label>
                <Switch
                  id="perfect_push"
                  checked={preferences.perfect_match_push}
                  onCheckedChange={(checked) => setPreferences({ ...preferences, perfect_match_push: checked })}
                />
              </div>
            </div>
          </div>

          {/* High-Quality Matches */}
          <div className="border-l-4 border-blue-500 pl-4">
            <h4 className="font-semibold mb-2">High-Quality Matches (Grade A/B, 70+)</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="high_notify">Show in notification center</Label>
                <Switch
                  id="high_notify"
                  checked={preferences.high_quality_notify}
                  onCheckedChange={(checked) => setPreferences({ ...preferences, high_quality_notify: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="high_push">Send browser push</Label>
                <Switch
                  id="high_push"
                  checked={preferences.high_quality_push}
                  onCheckedChange={(checked) => setPreferences({ ...preferences, high_quality_push: checked })}
                />
              </div>
            </div>
          </div>

          {/* Standard Matches */}
          <div className="border-l-4 border-gray-400 pl-4">
            <h4 className="font-semibold mb-2">Standard Matches (40-69)</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="standard_notify">Show in notification center</Label>
                <Switch
                  id="standard_notify"
                  checked={preferences.standard_match_notify}
                  onCheckedChange={(checked) => setPreferences({ ...preferences, standard_match_notify: checked })}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button onClick={savePreferences} disabled={saving} className="w-full">
        {saving ? 'Saving...' : 'Save Preferences'}
      </Button>
    </div>
  );
}
