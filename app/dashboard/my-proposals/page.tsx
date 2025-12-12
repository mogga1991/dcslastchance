import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function MyProposalsPage() {
  const result = await auth.api.getSession({
    headers: await headers(),
  });

  if (!result?.session?.userId) {
    redirect("/sign-in");
  }

  return (
    <section className="flex flex-col items-start justify-start p-6 w-full">
      <div className="w-full">
        <div className="flex flex-col items-start justify-center gap-2">
          <h1 className="text-3xl font-semibold tracking-tight">
            My Proposals
          </h1>
          <p className="text-muted-foreground">
            Upload and analyze opportunities, get bid/no-bid scores, and let AI help you write winning proposals.
          </p>
        </div>
        <div className="@container/main flex flex-1 flex-col gap-2 mt-6">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            {/* My Proposals content will go here */}
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-2">No Proposals Yet</h3>
              <p className="text-muted-foreground">
                Upload your first opportunity to get AI-powered analysis and bid/no-bid recommendations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
