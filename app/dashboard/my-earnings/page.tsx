import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { DollarSign, TrendingUp, Calendar, Newspaper, CheckCircle2, Clock } from "lucide-react";

// Demo data for earnings
const DEMO_EARNINGS = {
  totalEarnings: 47850.00,
  thisMonth: 12450.00,
  pending: 8900.00,
  recentActivity: [
    {
      id: 1,
      date: "Dec 10, 2025",
      description: "Commission - Office Space Deal",
      property: "450 Park Avenue, 12th Floor",
      amount: 5200.00,
      status: "paid",
      dealType: "Lease Agreement"
    },
    {
      id: 2,
      date: "Dec 8, 2025",
      description: "Commission - Warehouse Match",
      property: "Industrial Complex, Building 3",
      amount: 3800.00,
      status: "paid",
      dealType: "Sale"
    },
    {
      id: 3,
      date: "Dec 5, 2025",
      description: "Referral Bonus - Retail Space",
      property: "Downtown Shopping Center",
      amount: 1450.00,
      status: "paid",
      dealType: "Referral"
    },
    {
      id: 4,
      date: "Dec 3, 2025",
      description: "Commission - Multi-Unit Deal",
      property: "Riverside Apartments, Units 101-105",
      amount: 2000.00,
      status: "paid",
      dealType: "Lease Agreement"
    },
    {
      id: 5,
      date: "Dec 1, 2025",
      description: "Commission - Commercial Property",
      property: "Tech Hub Office Building",
      amount: 6500.00,
      status: "pending",
      dealType: "Sale"
    },
    {
      id: 6,
      date: "Nov 28, 2025",
      description: "Commission - Warehouse Lease",
      property: "Logistics Center, Bay 7",
      amount: 2400.00,
      status: "pending",
      dealType: "Lease Agreement"
    },
  ]
};

export default async function MyEarningsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

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
              <p className="text-2xl font-bold">{formatCurrency(DEMO_EARNINGS.totalEarnings)}</p>
              <p className="text-xs text-muted-foreground mt-1">All time</p>
            </div>

            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <h3 className="text-sm font-medium text-muted-foreground">This Month</h3>
              </div>
              <p className="text-2xl font-bold">{formatCurrency(DEMO_EARNINGS.thisMonth)}</p>
              <p className="text-xs text-muted-foreground mt-1">December 2025</p>
            </div>

            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                <h3 className="text-sm font-medium text-muted-foreground">Pending</h3>
              </div>
              <p className="text-2xl font-bold">{formatCurrency(DEMO_EARNINGS.pending)}</p>
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
            <div className="space-y-4">
              {DEMO_EARNINGS.recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start justify-between p-4 rounded-lg border bg-muted/20 hover:bg-muted/40 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">{activity.description}</p>
                      {activity.status === "paid" ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <Clock className="h-4 w-4 text-yellow-600" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {activity.property}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{activity.date}</span>
                      <span>•</span>
                      <span>{activity.dealType}</span>
                      <span>•</span>
                      <span className={activity.status === "paid" ? "text-green-600 font-medium" : "text-yellow-600 font-medium"}>
                        {activity.status === "paid" ? "Paid" : "Pending"}
                      </span>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-lg font-bold text-green-600">
                      {formatCurrency(activity.amount)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
