"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AuthDebugPage() {
  const [authState, setAuthState] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        // Get the current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        // Get the current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        setAuthState({
          session: session,
          user: user,
          sessionError: sessionError,
          userError: userError,
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        });
      } catch (error) {
        setAuthState({ error: String(error) });
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, []);

  if (loading) {
    return <div className="p-8">Loading auth state...</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Auth Debug Information</h1>

      <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="font-semibold mb-2">Supabase URL:</h2>
        <p className="font-mono text-sm">{authState?.supabaseUrl}</p>
      </div>

      <div className="bg-gray-100 p-4 rounded-lg mt-4">
        <h2 className="font-semibold mb-2">User:</h2>
        <pre className="text-xs overflow-auto">
          {JSON.stringify(authState?.user, null, 2)}
        </pre>
      </div>

      <div className="bg-gray-100 p-4 rounded-lg mt-4">
        <h2 className="font-semibold mb-2">Session:</h2>
        <pre className="text-xs overflow-auto">
          {JSON.stringify(authState?.session, null, 2)}
        </pre>
      </div>

      {authState?.sessionError && (
        <div className="bg-red-100 p-4 rounded-lg mt-4">
          <h2 className="font-semibold mb-2 text-red-700">Session Error:</h2>
          <pre className="text-xs overflow-auto text-red-700">
            {JSON.stringify(authState?.sessionError, null, 2)}
          </pre>
        </div>
      )}

      {authState?.userError && (
        <div className="bg-red-100 p-4 rounded-lg mt-4">
          <h2 className="font-semibold mb-2 text-red-700">User Error:</h2>
          <pre className="text-xs overflow-auto text-red-700">
            {JSON.stringify(authState?.userError, null, 2)}
          </pre>
        </div>
      )}

      <div className="mt-6">
        <button
          onClick={() => window.location.href = '/sign-in'}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Back to Sign In
        </button>
      </div>
    </div>
  );
}
