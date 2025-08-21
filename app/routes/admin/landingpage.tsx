import type { Landingpage } from "~/lib/types";
import { landingpageColumns } from "~/components/columns/landingpage-columns";
import { AdminListLayout } from "~/components/ui/admin-list-layout";
import { useAdminList } from "~/hooks/useAdminList";

export default function Landingpage() {
  const {
    data: landingpages,
    loading,
    error,
    deleteOpen,
    setDeleteOpen,
    itemToDelete,
    handleEdit,
    handleDelete,
    handleCreate,
    handleDeleteSuccess
  } = useAdminList<Landingpage>({
    endpoint: '/api/landingpages',
    basePath: '/admin/landingpage'
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