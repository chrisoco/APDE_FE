import { useState, useEffect } from "react";
import type { Route } from "../+types/admin";
import { apiHelpers } from "../../lib/api";
import type { CampaignResponse } from "../../lib/types";
import { DataTable } from "../../components/ui/data-table";
import { campaignColumns } from "../../components/columns/campaign-columns";

export default function Campaign(_: Route.ComponentProps) {
  const [campaigns, setCampaigns] = useState<CampaignResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    fetchCampaigns();
  }, []);

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
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: "1rem" }}>Campaigns</h1>
      
      {campaigns && (
        <>
          <DataTable 
            columns={campaignColumns} 
            data={campaigns.data} 
            searchKey="title"
            searchPlaceholder="Search campaigns..."
          />
        </>
      )}
    </section>
  );
}
