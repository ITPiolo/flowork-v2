export default function Loading() {
  return (
    <div className="max-w-content mx-auto px-6 lg:px-8 py-24 animate-pulse">
      <div className="h-4 w-32 bg-charcoal/10 rounded mb-4" />
      <div className="h-12 w-2/3 bg-charcoal/10 rounded mb-10" />
      <div className="grid md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="aspect-[4/5] bg-charcoal/10 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}