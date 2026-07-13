import { Check } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import Reveal from "@/components/Reveal";
import EnquiryForm from "@/components/EnquiryForm";
import type { PricingPackage } from "@/lib/supabase/types";

export const revalidate = 60;

export default async function EjariPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("pricing_packages")
    .select("*")
    .order("display_order");

  const packages = (data ?? []) as PricingPackage[];

  return (
    <>
      <section className="max-w-content mx-auto px-6 lg:px-8 pt-16 pb-12 text-center">
        <Reveal>
          <h1 className="font-display text-5xl md:text-6xl">Ejari Packages</h1>
          <p className="mt-4 text-charcoal/60">
            Exclusively at Vision Tower, Business Bay
          </p>
        </Reveal>
      </section>

      <section className="max-w-content mx-auto px-6 lg:px-8 pb-20">
        <div className="grid md:grid-cols-3 gap-8 items-start">
          {packages.map((pkg, i) => (
            <Reveal key={pkg.id} delay={i * 0.1}>
              <div
                className={`rounded-2xl overflow-hidden border ${
                  pkg.featured ? "border-sage-500 shadow-xl scale-[1.03]" : "border-charcoal/10"
                }`}
              >
                <div
                  className={`py-6 text-center font-display text-xl ${
                    pkg.featured ? "bg-sage-500 text-cream" : "bg-charcoal text-cream"
                  }`}
                >
                  {pkg.name}
                </div>
                <div className="p-8 bg-white">
                  <p className="text-center">
                    <span className="text-xs align-top mr-1">AED</span>
                    <span className="font-display text-4xl">
                      {pkg.price_aed.toLocaleString()}
                    </span>
                  </p>
                  <p className="text-center text-xs text-charcoal/50 mb-6">
                    {pkg.billing_period}
                  </p>
                  <ul className="space-y-3">
                    {pkg.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-charcoal/70">
                        <Check size={15} className="text-sage-500 mt-0.5 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <a
                    href="#enquire"
                    className="mt-8 block text-center rounded-full bg-sage-500 text-cream py-3 text-sm font-medium hover:bg-sage-600 transition-colors"
                  >
                    Enquire Now
                  </a>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="max-w-content mx-auto px-6 lg:px-8 pb-24">
        <Reveal>
          <EnquiryForm defaultService="Business Address with Ejari" />
        </Reveal>
      </section>
    </>
  );
}
