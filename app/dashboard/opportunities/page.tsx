import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default async function OpportunitiesPage() {
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
            Opportunities
          </h1>
          <p className="text-muted-foreground">
            Explore federal procurement opportunities and GSA leasing listings.
          </p>
        </div>
        <div className="@container/main flex flex-1 flex-col gap-2 mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* GSA Leasing Card */}
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-2">GSA Leasing Opportunities</h3>
              <p className="text-muted-foreground mb-4">
                Browse expiring federal building leases and IOLP requirements from GSA.
              </p>
              <Link href="/dashboard/gsa-leasing">
                <Button className="gap-2">
                  View GSA Leasing
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* Saved Opportunities Card */}
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-2">Saved Opportunities</h3>
              <p className="text-muted-foreground mb-4">
                View your bookmarked opportunities for quick access later.
              </p>
              <Link href="/dashboard/saved-opportunities">
                <Button variant="outline" className="gap-2">
                  View Saved
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
