import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, DollarSign, TrendingUp, AlertCircle } from "lucide-react";

export default async function EarningsNewsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  // Mock news data - replace with actual data from your backend
  const newsItems = [
    {
      id: 1,
      type: "payment",
      title: "Commission Payment Scheduled",
      description: "Your December commission payment of $0.00 has been scheduled for December 31st.",
      date: "2025-12-13",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      id: 2,
      type: "update",
      title: "New Commission Structure Announced",
      description: "Updated commission rates will take effect starting January 2026. Review the new structure in your settings.",
      date: "2025-12-10",
      icon: TrendingUp,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      id: 3,
      type: "reminder",
      title: "Tax Document Preparation",
      description: "Year-end tax documents will be available in January. Ensure your payment details are up to date.",
      date: "2025-12-08",
      icon: AlertCircle,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ];

  return (
    <section className="flex flex-col items-start justify-start p-6 w-full">
      <div className="w-full">
        {/* Back Navigation */}
        <Link
          href="/dashboard/my-earnings"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to My Earnings
        </Link>

        {/* Page Header */}
        <div className="flex flex-col items-start justify-center gap-2 mb-6">
          <h1 className="text-3xl font-semibold tracking-tight">
            Earnings News
          </h1>
          <p className="text-muted-foreground">
            Stay informed about commission updates, payment schedules, and important financial announcements.
          </p>
        </div>

        {/* News Feed */}
        <div className="@container/main flex flex-1 flex-col gap-4">
          {newsItems.length > 0 ? (
            newsItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <div
                  key={item.id}
                  className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 ${item.bgColor} rounded-lg flex-shrink-0`}>
                      <IconComponent className={`h-6 w-6 ${item.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h3 className="text-lg font-semibold">{item.title}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground flex-shrink-0">
                          <Calendar className="h-4 w-4" />
                          {new Date(item.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                      </div>
                      <p className="text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-12">
              <div className="flex flex-col items-center justify-center text-center">
                <Calendar className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No News Yet</h3>
                <p className="text-muted-foreground max-w-md">
                  You don&apos;t have any earnings news at the moment. Check back here for commission updates,
                  payment schedules, and important financial announcements.
                </p>
              </div>
            </div>
          )}

          {/* Filter/Sort Options - Placeholder */}
          {newsItems.length > 0 && (
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4 mt-4">
              <p className="text-sm text-muted-foreground text-center">
                Showing {newsItems.length} recent updates
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
