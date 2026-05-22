import { ResourceCard } from "@/components/ResourceCard";
import type { ResourceCard as ResourceCardData } from "@/lib/queries";

export function ResourceGrid({
  resources,
}: {
  resources: ResourceCardData[];
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {resources.map((r) => (
        <ResourceCard key={r.id} resource={r} />
      ))}
    </div>
  );
}
