"use client";

import { useUser } from "@clerk/nextjs";

export default function TestClerk() {
  const { isLoaded, isSignedIn, user } = useUser();

  if (!isLoaded) {
    return <div className="p-8">Loading Clerk...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Clerk Test Page</h1>
      <div className="space-y-2">
        <p>✅ Clerk is loaded: {isLoaded ? "Yes" : "No"}</p>
        <p>User signed in: {isSignedIn ? "Yes" : "No"}</p>
        {user && <p>User email: {user.primaryEmailAddress?.emailAddress}</p>}
      </div>
    </div>
  );
}
