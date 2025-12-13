import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { DollarSign, TrendingUp, Calendar, Newspaper } from "lucide-react";

export default async function MyEarningsPage() {
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
            My Earnings
          </h1>
          <p className="text-muted-foreground">
            Track your earnings, commissions, and financial performance.
          </p>
        </div>

        <div className="@container/main flex flex-1 flex-col gap-2 mt-6">
          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <h3 className="text-sm font-medium text-muted-foreground">Total Earnings</h3>
              </div>
              <p className="text-2xl font-bold">$0.00</p>
              <p className="text-xs text-muted-foreground mt-1">All time</p>
            </div>

            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <h3 className="text-sm font-medium text-muted-foreground">This Month</h3>
              </div>
              <p className="text-2xl font-bold">$0.00</p>
              <p className="text-xs text-muted-foreground mt-1">December 2025</p>
            </div>

            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                <h3 className="text-sm font-medium text-muted-foreground">Pending</h3>
              </div>
              <p className="text-2xl font-bold">$0.00</p>
              <p className="text-xs text-muted-foreground mt-1">Awaiting payment</p>
            </div>
          </div>

          {/* Navigation Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Link href="/dashboard/my-earnings/news">
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Newspaper className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold">Earnings News</h3>
                </div>
                <p className="text-muted-foreground text-sm">
                  Stay updated with commission updates, payment schedules, and financial news.
                </p>
              </div>
            </Link>

            {/* Placeholder for future sections */}
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 opacity-50">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-gray-600" />
                </div>
                <h3 className="text-lg font-semibold">Payment History</h3>
              </div>
              <p className="text-muted-foreground text-sm">
                View detailed payment history and transaction records.
              </p>
              <p className="text-xs text-blue-600 mt-2">Coming Soon</p>
            </div>

            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 opacity-50">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-gray-600" />
                </div>
                <h3 className="text-lg font-semibold">Performance Analytics</h3>
              </div>
              <p className="text-muted-foreground text-sm">
                Analyze your earning trends and performance metrics.
              </p>
              <p className="text-xs text-blue-600 mt-2">Coming Soon</p>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 mt-6">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                No earnings activity yet. Start by closing deals to see your commissions here.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
