import dynamic from "next/dynamic";

const PermissionManagement = dynamic(
  () => import("@/components/Pages/PermissionManagement"),
  {
    ssr: false,
  }
);
export default async function page() {
  return <PermissionManagement />;
}
