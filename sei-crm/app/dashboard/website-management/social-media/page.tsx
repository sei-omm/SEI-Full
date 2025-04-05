import dynamic from "next/dynamic";

const SocialLinks = dynamic(() => import("@/components/Pages/SocialLinks"), {
  ssr: false,
});

export default function SocialLinksPage() {
  return <SocialLinks />;
}
