import GSALeasingClient from "./_components/gsa-leasing-client";
import { createClient } from "@/lib/supabase/server";

export default async function GSALeasingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return <GSALeasingClient userEmail={user?.email} />;
}
