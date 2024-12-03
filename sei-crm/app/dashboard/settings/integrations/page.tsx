import IntegrationsListview from "@/components/IntegrationsListview";
import { ServicesType } from "@/types";

const emailServices: ServicesType[] = [
  {
    id: "mail-gun",
    icon: "/mailgun-icon.svg",
    name: "Mailgun",
    description: "Mailgun Technologies Inc is an email delivery service.",
  },

  {
    id: "gmail-smtp-gun",
    icon: "/gmail-icon.svg",
    name: "Gmail SMTP",
    description: "Use Google Official Product For Send Email Anywhere.",
  },

  {
    id: "omm-email-service",
    icon: "/icon.webp",
    name: "OMM Email",
    description: "Use Our Own Email Service. OMM Email Service",
  },
];

const leadsServices: ServicesType[] = [
  {
    id: "login-with-facebook",
    icon: "/facebook-icon.svg",
    name: "Facebook Ads",
    description: "Mailgun Technologies Inc is an email delivery service.",
  },

  {
    id: "login-with-google",
    icon: "/google-ads-icon.svg",
    name: "Google Ads",
    description: "Use Google Official Product For Send Email Anywhere.",
  },
];

export default function page() {
  return (
    <div className="size-full py-5 space-y-8">
      <div>
        <h2 className="font-semibold">Email Service Integration</h2>
        <h3 className="text-sm text-gray-400">
          Configer your email service provider. you can setup your own smtp also
        </h3>

        <IntegrationsListview services={emailServices} />
      </div>

      <div>
        <h2 className="font-semibold">Leads Integration</h2>
        <h3 className="text-sm text-gray-400">
          If you want to get leads configer your leads providers
        </h3>

        <IntegrationsListview services={leadsServices} />
      </div>
    </div>
  );
}
