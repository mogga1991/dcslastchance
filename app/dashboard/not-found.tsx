import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion, LayoutDashboard, ArrowLeft } from "lucide-react";

export default function DashboardNotFound() {
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-muted p-4">
            <FileQuestion className="h-10 w-10 text-muted-foreground" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-muted-foreground">
            404
          </h1>
          <h2 className="text-xl font-semibold">
            Page Not Found
          </h2>
          <p className="text-muted-foreground">
            This dashboard page doesn&apos;t exist or you don&apos;t have access to it.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/dashboard/gsa-leasing">
            <Button className="gap-2 w-full sm:w-auto">
              <LayoutDashboard className="h-4 w-4" />
              Go to Dashboard
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" className="gap-2 w-full sm:w-auto">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
