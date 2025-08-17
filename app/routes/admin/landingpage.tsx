import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import type { Route } from "../+types/admin";
import { apiHelpers } from "../../lib/api";
import type { LandingpageResponse } from "../../lib/types";
import { DataTable } from "../../components/ui/data-table";
import { landingpageColumns } from "../../components/columns/landingpage-columns";
import { Button } from "../../components/ui/button";
import { Plus } from "lucide-react";
import { DeleteLandingpageDialog } from "../../components/delete-landingpage-dialog";

export default function Landingpage(_: Route.ComponentProps) {
  const navigate = useNavigate();
  const [landingpages, setLandingpages] = useState<LandingpageResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [landingpageToDelete, setLandingpageToDelete] = useState<{ id: string; title: string } | null>(null);

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

  const handleEdit = (landingpageId: string) => {
    navigate(`/admin/landingpage/${landingpageId}/edit`);
  };

  const handleDelete = (landingpage: any) => {
    setLandingpageToDelete({ id: landingpage.id, title: landingpage.title });
    setDeleteOpen(true);
  };

  const handleCreate = () => {
    navigate('/admin/landingpage/create');
  };

  const handleSuccess = () => {
    fetchLandingpages();
  };

  // Expose handlers to window for column actions
  useEffect(() => {
    (window as any).handleLandingpageEdit = handleEdit;
    (window as any).handleLandingpageDelete = handleDelete;
    
    return () => {
      delete (window as any).handleLandingpageEdit;
      delete (window as any).handleLandingpageDelete;
    };
  }, []);

  useEffect(() => {
    fetchLandingpages();
  }, []);

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
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Landing Pages</h1>
      </div>
      
      {landingpages && (
        <DataTable 
          columns={landingpageColumns} 
          data={landingpages.data} 
          searchKey="title"
          searchPlaceholder="Search landing pages..."
          toolbar={
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Create Landing Page
            </Button>
          }
        />
      )}

      <DeleteLandingpageDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        landingpageId={landingpageToDelete?.id || null}
        landingpageTitle={landingpageToDelete?.title || ''}
        onSuccess={handleSuccess}
      />
    </section>
  );
}
