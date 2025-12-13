import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import MarketNewsClient from "./_components/market-news-client";

export default async function MarketNewsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <section className="flex flex-col items-start justify-start p-6 w-full bg-gray-50 min-h-screen">
      <MarketNewsClient />
    </section>
  );
}
