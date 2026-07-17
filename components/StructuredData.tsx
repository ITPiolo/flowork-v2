// JSON-LD structured data so Google can understand this is a real
// business (name, address, phone) and potentially show richer search
// results. Only includes facts we've actually confirmed are real —
// no fabricated ratings, hours, or review counts.

export default function StructuredData() {
  const data = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: "flowork",
    url: "https://flowork.ae",
    telephone: "+971-4-560-8200",
    email: "connect@flowork.ae",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Dubai Hills Estate, Business Park, Building 4, 7th Floor",
      addressLocality: "Dubai",
      addressCountry: "AE",
    },
    sameAs: [
      "https://www.facebook.com/Flowork.me/",
      "https://www.instagram.com/flowork.me/",
      "https://ae.linkedin.com/company/flowork-me",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}