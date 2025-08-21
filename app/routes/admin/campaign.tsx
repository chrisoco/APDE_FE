import { useLoaderData, isRouteErrorResponse } from "react-router";
import type { Route } from "./+types/campaign";
import type { Campaign, PaginatedResponse } from "~/lib/types";
import { campaignColumns } from "~/components/columns/campaign-columns";
import { AdminListLayout } from "~/components/ui/admin-list-layout";
import { useAdminActions } from "~/hooks/useAdminActions";
import { apiHelpers } from "~/lib/api";
import { withCache, CACHE_TAGS } from "~/lib/cache-manager";

export async function clientLoader(): Promise<PaginatedResponse<Campaign>> {
  return withCache(
    () => apiHelpers.paginated<PaginatedResponse<Campaign>>(
      '/api/campaigns',
      { page: 1, per_page: 50 },
      { requiresAuth: true }
    ),
    CACHE_TAGS.CAMPAIGNS,
    { ttl: 2 * 60 * 1000, tags: [CACHE_TAGS.CAMPAIGNS] } // 2 minutes TTL
  );
}

export default function Campaign() {
  const campaigns = useLoaderData<typeof clientLoader>();
  
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
    endpoint: '/api/campaigns',
    basePath: '/admin/campaign',
    cacheKey: CACHE_TAGS.CAMPAIGNS
  });

  // Create columns with proper handler injection
  const columns = campaignColumns(handleEdit, handleDelete);

  return (
    <AdminListLayout
      title="Campaigns"
      createButtonText="Create Campaign"
      entityType="Campaign"
      endpoint="/api/campaigns"
      data={campaigns}
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

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Something went wrong loading campaigns.";
  let details = "Unable to load the campaigns list.";

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "Campaigns not found" : "Error loading campaigns";
    details = error.status === 404 
      ? "The campaigns resource could not be found." 
      : error.statusText || details;
  } else if (error && error instanceof Error) {
    details = error.message;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600">{message}</h2>
          <p className="text-muted-foreground mt-2">{details}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Retry
        </button>
      </div>
    </div>
  );
}