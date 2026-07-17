import type { Config } from "@measured/puck";
import Image from "next/image";
import Link from "next/link";
import PuckImageField from "@/components/admin/PuckImageField";
import HeroBlock from "@/components/blocks/HeroBlock";
import TestimonialsBlock from "@/components/blocks/TestimonialsBlock";

// Defines every block your client can drag onto the canvas in the
// custom page builder (/admin/pages). Composite blocks (Hero, TextImage,
// CTA...) are quick page starters. Atomic blocks (Heading, Paragraph,
// Image, Button, Divider...) are fully independent and can each be
// dragged, resized, and reordered on their own for true freeform layout.

const HEADING_SIZES: Record<string, string> = {
  sm: "text-2xl md:text-3xl",
  md: "text-3xl md:text-4xl",
  lg: "text-4xl md:text-5xl",
  xl: "text-5xl md:text-6xl",
};

const TEXT_SIZES: Record<string, string> = {
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg",
  xl: "text-xl",
};

const ASPECTS: Record<string, string> = {
  square: "aspect-square",
  landscape: "aspect-[4/3]",
  widescreen: "aspect-[16/9]",
  portrait: "aspect-[3/4]",
};

const BG_VARIANTS: Record<string, string> = {
  charcoal: "bg-charcoal text-cream",
  sage: "bg-sage-500 text-cream",
  cream: "bg-cream text-charcoal",
  white: "bg-white text-charcoal",
};

const sizeField = {
  type: "select" as const,
  options: [
    { label: "Small", value: "sm" },
    { label: "Medium", value: "md" },
    { label: "Large", value: "lg" },
    { label: "Extra large", value: "xl" },
  ],
};

const alignField = {
  type: "select" as const,
  options: [
    { label: "Left", value: "left" },
    { label: "Center", value: "center" },
  ],
};

const aspectField = {
  type: "select" as const,
  options: [
    { label: "Square", value: "square" },
    { label: "Landscape (4:3)", value: "landscape" },
    { label: "Widescreen (16:9)", value: "widescreen" },
    { label: "Portrait (3:4)", value: "portrait" },
  ],
};

const bgField = {
  type: "select" as const,
  options: [
    { label: "Charcoal (dark)", value: "charcoal" },
    { label: "Sage green", value: "sage" },
    { label: "Cream", value: "cream" },
    { label: "White", value: "white" },
  ],
};

const widthField = {
  type: "select" as const,
  options: [
    { label: "Narrow", value: "max-w-xl" },
    { label: "Medium", value: "max-w-3xl" },
    { label: "Wide", value: "max-w-5xl" },
    { label: "Full", value: "max-w-content" },
  ],
};

const imageField = (label: string) => ({
  type: "custom" as const,
  label,
  render: ({ value, onChange }: { value?: string; onChange: (v: string) => void }) => (
    <PuckImageField value={value} onChange={onChange} />
  ),
});

