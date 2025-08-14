import { useState, useEffect } from "react";
import type { Route } from "../+types/admin";
import { apiHelpers } from "../../lib/api";
import type { CampaignResponse } from "../../lib/types";

export default function Campaign(_: Route.ComponentProps) {
  const [campaigns, setCampaigns] = useState<CampaignResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchCampaigns(currentPage);
  }, [currentPage]);

  const fetchCampaigns = async (page: number) => {
    try {
      setLoading(true);
      const data = await apiHelpers.paginated<CampaignResponse>(
        "/api/campaigns",
        { page, per_page: 7 },
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

  const truncateDescription = (desc: string, maxLength: number = 100) => {
    return desc.length > maxLength ? `${desc.substring(0, maxLength)}...` : desc;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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
                    Title
                  </th>
                  <th style={{ 
                    padding: "12px 16px", 
                    textAlign: "left", 
                    fontWeight: 600, 
                    color: "#374151",
                    borderBottom: "1px solid #e5e7eb"
                  }}>
                    Description
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
                    Start Date
                  </th>
                  <th style={{ 
                    padding: "12px 16px", 
                    textAlign: "left", 
                    fontWeight: 600, 
                    color: "#374151",
                    borderBottom: "1px solid #e5e7eb"
                  }}>
                    End Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {campaigns.data.map((campaign) => (
                  <tr key={campaign.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ 
                      padding: "12px 16px", 
                      color: "#111827",
                      fontWeight: 500
                    }}>
                      {campaign.title}
                    </td>
                    <td style={{ 
                      padding: "12px 16px", 
                      color: "#6b7280",
                      maxWidth: "300px"
                    }}>
                      {truncateDescription(campaign.description)}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        fontWeight: 500,
                        backgroundColor: campaign.status === 'Active' ? '#dcfce7' : '#f3f4f6',
                        color: campaign.status === 'Active' ? '#166534' : '#374151'
                      }}>
                        {campaign.status}
                      </span>
                    </td>
                    <td style={{ 
                      padding: "12px 16px", 
                      color: "#6b7280",
                      fontSize: "14px"
                    }}>
                      {formatDate(campaign.start_date)}
                    </td>
                    <td style={{ 
                      padding: "12px 16px", 
                      color: "#6b7280",
                      fontSize: "14px"
                    }}>
                      {formatDate(campaign.end_date)}
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
              Showing {((campaigns.meta.current_page - 1) * campaigns.meta.per_page) + 1} to {Math.min(campaigns.meta.current_page * campaigns.meta.per_page, campaigns.meta.total)} of {campaigns.meta.total} results
            </div>
            
            <div style={{ display: "flex", gap: "4px" }}>
              <button
                onClick={() => handlePageChange(campaigns.meta.current_page - 1)}
                disabled={campaigns.meta.current_page === 1}
                style={{
                  padding: "8px 12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  backgroundColor: campaigns.meta.current_page === 1 ? "#f9fafb" : "#ffffff",
                  color: campaigns.meta.current_page === 1 ? "#9ca3af" : "#374151",
                  cursor: campaigns.meta.current_page === 1 ? "not-allowed" : "pointer",
                  fontSize: "14px"
                }}
              >
                Previous
              </button>
              
              {Array.from({ length: campaigns.meta.last_page }, (_, i) => i + 1)
                .filter(page => 
                  page === 1 || 
                  page === campaigns.meta.last_page || 
                  Math.abs(page - campaigns.meta.current_page) <= 2
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
                        backgroundColor: campaigns.meta.current_page === page ? "#3b82f6" : "#ffffff",
                        color: campaigns.meta.current_page === page ? "#ffffff" : "#374151",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: campaigns.meta.current_page === page ? 600 : 400
                      }}
                    >
                      {page}
                    </button>
                  </div>
                ))}
              
              <button
                onClick={() => handlePageChange(campaigns.meta.current_page + 1)}
                disabled={campaigns.meta.current_page === campaigns.meta.last_page}
                style={{
                  padding: "8px 12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  backgroundColor: campaigns.meta.current_page === campaigns.meta.last_page ? "#f9fafb" : "#ffffff",
                  color: campaigns.meta.current_page === campaigns.meta.last_page ? "#9ca3af" : "#374151",
                  cursor: campaigns.meta.current_page === campaigns.meta.last_page ? "not-allowed" : "pointer",
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
