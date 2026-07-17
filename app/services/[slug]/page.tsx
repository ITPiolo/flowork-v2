import { notFound } from "next/navigation";
import Image from "next/image";
import { Check } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import Reveal from "@/components/Reveal";
import EnquiryForm from "@/components/EnquiryForm";
import ServiceCard from "@/components/ServiceCard";
import type { Service } from "@/lib/supabase/types";

export const revalidate = 60;

const VIRTUAL_OFFICE_PLANS = [
  {
    name: "Virtual Office Annual",
    tagline: "Enhance your business presence and efficiency",
    price: "AED 12,000",
    period: "Per Year",
    payUrl: "https://buy.stripe.com/00g3cQ9Ou2DU52M5kl",
    features: [
      "Prestigious Business Address",
      "Dedicated Landline",
      "Answering Services",
      "Mail & Courier Management",
      "Free 88h Coworking Space Access",
      "Free Phone Booth Access",
    ],
  },
  {
    name: "Virtual Office Monthly",
    tagline: "Enhance your business presence and efficiency",
    price: "AED 1,200",
    period: "Per Month",
    payUrl: "https://buy.stripe.com/5kAdRu2m2diygLu8wC",
    features: [
      "Prestigious Business Address",
      "Dedicated Landline",
      "Answering Services",
      "Mail & Courier Management",
      "Free 88h Coworking Space Access",
      "Free Phone Booth Access",
    ],
  },
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("services")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!data) return {};
  const service = data as Service;
  return {
    title: service.name,
    description: service.tagline,
  };
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("services")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!data) notFound();
  const service = data as Service;
  const isVirtualOffice = slug === "virtual-office";

  const { data: allServices } = await supabase
    .from("services")
    .select("*")
    .order("display_order");
  const otherServices = ((allServices ?? []) as Service[]).filter(
    (s) => s.slug !== slug
  );

  return (
    <>
      <section className="max-w-content mx-auto px-6 lg:px-8 pt-16 pb-10 text-center">
        <Reveal>
          <h1 className="font-display text-5xl md:text-6xl">
            {service.name.split(" ")[0]}{" "}
            <span className="text-sage-500 italic">
              {service.name.split(" ").slice(1).join(" ")}
            </span>
          </h1>
        </Reveal>
      </section>

      {isVirtualOffice ? (
        <section className="max-w-content mx-auto px-6 lg:px-8 pb-20">
          <Reveal>
            <h2 className="font-display text-2xl md:text-3xl text-center mb-10">
              Select your virtual office package
            </h2>
          </Reveal>
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {VIRTUAL_OFFICE_PLANS.map((plan, i) => (
              <Reveal key={plan.name} delay={i * 0.1}>
                <div className="rounded-2xl border border-charcoal/10 overflow-hidden bg-white h-full flex flex-col">
                  <div className="p-8 flex-1">
                    <h3 className="font-display text-xl">{plan.name}</h3>
                    <p className="text-sm text-charcoal/60 mt-1">{plan.tagline}</p>
                    <p className="mt-6">
                      <span className="font-display text-3xl">{plan.price}</span>
                    </p>
                    <p className="text-xs text-charcoal/50 mb-6">{plan.period}</p>
                    <ul className="space-y-3">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-sm text-charcoal/75">
                          <Check size={15} className="text-sage-500 mt-0.5 shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <a
                    href={plan.payUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-center bg-sage-500 text-cream py-3.5 text-sm font-medium hover:bg-sage-600 transition-colors"
                  >
                    Pay Now
                  </a>
                  <p className="text-center text-xs text-charcoal/40 py-2">
                    Secure online payment
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
          {service.feature_image_url && (
            <Reveal delay={0.2}>
              <div className="relative aspect-[21/9] rounded-2xl overflow-hidden mt-12 max-w-3xl mx-auto">
                <Image
                  src={service.feature_image_url}
                  alt={service.name}
                  fill
                  quality={90}
                  className="object-cover"
                />
              </div>
            </Reveal>
          )}
        </section>
      ) : (
        <>
          <section className="max-w-content mx-auto px-6 lg:px-8 grid md:grid-cols-3 gap-4">
            <Reveal className="md:col-span-2">
              <div className="relative aspect-[16/9] rounded-2xl overflow-hidden">
                <Image src={service.hero_image_url} alt={service.name} fill quality={90} className="object-cover" />
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="relative aspect-[16/9] md:aspect-auto md:h-full rounded-2xl overflow-hidden">
                <Image src={service.feature_image_url} alt={service.feature_heading} fill quality={90} className="object-cover" />
              </div>
            </Reveal>
          </section>

          <section className="max-w-content mx-auto px-6 lg:px-8 py-16 grid md:grid-cols-2 gap-10">
            <Reveal>
              <h2 className="font-display text-2xl">The perks of {service.name.toLowerCase()}</h2>
            </Reveal>
            <Reveal delay={0.1}>
              <ul className="space-y-3">
                {service.perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-3 text-sm text-charcoal/75">
                    <Check size={16} className="text-sage-500 mt-0.5 shrink-0" />
                    {perk}
                  </li>
                ))}
              </ul>
            </Reveal>
          </section>

          <section className="bg-charcoal text-cream">
            <div className="max-w-content mx-auto px-6 lg:px-8 py-20 grid lg:grid-cols-2 gap-12 items-stretch">
              <Reveal className="flex flex-col justify-center">
                <h2 className="font-display text-3xl md:text-4xl">{service.feature_heading}</h2>
                <p className="mt-4 text-cream/70">{service.feature_body}</p>
              </Reveal>
              <Reveal delay={0.15} className="relative rounded-2xl overflow-hidden min-h-[300px]">
                <Image
                  src={service.feature_image_url}
                  alt={service.feature_heading}
                  fill
                  quality={90}
                  className="object-cover"
                />
              </Reveal>
            </div>
          </section>
        </>
      )}

      <section className="max-w-content mx-auto px-6 lg:px-8 py-20 grid lg:grid-cols-2 gap-12 items-stretch">
        <Reveal className="relative rounded-2xl overflow-hidden min-h-[400px]">
          <Image
            src={service.hero_image_url}
            alt={`Book ${service.name}`}
            fill
            quality={90}
            className="object-cover"
          />
        </Reveal>
        <Reveal delay={0.1}>
          <EnquiryForm
            defaultService={service.name}
            heading={`Book ${service.name.toLowerCase() === "meeting room" ? "a" : "your"} ${service.name}`}
          />
        </Reveal>
      </section>

      {otherServices.length > 0 && (
        <section className="max-w-content mx-auto px-6 lg:px-8 py-20 border-t border-charcoal/10">
          <Reveal>
            <span className="eyebrow">What else we offer</span>
            <h2 className="font-display text-3xl md:text-4xl mt-2">
              Explore flowork office spaces
            </h2>
          </Reveal>
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {otherServices.map((s, i) => (
              <Reveal key={s.id} delay={i * 0.08}>
                <ServiceCard
                  href={`/services/${s.slug}`}
                  image={s.hero_image_url}
                  title={s.name}
                  description={s.tagline}
                  perks={s.perks}
                />
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </>
  );
}