export const puckConfig: Config = {
  categories: {
    sections: {
      title: "Ready-made sections",
      components: ["Hero", "RotatingHero", "TextImage", "Gallery", "Testimonial", "TestimonialsCarousel", "CTA", "FAQAccordion", "Stats", "TrustBar", "WhyFlowork"],
    },
    elements: {
      title: "Individual elements",
      components: ["Heading", "Paragraph", "ImageBlock", "ButtonBlock", "Divider", "Spacer", "LogoStrip"],
    },
  },
  components: {
    // ===== SECTIONS (composite, quick starters) =====

    Hero: {
      fields: {
        heading: { type: "text" },
        subheading: { type: "textarea" },
        imageUrl: imageField("Background image"),
        buttonLabel: { type: "text" },
        buttonHref: { type: "text" },
        align: alignField,
        headingSize: sizeField,
        height: {
          type: "select",
          options: [
            { label: "Short", value: "short" },
            { label: "Medium", value: "medium" },
            { label: "Tall", value: "tall" },
          ],
        },
      },
      defaultProps: {
        heading: "Your heading here",
        subheading: "A short supporting line goes here.",
        imageUrl: "/images/Reception-01-rd-1536x1182.jpg",
        buttonLabel: "Enquire Now",
        buttonHref: "/#enquire",
        align: "left",
        headingSize: "lg",
        height: "medium",
      },
      render: ({ heading, subheading, imageUrl, buttonLabel, buttonHref, align, headingSize, height }) => {
        const heightClass = { short: "h-[50vh]", medium: "h-[70vh]", tall: "h-[90vh]" }[height as string] || "h-[70vh]";
        const alignClass = align === "center" ? "items-center text-center" : "items-start text-left";
        return (
          <section className={`relative ${heightClass} min-h-[380px] w-full overflow-hidden`}>
            <Image src={imageUrl} alt={heading} fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/25 to-charcoal/10" />
            <div className={`relative h-full max-w-content mx-auto px-6 lg:px-8 flex flex-col justify-end pb-16 ${alignClass}`}>
              <h1 className={`font-display text-cream max-w-2xl leading-tight ${HEADING_SIZES[headingSize as string] || HEADING_SIZES.lg}`}>
                {heading}
              </h1>
              <p className="mt-4 text-cream/75 max-w-lg">{subheading}</p>
              {buttonLabel && (
                <Link
                  href={buttonHref || "#"}
                  className="mt-8 inline-flex items-center rounded-full bg-sage-500 text-cream px-7 py-3.5 text-sm font-medium hover:bg-sage-600 transition-colors"
                >
                  {buttonLabel}
                </Link>
              )}
            </div>
          </section>
        );
      },
    },

    TextImage: {
      fields: {
        heading: { type: "text" },
        body: { type: "textarea" },
        imageUrl: imageField("Image"),
        imagePosition: {
          type: "select",
          options: [
            { label: "Image on right", value: "right" },
            { label: "Image on left", value: "left" },
          ],
        },
        imageAspect: aspectField,
        headingSize: sizeField,
      },
      defaultProps: {
        heading: "Section heading",
        body: "Supporting paragraph text goes here.",
        imageUrl: "/images/Co-Working-02-Copy.jpg",
        imagePosition: "right",
        imageAspect: "landscape",
        headingSize: "md",
      },
      render: ({ heading, body, imageUrl, imagePosition, imageAspect, headingSize }) => {
        const textBlock = (
          <div key="text">
            <h2 className={`font-display mb-4 ${HEADING_SIZES[headingSize as string] || HEADING_SIZES.md}`}>{heading}</h2>
            <p className="text-charcoal/70 leading-relaxed">{body}</p>
          </div>
        );
        const imageBlock = (
          <div key="image" className={`relative rounded-2xl overflow-hidden ${ASPECTS[imageAspect as string] || ASPECTS.landscape}`}>
            <Image src={imageUrl} alt={heading} fill className="object-cover" />
          </div>
        );
        return (
          <section className="max-w-content mx-auto px-6 lg:px-8 py-16 grid md:grid-cols-2 gap-12 items-center">
            {imagePosition === "left" ? [imageBlock, textBlock] : [textBlock, imageBlock]}
          </section>
        );
      },
    },

    Gallery: {
      fields: {
        images: {
          type: "array",
          arrayFields: {
            url: imageField("Image"),
            caption: { type: "text" },
          },
          getItemSummary: (item) => item.caption || "Image",
        },
        columns: {
          type: "select",
          options: [
            { label: "2 columns", value: "2" },
            { label: "3 columns", value: "3" },
            { label: "4 columns", value: "4" },
          ],
        },
        aspect: aspectField,
      },
      defaultProps: { images: [], columns: "3", aspect: "square" },
      render: ({ images, columns, aspect }) => {
        const colClass = { "2": "md:grid-cols-2", "3": "md:grid-cols-3", "4": "md:grid-cols-4" }[columns as string] || "md:grid-cols-3";
        return (
          <section className="max-w-content mx-auto px-6 lg:px-8 py-16">
            <div className={`grid grid-cols-2 ${colClass} gap-4`}>
              {(images || []).map((img: any, i: number) => (
                <div key={i} className={`relative rounded-xl overflow-hidden ${ASPECTS[aspect as string] || ASPECTS.square}`}>
                  <Image src={img.url} alt={img.caption || "Gallery image"} fill className="object-cover" />
                </div>
              ))}
            </div>
          </section>
        );
      },
    },

    Testimonial: {
      fields: {
        quote: { type: "textarea" },
        author: { type: "text" },
        background: bgField,
        align: alignField,
      },
      defaultProps: {
        quote: "This is a testimonial quote.",
        author: "Name, Role",
        background: "charcoal",
        align: "center",
      },
      render: ({ quote, author, background, align }) => (
        <section className={`${BG_VARIANTS[background as string] || BG_VARIANTS.charcoal} py-20`}>
          <div className={`max-w-2xl mx-auto px-6 ${align === "left" ? "text-left" : "text-center"}`}>
            <p className="font-display text-2xl leading-relaxed">&ldquo;{quote}&rdquo;</p>
            <p className="mt-6 text-sm opacity-60">{author}</p>
          </div>
        </section>
      ),
    },

    CTA: {
      fields: {
        heading: { type: "text" },
        buttonLabel: { type: "text" },
        buttonHref: { type: "text" },
        background: bgField,
      },
      defaultProps: {
        heading: "Ready to get started?",
        buttonLabel: "Enquire Now",
        buttonHref: "/#enquire",
        background: "sage",
      },
      render: ({ heading, buttonLabel, buttonHref, background }) => (
        <section className={`${BG_VARIANTS[background as string] || BG_VARIANTS.sage} py-16 text-center`}>
          <h2 className="font-display text-3xl mb-6">{heading}</h2>
          <Link
            href={buttonHref || "#"}
            className="inline-flex items-center rounded-full bg-cream text-charcoal px-7 py-3.5 text-sm font-medium hover:bg-cream/90 transition-colors"
          >
            {buttonLabel}
          </Link>
        </section>
      ),
    },

    Stats: {
      fields: {
        stat1Value: { type: "text" },
        stat1Label: { type: "text" },
        stat2Value: { type: "text" },
        stat2Label: { type: "text" },
        stat3Value: { type: "text" },
        stat3Label: { type: "text" },
        stat4Value: { type: "text" },
        stat4Label: { type: "text" },
        background: bgField,
      },
      defaultProps: {
        stat1Value: "130+", stat1Label: "Offices across Dubai",
        stat2Value: "90+", stat2Label: "Coworking spaces",
        stat3Value: "2", stat3Label: "Prime locations",
        stat4Value: "1000+", stat4Label: "Businesses served",
        background: "charcoal",
      },
      render: (props: any) => (
        <section className={BG_VARIANTS[props.background] || BG_VARIANTS.charcoal}>
          <div className="max-w-content mx-auto px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 divide-x divide-current/10">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="py-10 text-center">
                <p className="font-display text-4xl">{props[`stat${n}Value`]}</p>
                <p className="mt-2 text-sm opacity-70">{props[`stat${n}Label`]}</p>
              </div>
            ))}
          </div>
        </section>
      ),
    },

    FAQAccordion: {
      fields: {
        q1: { type: "text" }, a1: { type: "textarea" },
        q2: { type: "text" }, a2: { type: "textarea" },
        q3: { type: "text" }, a3: { type: "textarea" },
      },
      defaultProps: {
        q1: "Question one?", a1: "Answer one.",
        q2: "Question two?", a2: "Answer two.",
        q3: "Question three?", a3: "Answer three.",
      },
      render: (props: any) => (
        <section className="max-w-3xl mx-auto px-6 lg:px-8 py-16">
          <div className="divide-y divide-charcoal/10 border-t border-b border-charcoal/10">
            {[1, 2, 3].map((n) =>
              props[`q${n}`] ? (
                <details key={n} className="py-4 group">
                  <summary className="cursor-pointer font-display text-lg list-none flex items-center justify-between">
                    {props[`q${n}`]}
                    <span className="text-sage-500 group-open:rotate-180 transition-transform">&#9660;</span>
                  </summary>
                  <p className="mt-3 text-charcoal/60 leading-relaxed">{props[`a${n}`]}</p>
                </details>
              ) : null
            )}
          </div>
        </section>
      ),
    },

    // ===== ELEMENTS (atomic, independently movable) =====

    Heading: {
      fields: {
        text: { type: "text" },
        size: sizeField,
        align: alignField,
      },
      defaultProps: { text: "Heading text", size: "md", align: "left" },
      render: ({ text, size, align }) => (
        <div className={`max-w-content mx-auto px-6 lg:px-8 ${align === "center" ? "text-center" : "text-left"}`}>
          <h2 className={`font-display ${HEADING_SIZES[size as string] || HEADING_SIZES.md}`}>{text}</h2>
        </div>
      ),
    },

    Paragraph: {
      fields: {
        text: { type: "textarea" },
        size: sizeField,
        align: alignField,
        width: widthField,
      },
      defaultProps: { text: "Paragraph text goes here.", size: "base", align: "left", width: "max-w-3xl" },
      render: ({ text, size, align, width }) => (
        <div className={`${width} mx-auto px-6 lg:px-8 ${align === "center" ? "text-center" : "text-left"}`}>
          <p className={`text-charcoal/75 leading-relaxed whitespace-pre-line ${TEXT_SIZES[size as string] || TEXT_SIZES.base}`}>
            {text}
          </p>
        </div>
      ),
    },

    ImageBlock: {
      fields: {
        url: imageField("Image"),
        aspect: aspectField,
        width: widthField,
      },
      defaultProps: { url: "/images/Co-Working-02-Copy.jpg", aspect: "landscape", width: "max-w-5xl" },
      render: ({ url, aspect, width }) => (
        <div className={`${width} mx-auto px-6 lg:px-8`}>
          <div className={`relative rounded-2xl overflow-hidden ${ASPECTS[aspect as string] || ASPECTS.landscape}`}>
            <Image src={url} alt="" fill className="object-cover" />
          </div>
        </div>
      ),
    },

    ButtonBlock: {
      fields: {
        label: { type: "text" },
        href: { type: "text" },
        align: alignField,
        style: {
          type: "select",
          options: [
            { label: "Filled (sage)", value: "filled" },
            { label: "Outline", value: "outline" },
          ],
        },
      },
      defaultProps: { label: "Enquire Now", href: "/#enquire", align: "left", style: "filled" },
      render: ({ label, href, align, style }) => (
        <div className={`max-w-content mx-auto px-6 lg:px-8 flex ${align === "center" ? "justify-center" : "justify-start"}`}>
          <Link
            href={href || "#"}
            className={
              style === "outline"
                ? "inline-flex items-center rounded-full border border-charcoal/30 text-charcoal px-7 py-3.5 text-sm font-medium hover:bg-charcoal/5 transition-colors"
                : "inline-flex items-center rounded-full bg-sage-500 text-cream px-7 py-3.5 text-sm font-medium hover:bg-sage-600 transition-colors"
            }
          >
            {label}
          </Link>
        </div>
      ),
    },

    Divider: {
      fields: {
        width: widthField,
      },
      defaultProps: { width: "max-w-content" },
      render: ({ width }) => (
        <div className={`${width} mx-auto px-6 lg:px-8`}>
          <hr className="border-charcoal/10" />
        </div>
      ),
    },

    LogoStrip: {
      fields: {
        logos: {
          type: "array",
          arrayFields: {
            name: { type: "text" },
          },
          getItemSummary: (item) => item.name || "Logo",
        },
      },
      defaultProps: { logos: [] },
      render: ({ logos }) => (
        <div className="max-w-content mx-auto px-6 lg:px-8 py-10">
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
            {(logos || []).map((l: any, i: number) => (
              <span key={i} className="font-display text-lg text-charcoal/30">{l.name}</span>
            ))}
          </div>
        </div>
      ),
    },

    Spacer: {
      fields: {
        height: {
          type: "select",
          options: [
            { label: "Small", value: "h-8" },
            { label: "Medium", value: "h-16" },
            { label: "Large", value: "h-24" },
            { label: "Extra large", value: "h-40" },
          ],
        },
      },
      defaultProps: { height: "h-16" },
      render: ({ height }) => <div className={height} />,
    },

    RotatingHero: {
      fields: {
        eyebrow: { type: "text" },
        heading: { type: "text" },
        subheading: { type: "textarea" },
        images: {
          type: "array",
          arrayFields: { url: imageField("Image") },
          getItemSummary: () => "Photo",
        },
        primaryLabel: { type: "text" },
        primaryHref: { type: "text" },
        secondaryLabel: { type: "text" },
        secondaryHref: { type: "text" },
      },
      defaultProps: {
        eyebrow: "Dubai Hills & Business Bay",
        heading: "Workspaces that elevate your business",
        subheading: "Premium private offices, coworking, and meeting rooms designed for teams who expect more from where they work.",
        images: [
          { url: "/images/Reception-01-rd-1536x1182.jpg" },
          { url: "/images/Co-Working-02-Copy.jpg" },
        ],
        primaryLabel: "Enquire Now",
        primaryHref: "/#enquire",
        secondaryLabel: "Explore Locations",
        secondaryHref: "/locations",
      },
      render: (props: any) => <HeroBlock {...props} />,
    },

    TestimonialsCarousel: {
      fields: {
        eyebrow: { type: "text" },
        heading: { type: "text" },
        quotes: {
          type: "array",
          arrayFields: {
            quote: { type: "textarea" },
            author: { type: "text" },
          },
          getItemSummary: (item: any) => item.author || "Quote",
        },
      },
      defaultProps: {
        eyebrow: "What members say",
        heading: "Trusted by the businesses who work here",
        quotes: [{ quote: "Add a real testimonial quote here.", author: "Name, Role" }],
      },
      render: (props: any) => <TestimonialsBlock {...props} />,
    },

    TrustBar: {
      fields: {
        point1: { type: "text" },
        point2: { type: "text" },
        point3: { type: "text" },
        point4: { type: "text" },
      },
      defaultProps: {
        point1: "1,000+ businesses hosted",
        point2: "2 flagship Dubai locations",
        point3: "50-strong on-site team",
        point4: "24/7 secure access",
      },
      render: (props: any) => (
        <section className="border-y border-charcoal/10 bg-sage-50/50 py-14">
          <div className="max-w-content mx-auto px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-center gap-x-14 gap-y-6">
              {[props.point1, props.point2, props.point3, props.point4].filter(Boolean).map((p: string, i: number) => (
                <span key={i} className="text-sm font-medium text-charcoal/60">{p}</span>
              ))}
            </div>
          </div>
        </section>
      ),
    },

    WhyFlowork: {
      fields: {
        eyebrow: { type: "text" },
        heading: { type: "text" },
        card1Title: { type: "text" },
        card1Body: { type: "textarea" },
        card2Title: { type: "text" },
        card2Body: { type: "textarea" },
        card3Title: { type: "text" },
        card3Body: { type: "textarea" },
      },
      defaultProps: {
        eyebrow: "Why flowork",
        heading: "Built for how modern businesses actually work",
        card1Title: "Flexible by design",
        card1Body: "Scale up or down as your team changes, with contracts that move at the speed of your business.",
        card2Title: "Prime addresses",
        card2Body: "Dubai Hills and Vision Tower Business Bay — locations that make the right impression before you say a word.",
        card3Title: "Everything included",
        card3Body: "High-speed Wi-Fi, IT support, printing, and reception — the essentials handled, so you can focus on the work.",
      },
      render: (props: any) => (
        <section className="max-w-content mx-auto px-6 lg:px-8 py-20">
          <span className="eyebrow">{props.eyebrow}</span>
          <h2 className="font-display text-3xl md:text-4xl mt-2 max-w-xl">{props.heading}</h2>
          <div className="mt-12 grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="border-t-2 border-sage-500 pt-5">
                <h3 className="font-display text-xl">{props[`card${n}Title`]}</h3>
                <p className="mt-2 text-sm text-charcoal/60">{props[`card${n}Body`]}</p>
              </div>
            ))}
          </div>
        </section>
      ),
    },
  },
};