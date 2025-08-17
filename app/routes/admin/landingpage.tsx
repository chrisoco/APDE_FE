import { useState, useEffect } from "react";
import type { Route } from "../+types/admin";
import { apiHelpers } from "../../lib/api";
import type { LandingpageResponse } from "../../lib/types";

export default function Landingpage(_: Route.ComponentProps) {
  const [landingpages, setLandingpages] = useState<LandingpageResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchLandingpages(currentPage);
  }, [currentPage]);

  const fetchLandingpages = async (page: number) => {
    try {
      setLoading(true);
      const data = await apiHelpers.paginated<LandingpageResponse>(
        "/api/landingpages",
        { page, per_page: 7 },
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

  const truncateText = (text: string, maxLength: number = 50) => {
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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
          <div style={{ 
            backgroundColor: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            overflow: "hidden"
          }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ backgroundColor: "#f9fafb" }}>
                <tr>
                  <th style={{ 
                    padding: "12px 16px", 
                    textAlign: "left", 
                    fontWeight: 600, 
                    color: "#374151",
                    borderBottom: "1px solid #e5e7eb"
                  }}>
                    Campaign
                  </th>
                  <th style={{ 
                    padding: "12px 16px", 
                    textAlign: "left", 
                    fontWeight: 600, 
                    color: "#374151",
                    borderBottom: "1px solid #e5e7eb"
                  }}>
                    Status
                  </th>
                  <th style={{ 
                    padding: "12px 16px", 
                    textAlign: "left", 
                    fontWeight: 600, 
                    color: "#374151",
                    borderBottom: "1px solid #e5e7eb"
                  }}>
                    Title
                  </th>
                  <th style={{ 
                    padding: "12px 16px", 
                    textAlign: "left", 
                    fontWeight: 600, 
                    color: "#374151",
                    borderBottom: "1px solid #e5e7eb"
                  }}>
                    Slug
                  </th>
                  <th style={{ 
                    padding: "12px 16px", 
                    textAlign: "left", 
                    fontWeight: 600, 
                    color: "#374151",
                    borderBottom: "1px solid #e5e7eb"
                  }}>
                    Headline
                  </th>
                </tr>
              </thead>
              <tbody>
                {landingpages.data.map((landingpage) => (
                  <tr key={landingpage.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ 
                      padding: "12px 16px", 
                      color: "#111827",
                      fontWeight: 500
                    }}>
                      {truncateText(landingpage.campaign.title, 30)}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        fontWeight: 500,
                        backgroundColor: landingpage.campaign.status === 'Active' ? '#dcfce7' : '#f3f4f6',
                        color: landingpage.campaign.status === 'Active' ? '#166534' : '#374151'
                      }}>
                        {landingpage.campaign.status}
                      </span>
                    </td>
                    <td style={{ 
                      padding: "12px 16px", 
                      color: "#111827",
                      fontWeight: 500
                    }}>
                      {truncateText(landingpage.title, 25)}
                    </td>
                    <td style={{ 
                      padding: "12px 16px", 
                      color: "#6b7280",
                      fontSize: "14px",
                      fontFamily: "monospace"
                    }}>
                      {landingpage.slug}
                    </td>
                    <td style={{ 
                      padding: "12px 16px", 
                      color: "#6b7280",
                      maxWidth: "200px"
                    }}>
                      {truncateText(landingpage.headline, 40)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div style={{ 
            marginTop: "1rem", 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center" 
          }}>
            <div style={{ fontSize: "14px", color: "#6b7280" }}>
              Showing {((landingpages.meta.current_page - 1) * landingpages.meta.per_page) + 1} to {Math.min(landingpages.meta.current_page * landingpages.meta.per_page, landingpages.meta.total)} of {landingpages.meta.total} results
            </div>
            
            <div style={{ display: "flex", gap: "4px" }}>
              <button
                onClick={() => handlePageChange(landingpages.meta.current_page - 1)}
                disabled={landingpages.meta.current_page === 1}
                style={{
                  padding: "8px 12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  backgroundColor: landingpages.meta.current_page === 1 ? "#f9fafb" : "#ffffff",
                  color: landingpages.meta.current_page === 1 ? "#9ca3af" : "#374151",
                  cursor: landingpages.meta.current_page === 1 ? "not-allowed" : "pointer",
                  fontSize: "14px"
                }}
              >
                Previous
              </button>
              
              {Array.from({ length: landingpages.meta.last_page }, (_, i) => i + 1)
                .filter(page => 
                  page === 1 || 
                  page === landingpages.meta.last_page || 
                  Math.abs(page - landingpages.meta.current_page) <= 2
                )
                .map((page, index, array) => (
                  <div key={page} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    {index > 0 && array[index - 1] !== page - 1 && (
                      <span style={{ color: "#9ca3af", padding: "0 4px" }}>...</span>
                    )}
                    <button
                      onClick={() => handlePageChange(page)}
                      style={{
                        padding: "8px 12px",
                        border: "1px solid #d1d5db",
                        borderRadius: "6px",
                        backgroundColor: landingpages.meta.current_page === page ? "#3b82f6" : "#ffffff",
                        color: landingpages.meta.current_page === page ? "#ffffff" : "#374151",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: landingpages.meta.current_page === page ? 600 : 400
                      }}
                    >
                      {page}
                    </button>
                  </div>
                ))}
              
              <button
                onClick={() => handlePageChange(landingpages.meta.current_page + 1)}
                disabled={landingpages.meta.current_page === landingpages.meta.last_page}
                style={{
                  padding: "8px 12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  backgroundColor: landingpages.meta.current_page === landingpages.meta.last_page ? "#f9fafb" : "#ffffff",
                  color: landingpages.meta.current_page === landingpages.meta.last_page ? "#9ca3af" : "#374151",
                  cursor: landingpages.meta.current_page === landingpages.meta.last_page ? "not-allowed" : "pointer",
                  fontSize: "14px"
                }}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
