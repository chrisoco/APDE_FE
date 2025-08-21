import { useLoaderData } from "react-router";
import type { Landingpage, PaginatedResponse } from "~/lib/types";
import { landingpageColumns } from "~/components/columns/landingpage-columns";
import { AdminListLayout } from "~/components/ui/admin-list-layout";
import { useAdminActions } from "~/hooks/useAdminActions";
import { apiHelpers } from "~/lib/api";
import { withCache, CACHE_TAGS } from "~/lib/cache-manager";

export async function clientLoader(): Promise<PaginatedResponse<Landingpage>> {
  return withCache(
    () => apiHelpers.paginated<PaginatedResponse<Landingpage>>(
      '/api/landingpages',
      { page: 1, per_page: 50 },
      { requiresAuth: true }
    ),
    CACHE_TAGS.LANDINGPAGES,
    { ttl: 2 * 60 * 1000, tags: [CACHE_TAGS.LANDINGPAGES] } // 2 minutes TTL
  );
}

export default function Landingpage() {
  const landingpages = useLoaderData<typeof clientLoader>();
  
  const {
    deleteOpen,
    setDeleteOpen,
    itemToDelete,
    isDeleting,
    handleEdit,
    handleDelete,
    handleCreate,
    handleDeleteConfirm
  } = useAdminActions({
    endpoint: '/api/landingpages',
    basePath: '/admin/landingpage',
    cacheKey: CACHE_TAGS.LANDINGPAGES
  });

  // Create columns with proper handler injection
  const columns = landingpageColumns(handleEdit, handleDelete);

  return (
    <AdminListLayout
      title="Landing Pages"
      createButtonText="Create Landing Page"
      entityType="Landing Page"
      endpoint="/api/landingpages"
      data={landingpages}
      columns={columns}
      loading={false}
      error={null}
      deleteOpen={deleteOpen}
      setDeleteOpen={setDeleteOpen}
      itemToDelete={itemToDelete}
      isDeleting={isDeleting}
      onCreate={handleCreate}
      onDeleteConfirm={handleDeleteConfirm}
    />
  );
}