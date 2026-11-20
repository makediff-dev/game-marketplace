import { ListingEditScreen } from "@/components/listing-edit-screen";

// Personal page: no shared caching.
export const dynamic = "force-dynamic";

export default async function ListingEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ListingEditScreen listingId={id} />;
}
