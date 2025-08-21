import { useLoaderData } from "react-router";
import type { Prospect, PaginatedResponse } from "~/lib/types";
import { prospectColumns } from "~/components/columns/prospect-columns";
import { AdminViewLayout } from "~/components/ui/admin-view-layout";
import { apiHelpers } from "~/lib/api";
import { withCache, CACHE_TAGS } from "~/lib/cache-manager";

export async function clientLoader(): Promise<PaginatedResponse<Prospect>> {
  return withCache(
    () => apiHelpers.paginated<PaginatedResponse<Prospect>>(
      '/api/prospects',
      { page: 1, per_page: 50 },
      { requiresAuth: true }
    ),
    CACHE_TAGS.PROSPECTS,
    { ttl: 2 * 60 * 1000, tags: [CACHE_TAGS.PROSPECTS] } // 2 minutes TTL
  );
}

export default function Prospects() {
  const prospects = useLoaderData<typeof clientLoader>();

  return (
    <AdminViewLayout
      title="Prospects"
      data={prospects}
      columns={prospectColumns}
      loading={false}
      error={null}
    />
  );
}