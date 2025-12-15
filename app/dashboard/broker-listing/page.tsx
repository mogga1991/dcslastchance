import BrokerListingClient from "./_components/broker-listing-client";
import { createClient } from "@/lib/supabase/server";

export default async function BrokerListingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return <BrokerListingClient userEmail={user?.email} />;
}
