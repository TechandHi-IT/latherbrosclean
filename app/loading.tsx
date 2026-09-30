import { FormSkeleton } from "@/components/form-skeleton";

export default function Loading() {
  return (
    <main className="flex min-h-svh flex-col">
      <FormSkeleton />
    </main>
  );
}
