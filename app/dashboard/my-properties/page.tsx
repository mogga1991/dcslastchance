import { Suspense } from "react";
import MyPropertiesClientV2 from "./_components/my-properties-client-v2";

export const metadata = {
  title: "My Properties | FedSpace",
  description: "Manage your property listings, view GSA opportunity matches, and track saved opportunities",
};

export default function MyPropertiesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MyPropertiesClientV2 />
    </Suspense>
  );
}
