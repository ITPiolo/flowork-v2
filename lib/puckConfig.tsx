import type { Config } from "@measured/puck";
import Image from "next/image";
import Link from "next/link";

// Defines every block your client can drag onto the canvas in the
// custom page builder (/admin/pages). Each block includes styling
// controls (alignment, size, color) so non-technical editors get
// real flexibility without needing custom CSS.

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

export const puckConfig: Config = {
  components: {
    Hero: {
      fields: {
        heading: { type: "text" },
        subheading: { type: "textarea" },
        imageUrl: { type: "text", label: "Background image URL" },
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

    RichText: {
      fields: {
        content: { type: "textarea" },
        align: alignField,
        fontSize: sizeField,
        maxWidth: {
          type: "select",
          options: [
            { label: "Narrow", value: "max-w-xl" },
            { label: "Medium", value: "max-w-3xl" },
            { label: "Wide", value: "max-w-5xl" },
          ],
        },
      },
      defaultProps: {
        content: "Write your paragraph here.",
        align: "left",
        fontSize: "base",
        maxWidth: "max-w-3xl",
      },
      render: ({ content, align, fontSize, maxWidth }) => (
        <section className={`${maxWidth} mx-auto px-6 lg:px-8 py-12 ${align === "center" ? "text-center" : ""}`}>
          <p className={`text-charcoal/75 leading-relaxed whitespace-pre-line ${TEXT_SIZES[fontSize as string] || TEXT_SIZES.base}`}>
            {content}
          </p>
        </section>
      ),
    },

    TextImage: {
      fields: {
        heading: { type: "text" },
        body: { type: "textarea" },
        imageUrl: { type: "text", label: "Image URL" },
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
      render: ({ heading, body, imageUrl, imagePosition, imageAspect, headingSize }) => (
        <section className="max-w-content mx-auto px-6 lg:px-8 py-16 grid md:grid-cols-2 gap-12 items-center">
          <div className={imagePosition === "left" ? "md:order-2" : ""}>
            <h2 className={`font-display mb-4 ${HEADING_SIZES[headingSize as string] || HEADING_SIZES.md}`}>{heading}</h2>
            <p className="text-charcoal/70 leading-relaxed">{body}</p>
          </div>
          <div className={`relative rounded-2xl overflow-hidden ${ASPECTS[imageAspect as string] || ASPECTS.landscape} ${imagePosition === "left" ? "md:order-1" : ""}`}>
            <Image src={imageUrl} alt={heading} fill className="object-cover" />
          </div>
        </section>
      ),
    },

    Gallery: {
      fields: {
        images: {
          type: "array",
          arrayFields: {
            url: { type: "text", label: "Image URL" },
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
  },
};