export default function PageLoader() {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 backdrop-blur-sm">
      <div className="flex items-center gap-2 rounded-full border border-border bg-card/90 px-6 py-4 shadow-sm">
        <span className="size-3 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
        <span className="size-3 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
        <span className="size-3 rounded-full bg-primary animate-bounce" />
      </div>
    </div>
  );
}
