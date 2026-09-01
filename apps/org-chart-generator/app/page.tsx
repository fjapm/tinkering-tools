import { OrgChartStudio } from "@/components/org-chart-studio";
import { StructuredData } from "@/components/structured-data";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

const APP_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: SITE_NAME,
  alternateName: "Organizational Chart Generator",
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Any (web browser)",
  browserRequirements: "Requires JavaScript",
  isAccessibleForFree: true,
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  featureList: [
    "Build an org chart from a plain text file",
    "Live preview while you type",
    "Headshots, phone numbers, email addresses, LinkedIn links and country flags",
    "Per-person and per-level colours",
    "Export to SVG, PNG and PDF",
  ],
  softwareHelp: { "@type": "CreativeWork", url: `${SITE_URL}/about` },
};

export default function Page() {
  return (
    <>
      <StructuredData data={APP_SCHEMA} />
      <OrgChartStudio />
    </>
  );
}
