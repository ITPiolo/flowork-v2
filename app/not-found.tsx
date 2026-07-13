import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center">
      <span className="eyebrow mb-4">404</span>
      <h1 className="font-display text-4xl md:text-5xl mb-4">
        This space doesn&rsquo;t exist
      </h1>
      <p className="text-charcoal/60 max-w-md mb-8">
        The page you're looking for may have moved, or never existed.
        Let's get you back to a real workspace.
      </p>
      <Link
        href="/"
        className="inline-flex items-center rounded-full bg-sage-500 text-cream px-6 py-3 text-sm font-medium hover:bg-sage-600 transition-colors"
      >
        Back to home
      </Link>
    </div>
  );
}