import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import type { Route } from "../+types/admin";
import { apiHelpers } from "../../lib/api";
import type { CampaignResponse } from "../../lib/types";
import { DataTable } from "../../components/ui/data-table";
import { campaignColumns } from "../../components/columns/campaign-columns";
import { Button } from "../../components/ui/button";
import { Plus } from "lucide-react";
import { DeleteCampaignDialog } from "../../components/delete-campaign-dialog";

export default function Campaign(_: Route.ComponentProps) {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<CampaignResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState<{ id: string; title: string } | null>(null);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const data = await apiHelpers.paginated<CampaignResponse>(
        "/api/campaigns",
        { page: 1, per_page: 100 },
        { requiresAuth: true }
      );
      setCampaigns(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (campaignId: string) => {
    navigate(`/admin/campaign/${campaignId}/edit`);
  };

  const handleDelete = (campaign: any) => {
    setCampaignToDelete({ id: campaign.id, title: campaign.title });
    setDeleteOpen(true);
  };

  const handleCreate = () => {
    navigate('/admin/campaign/create');
  };

  const handleSuccess = () => {
    fetchCampaigns();
  };

  // Expose handlers to window for column actions
  useEffect(() => {
    (window as any).handleCampaignEdit = handleEdit;
    (window as any).handleCampaignDelete = handleDelete;
    
    return () => {
      delete (window as any).handleCampaignEdit;
      delete (window as any).handleCampaignDelete;
    };
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  if (loading) {
    return (
      <section>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: "1rem" }}>Campaigns</h1>
        <div style={{ padding: "2rem", textAlign: "center" }}>Loading campaigns...</div>
      </section>
    );
  }

  if (error) {
    return (
      <section>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: "1rem" }}>Campaigns</h1>
        <div style={{ padding: "2rem", color: "#dc2626" }}>Error: {error}</div>
      </section>
    );
  }

  return (
    <section>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Campaigns</h1>
      </div>
      
      {campaigns && (
        <DataTable 
          columns={campaignColumns} 
          data={campaigns.data} 
          searchKey="title"
          searchPlaceholder="Search campaigns..."
          toolbar={
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Create Campaign
            </Button>
          }
        />
      )}

      <DeleteCampaignDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        campaignId={campaignToDelete?.id || null}
        campaignTitle={campaignToDelete?.title || ''}
        onSuccess={handleSuccess}
      />
    </section>
  );
}
