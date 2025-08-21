import type { CampaignResponse } from "~/lib/types";
import { campaignColumns } from "~/components/columns/campaign-columns";
import { AdminListLayout } from "~/components/ui/admin-list-layout";
import { useAdminList } from "~/hooks/useAdminList";

export default function Campaign() {
  const {
    data: campaigns,
    loading,
    error,
    deleteOpen,
    setDeleteOpen,
    itemToDelete,
    handleEdit,
    handleDelete,
    handleCreate,
    handleDeleteSuccess
  } = useAdminList<CampaignResponse>({
    endpoint: '/api/campaigns',
    basePath: '/admin/campaign'
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
      loading={loading}
      error={error}
      deleteOpen={deleteOpen}
      setDeleteOpen={setDeleteOpen}
      itemToDelete={itemToDelete}
      onCreate={handleCreate}
      onDeleteSuccess={handleDeleteSuccess}
    />
  );
}