import { useState, useEffect } from "react";
import type { Route } from "../+types/admin";
import { apiHelpers } from "../../lib/api";
import type { LandingpageResponse } from "../../lib/types";
import { DataTable } from "../../components/ui/data-table";
import { landingpageColumns } from "../../components/columns/landingpage-columns";

export default function Landingpage(_: Route.ComponentProps) {
  const [landingpages, setLandingpages] = useState<LandingpageResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    fetchLandingpages();
  }, []);

  const fetchLandingpages = async () => {
    try {
      setLoading(true);
      const data = await apiHelpers.paginated<LandingpageResponse>(
        "/api/landingpages",
        { page: 1, per_page: 100 },
        { requiresAuth: true }
      );
      setLandingpages(data);
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
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: "1rem" }}>Landing Pages</h1>
        <div style={{ padding: "2rem", textAlign: "center" }}>Loading landing pages...</div>
      </section>
    );
  }

  if (error) {
    return (
      <section>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: "1rem" }}>Landing Pages</h1>
        <div style={{ padding: "2rem", color: "#dc2626" }}>Error: {error}</div>
      </section>
    );
  }

  return (
    <section>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: "1rem" }}>Landing Pages</h1>
      
      {landingpages && (
        <>
          <DataTable 
            columns={landingpageColumns} 
            data={landingpages.data} 
            searchKey="title"
            searchPlaceholder="Search landing pages..."
          />
        </>
      )}
    </section>
  );
}
