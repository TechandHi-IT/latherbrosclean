function Block({ className }: { className: string }) {
  return <div className={`skeleton rounded-[14px] ${className}`} />;
}

export function FormSkeleton() {
  return (
    <div
      className="mx-auto flex w-full max-w-[520px] flex-1 flex-col px-5 py-6 sm:py-10"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Loading the cleaning request form</span>
      <Block className="h-1.5 w-full rounded-full" />
      <Block className="mt-8 h-3 w-28" />
      <Block className="mt-5 h-10 w-4/5" />
      <Block className="mt-3 h-4 w-full" />
      <div className="mt-10 overflow-hidden rounded-[22px] bg-paper ring-1 ring-black/5">
        <Block className="mx-5 my-4 h-12 rounded-[12px]" />
        <Block className="mx-5 my-4 h-12 rounded-[12px]" />
        <Block className="mx-5 my-4 h-12 rounded-[12px]" />
        <Block className="mx-5 my-4 h-12 rounded-[12px]" />
      </div>
      <div className="mt-auto pt-10">
        <Block className="h-[52px] w-full rounded-full" />
      </div>
    </div>
  );
}
