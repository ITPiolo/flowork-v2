import type { Config } from "@measured/puck";
import Image from "next/image";
import Link from "next/link";

// Defines every block your client can drag onto the canvas in the
// custom page builder (/admin/pages). Add new block types here as
// needed — each one just needs `fields` (the editable inputs shown
// in Puck's side panel) and `render` (how it actually looks on the page).

export const puckConfig: Config = {
  components: {
    Hero: {
      fields: {
        heading: { type: "text" },
        subheading: { type: "textarea" },
        imageUrl: { type: "text", label: "Background image URL" },
        buttonLabel: { type: "text" },
        buttonHref: { type: "text" },
      },
      defaultProps: {
        heading: "Your heading here",
        subheading: "A short supporting line goes here.",
        imageUrl: "/images/Reception-01-rd-1536x1182.jpg",
        buttonLabel: "Enquire Now",
        buttonHref: "/#enquire",
      },
      render: ({ heading, subheading, imageUrl, buttonLabel, buttonHref }) => (
        <section className="relative h-[70vh] min-h-[420px] w-full overflow-hidden">
          <Image src={imageUrl} alt={heading} fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/25 to-charcoal/10" />
          <div className="relative h-full max-w-content mx-auto px-6 lg:px-8 flex flex-col items-start justify-end pb-16">
            <h1 className="font-display text-4xl md:text-6xl text-cream max-w-2xl leading-tight">
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
      ),
    },

    RichText: {
      fields: {
        content: { type: "textarea" },
      },
      defaultProps: { content: "Write your paragraph here." },
      render: ({ content }) => (
        <section className="max-w-3xl mx-auto px-6 lg:px-8 py-12">
          <p className="text-charcoal/75 leading-relaxed whitespace-pre-line">{content}</p>
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
      },
      defaultProps: {
        heading: "Section heading",
        body: "Supporting paragraph text goes here.",
        imageUrl: "/images/Co-Working-02-Copy.jpg",
        imagePosition: "right",
      },
      render: ({ heading, body, imageUrl, imagePosition }) => (
        <section className="max-w-content mx-auto px-6 lg:px-8 py-16 grid md:grid-cols-2 gap-12 items-center">
          <div className={imagePosition === "left" ? "md:order-2" : ""}>
            <h2 className="font-display text-3xl mb-4">{heading}</h2>
            <p className="text-charcoal/70 leading-relaxed">{body}</p>
          </div>
          <div className={`relative aspect-[4/3] rounded-2xl overflow-hidden ${imagePosition === "left" ? "md:order-1" : ""}`}>
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
      },
      defaultProps: { images: [] },
      render: ({ images }) => (
        <section className="max-w-content mx-auto px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {(images || []).map((img: any, i: number) => (
              <div key={i} className="relative aspect-square rounded-xl overflow-hidden">
                <Image src={img.url} alt={img.caption || "Gallery image"} fill className="object-cover" />
              </div>
            ))}
          </div>
        </section>
      ),
    },

    Testimonial: {
      fields: {
        quote: { type: "textarea" },
        author: { type: "text" },
      },
      defaultProps: {
        quote: "This is a testimonial quote.",
        author: "Name, Role",
      },
      render: ({ quote, author }) => (
        <section className="bg-charcoal text-cream py-20">
          <div className="max-w-2xl mx-auto px-6 text-center">
            <p className="font-display text-2xl leading-relaxed">&ldquo;{quote}&rdquo;</p>
            <p className="mt-6 text-sm text-cream/60">{author}</p>
          </div>
        </section>
      ),
    },

    CTA: {
      fields: {
        heading: { type: "text" },
        buttonLabel: { type: "text" },
        buttonHref: { type: "text" },
      },
      defaultProps: {
        heading: "Ready to get started?",
        buttonLabel: "Enquire Now",
        buttonHref: "/#enquire",
      },
      render: ({ heading, buttonLabel, buttonHref }) => (
        <section className="bg-sage-500 py-16 text-center">
          <h2 className="font-display text-3xl text-cream mb-6">{heading}</h2>
          <Link
            href={buttonHref || "#"}
            className="inline-flex items-center rounded-full bg-cream text-charcoal px-7 py-3.5 text-sm font-medium hover:bg-cream/90 transition-colors"
          >
            {buttonLabel}
          </Link>
        </section>
      ),
    },
  },
};