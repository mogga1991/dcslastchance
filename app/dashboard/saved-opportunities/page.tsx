import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function SavedOpportunitiesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <section className="flex flex-col items-start justify-start p-6 w-full">
      <div className="w-full">
        <div className="flex flex-col items-start justify-center gap-2">
          <h1 className="text-3xl font-semibold tracking-tight">
            Saved Opportunities
          </h1>
          <p className="text-muted-foreground">
            Your saved government procurement solicitations from SAM.gov that you can review later.
          </p>
        </div>
        <div className="@container/main flex flex-1 flex-col gap-2 mt-6">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            {/* Saved Opportunities content will go here */}
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-2">No Saved Opportunities</h3>
              <p className="text-muted-foreground">
                You haven&apos;t saved any opportunities yet. Start browsing and save the ones you&apos;re interested in.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
