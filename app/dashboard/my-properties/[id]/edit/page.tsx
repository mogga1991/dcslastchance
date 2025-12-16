import { Suspense } from "react";
import EditPropertyClient from "./_components/edit-property-client";

export const metadata = {
  title: "Edit Property | FedSpace",
  description: "Edit your property listing details",
};

export default function EditPropertyPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EditPropertyClient />
    </Suspense>
  );
}
