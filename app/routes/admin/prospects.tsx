import { useState, useEffect } from "react";
import type { Route } from "../+types/admin";
import { apiHelpers } from "../../lib/api";
import type { ProspectResponse } from "../../lib/types";
import { DataTable } from "../../components/ui/data-table";
import { prospectColumns } from "../../components/columns/prospect-columns";

export default function Prospects(_: Route.ComponentProps) {
  const [prospects, setProspects] = useState<ProspectResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    fetchProspects();
  }, []);

  const fetchProspects = async () => {
    try {
      setLoading(true);
      const data = await apiHelpers.paginated<ProspectResponse>(
        "/api/prospects",
        { page: 1, per_page: 1000 },
        { requiresAuth: true }
      );
      setProspects(data);
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
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: "1rem" }}>Prospects</h1>
        <div style={{ padding: "2rem", textAlign: "center" }}>Loading prospects...</div>
      </section>
    );
  }

  if (error) {
    return (
      <section>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: "1rem" }}>Prospects</h1>
        <div style={{ padding: "2rem", color: "#dc2626" }}>Error: {error}</div>
      </section>
    );
  }

  return (
    <section>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: "1rem" }}>Prospects</h1>
      
      {prospects && (
        <>
          <DataTable 
            columns={prospectColumns} 
            data={prospects.data} 
            searchKey="gender"
            searchPlaceholder="Search prospects..."
          />
        </>
      )}
    </section>
  );
}
