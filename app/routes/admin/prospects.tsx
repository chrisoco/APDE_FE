import type { ProspectResponse } from "~/lib/types";
import { prospectColumns } from "~/components/columns/prospect-columns";
import { AdminViewLayout } from "~/components/ui/admin-view-layout";
import { useAdminList } from "~/hooks/useAdminList";

export default function Prospects() {
  const {
    data: prospects,
    loading,
    error
  } = useAdminList<ProspectResponse>({
    endpoint: '/api/prospects',
    basePath: '/admin/prospects' // Not used for view-only
  });

  return (
    <AdminViewLayout
      title="Prospects"
      data={prospects}
      columns={prospectColumns}
      loading={loading}
      error={error}
    />
  );
}