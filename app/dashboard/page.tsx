import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SectionCards } from "./_components/section-cards";
import { SolicitationsTable } from "./_components/solicitations-table";

export default async function Dashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <section className="flex flex-col items-start justify-start p-6 w-full">
      <div className="w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col items-start justify-center gap-2">
          <h1 className="text-3xl font-semibold tracking-tight">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Federal contracting opportunities
          </p>
        </div>

        {/* Stats Cards */}
        <div className="@container/main flex flex-1 flex-col gap-2">
          <SectionCards />
        </div>

        {/* Main Solicitations Table */}
        <SolicitationsTable />
      </div>
    </section>
  );
}
