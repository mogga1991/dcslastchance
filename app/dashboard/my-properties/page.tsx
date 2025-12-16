import { Suspense } from "react";
import MyPropertiesClient from "./_components/my-properties-client";

export const metadata = {
  title: "My Properties | FedSpace",
  description: "Manage your property listings and view GSA opportunity matches",
};

export default function MyPropertiesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MyPropertiesClient />
    </Suspense>
  );
}
