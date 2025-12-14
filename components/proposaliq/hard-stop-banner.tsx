import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TriangleAlert } from "lucide-react";

type HardStop = {
  type: string;
  detail: string;
};

type HardStopBannerProps = {
  items: HardStop[];
};

export function HardStopBanner({ items }: HardStopBannerProps) {
  if (!items?.length) return null;

  return (
    <Alert className="rounded-2xl border-destructive" variant="destructive">
      <TriangleAlert className="h-5 w-5" />
      <AlertTitle className="text-base font-semibold">
        Hard Stop: Ineligible / High Rejection Risk
      </AlertTitle>
      <AlertDescription className="mt-2">
        <ul className="list-disc space-y-2 pl-5">
          {items.map((item, i) => (
            <li key={i} className="text-sm">
              <span className="font-medium">{item.type}:</span>{" "}
              <span>{item.detail}</span>
            </li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
}
