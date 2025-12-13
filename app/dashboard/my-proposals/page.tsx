import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import MyProposalsClient from "./_components/my-proposals-client";

export default async function MyProposalsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <section className="flex flex-col items-start justify-start p-6 w-full bg-gray-50 min-h-screen">
      <MyProposalsClient />
    </section>
  );
}
