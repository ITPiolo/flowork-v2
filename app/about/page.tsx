import Image from "next/image";
import Reveal from "@/components/Reveal";
import AnimatedStat from "@/components/AnimatedStat";

export const metadata = {
  title: "About flowork | Dubai Business Centres",
  description: "flowork offers fully furnished, flexible workspaces across Dubai Hills and Business Bay — built for modern, growing businesses.",
};

const STATS = [
  { value: "1000+", label: "Businesses supported" },
  { value: "2", label: "Dubai locations" },
  { value: "50+", label: "Team members" },
  { value: "2024", label: "Founded" },
];

export default function AboutPage() {
  return (
    <>
      <section className="max-w-content mx-auto px-6 lg:px-8 pt-24 pb-16">
        <Reveal>
          <span className="eyebrow">About flowork</span>
          <h1 className="font-display text-5xl md:text-6xl mt-2 max-w-2xl">
            A workspace built around how businesses actually grow
          </h1>
          <p className="mt-6 max-w-2xl text-charcoal/70 text-lg">
            flowork offers fully furnished, lockable offices with optional
            private amenities — meeting rooms, coworking access, a podcast
            room, phone booths, event space, and a boardroom. We go beyond
            being just a business centre: we&rsquo;re a vibrant hub that
            values collaboration and empowerment.
          </p>
        </Reveal>
      </section>

      <section className="max-w-content mx-auto px-6 lg:px-8 pb-8">
        <Reveal>
          <div className="relative aspect-[21/9] rounded-2xl overflow-hidden">
            <Image
              src="/images/Co-Working-02-Copy.jpg"
              alt="flowork workspace"
              fill
              quality={90}
              className="object-cover"
            />
          </div>
        </Reveal>
      </section>

      <section className="bg-charcoal py-16 sm:py-20">
        <div className="max-w-content mx-auto px-5 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {STATS.map((s) => (
            <AnimatedStat key={s.label} value={s.value} label={s.label} />
          ))}
        </div>
      </section>

      <section className="max-w-content mx-auto px-6 lg:px-8 py-24 sm:py-28 grid md:grid-cols-2 gap-12 md:gap-20">
        <Reveal>
          <h2 className="font-display text-2xl mb-4">Our approach</h2>
          <p className="text-charcoal/70 leading-relaxed">
            Our workspace solutions include high-speed Wi-Fi, cleaning
            services, and flexible furniture layouts. Customise your space
            with adaptable terms, allowing you to scale as your business
            grows — without the financial burden and long-term commitments
            of traditional office leases.
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="font-display text-2xl mb-4">Our community</h2>
          <p className="text-charcoal/70 leading-relaxed">
            Our private and secure community encourages meaningful
            connections, collective thinking, and the generation of new
            ideas. By cultivating an inspiring working space, we aim to
            spark creativity and motivate individuals to strive for
            excellence in their endeavours.
          </p>
        </Reveal>
      </section>
    </>
  );
}