import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Building2, Calendar, Home, Bookmark, ArrowRight } from "lucide-react";
import Link from "next/link";

async function getDashboardStats(userId: string) {
  try {
    const supabase = await createClient();

    // Fetch opportunities count from GSA API
    let opportunitiesCount = 0;
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const response = await fetch(`${baseUrl}/api/gsa-leasing?limit=1`, {
        cache: 'no-store'
      });
      if (response.ok) {
        const data = await response.json();
        opportunitiesCount = data.totalRecords || 0;
      }
    } catch (err) {
      console.error('Error fetching opportunities count:', err);
    }

    // Fetch stats in parallel using Supabase directly
    const [brokersResult, savedResult] = await Promise.all([
      // User's broker listings
      supabase
        .from("broker_listings")
        .select("id", { count: 'exact', head: true }),
      // Saved opportunities
      supabase
        .from("saved_opportunities")
        .select("id", { count: 'exact', head: true })
        .eq("user_id", userId),
    ]);

    return {
      gsaOpportunities: opportunitiesCount,
      expiringLeases: 0, // Will be populated from external API in the future
      brokerListings: brokersResult.count || 0,
      savedOpportunities: savedResult.count || 0,
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      gsaOpportunities: 0,
      expiringLeases: 0,
      brokerListings: 0,
      savedOpportunities: 0,
    };
  }
}

export default async function Dashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const stats = await getDashboardStats(user.id);

  return (
    <section className="flex flex-col items-start justify-start p-6 w-full">
      <div className="w-full max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col items-start justify-center gap-2">
          <h1 className="text-3xl font-semibold tracking-tight">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Your GSA leasing opportunities at a glance
          </p>
        </div>

        {/* Stats Grid - 2x2 on desktop, stack on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Opportunities */}
          <StatCard
            icon={<Building2 className="w-6 h-6" />}
            count={stats.gsaOpportunities}
            label="Opportunities"
            href="/dashboard/gsa-leasing"
          />

          {/* Expiring Leases */}
          <StatCard
            icon={<Calendar className="w-6 h-6" />}
            count={stats.expiringLeases}
            label="Expiring Leases (24 Months)"
            href="/dashboard/gsa-leasing"
          />

          {/* Broker Listings */}
          <StatCard
            icon={<Home className="w-6 h-6" />}
            count={stats.brokerListings}
            label="Your Broker Listings"
            href="/dashboard/broker-listing"
          />

          {/* Saved Opportunities */}
          <StatCard
            icon={<Bookmark className="w-6 h-6" />}
            count={stats.savedOpportunities}
            label="Saved Opportunities"
            href="/dashboard/saved-opportunities"
          />
        </div>

        {/* CTA Card */}
        <Link href="/dashboard/gsa-leasing">
          <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-8 transition-all hover:shadow-lg hover:scale-[1.02] cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  Explore Leasing Opportunities
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Browse federal leasing opportunities and find matches for your properties
                </p>
              </div>
              <ArrowRight className="w-8 h-8 text-blue-600 dark:text-blue-400 group-hover:translate-x-2 transition-transform" />
            </div>
          </div>
        </Link>

        {/* Commented out: ProposalIQ/Analysis stats - Not MVP relevant
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            icon={<FileText className="w-6 h-6" />}
            count={0}
            label="Analyses This Month"
          />
          <StatCard
            icon={<DollarSign className="w-6 h-6" />}
            count={0}
            label="Potential Revenue"
          />
          <StatCard
            icon={<Users className="w-6 h-6" />}
            count={0}
            label="Team Members"
          />
        </div>
        */}

        {/* Commented out: Subscription/Payment widgets - Not MVP relevant
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Subscription Status</h3>
              <p className="text-sm text-muted-foreground">Free Plan</p>
            </div>
            <Button>Upgrade</Button>
          </div>
        </div>
        */}

        {/* Commented out: Market news feed - Not MVP relevant
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold mb-4">Market News</h3>
          <div className="space-y-4">
            // News items would go here
          </div>
        </div>
        */}

        {/* Commented out: Team activity - Not MVP relevant
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold mb-4">Recent Team Activity</h3>
          <div className="space-y-4">
            // Activity items would go here
          </div>
        </div>
        */}

        {/* Commented out: Revenue/earnings widgets - Not MVP relevant
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-lg border bg-card p-6">
            <h3 className="font-semibold mb-4">Monthly Earnings</h3>
            <p className="text-3xl font-bold">$0</p>
          </div>
          <div className="rounded-lg border bg-card p-6">
            <h3 className="font-semibold mb-4">Total Revenue</h3>
            <p className="text-3xl font-bold">$0</p>
          </div>
        </div>
        */}
      </div>
    </section>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  count: number;
  label: string;
  href?: string;
}

function StatCard({ icon, count, label, href }: StatCardProps) {
  const content = (
    <div className="rounded-xl border bg-card p-6 transition-all hover:shadow-md hover:scale-[1.02] cursor-pointer">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="text-muted-foreground mb-3">
            {icon}
          </div>
          <div className="space-y-1">
            <p className="text-4xl font-bold tracking-tight">
              {count.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">
              {label}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
