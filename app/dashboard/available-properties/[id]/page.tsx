import { Suspense } from "react";
import PropertyDetailClient from "./_components/property-detail-client";

export const metadata = {
  title: "Property Details | FedSpace",
  description: "View detailed information about this commercial property",
};

export default async function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading property details...</p>
        </div>
      </div>
    }>
      <PropertyDetailClient propertyId={id} />
    </Suspense>
  );
}
