import { useState, useEffect } from "react";
import type { Route } from "../+types/admin";
import { apiHelpers } from "../../lib/api";
import type { ProspectResponse } from "../../lib/types";

export default function Prospects(_: Route.ComponentProps) {
  const [prospects, setProspects] = useState<ProspectResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchProspects(currentPage);
  }, [currentPage]);

  const fetchProspects = async (page: number) => {
    try {
      setLoading(true);
      const data = await apiHelpers.paginated<ProspectResponse>(
        "/api/prospects",
        { page, per_page: 10 },
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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
                    Avatar
                  </th>
                  <th style={{ 
                    padding: "12px 16px", 
                    textAlign: "left", 
                    fontWeight: 600, 
                    color: "#374151",
                    borderBottom: "1px solid #e5e7eb"
                  }}>
                    Gender
                  </th>
                  <th style={{ 
                    padding: "12px 16px", 
                    textAlign: "left", 
                    fontWeight: 600, 
                    color: "#374151",
                    borderBottom: "1px solid #e5e7eb"
                  }}>
                    Age
                  </th>
                  <th style={{ 
                    padding: "12px 16px", 
                    textAlign: "left", 
                    fontWeight: 600, 
                    color: "#374151",
                    borderBottom: "1px solid #e5e7eb"
                  }}>
                    Birth Date
                  </th>
                  <th style={{ 
                    padding: "12px 16px", 
                    textAlign: "left", 
                    fontWeight: 600, 
                    color: "#374151",
                    borderBottom: "1px solid #e5e7eb"
                  }}>
                    Location
                  </th>
                  <th style={{ 
                    padding: "12px 16px", 
                    textAlign: "left", 
                    fontWeight: 600, 
                    color: "#374151",
                    borderBottom: "1px solid #e5e7eb"
                  }}>
                    Physical
                  </th>
                </tr>
              </thead>
              <tbody>
                {prospects.data.map((prospect) => (
                  <tr key={prospect.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ 
                      padding: "12px 16px"
                    }}>
                      <img 
                        src={prospect.image} 
                        alt="Avatar"
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          objectFit: "cover"
                        }}
                      />
                    </td>
                    <td style={{ 
                      padding: "12px 16px", 
                      color: "#111827",
                      fontWeight: 500
                    }}>
                      <span style={{
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        fontWeight: 500,
                        backgroundColor: prospect.gender === 'male' ? '#dbeafe' : '#fce7f3',
                        color: prospect.gender === 'male' ? '#1d4ed8' : '#be185d'
                      }}>
                        {prospect.gender.charAt(0).toUpperCase() + prospect.gender.slice(1)}
                      </span>
                    </td>
                    <td style={{ 
                      padding: "12px 16px", 
                      color: "#6b7280"
                    }}>
                      {prospect.age}
                    </td>
                    <td style={{ 
                      padding: "12px 16px", 
                      color: "#6b7280",
                      fontSize: "14px"
                    }}>
                      {formatDate(prospect.birthDate)}
                    </td>
                    <td style={{ 
                      padding: "12px 16px", 
                      color: "#6b7280",
                      fontSize: "14px"
                    }}>
                      {prospect.address.city}, {prospect.address.state}
                    </td>
                    <td style={{ 
                      padding: "12px 16px", 
                      color: "#6b7280",
                      fontSize: "14px"
                    }}>
                      {Math.round(prospect.height)}cm / {Math.round(prospect.weight)}kg
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
              Showing {((prospects.meta.current_page - 1) * prospects.meta.per_page) + 1} to {Math.min(prospects.meta.current_page * prospects.meta.per_page, prospects.meta.total)} of {prospects.meta.total} results
            </div>
            
            <div style={{ display: "flex", gap: "4px" }}>
              <button
                onClick={() => handlePageChange(prospects.meta.current_page - 1)}
                disabled={prospects.meta.current_page === 1}
                style={{
                  padding: "8px 12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  backgroundColor: prospects.meta.current_page === 1 ? "#f9fafb" : "#ffffff",
                  color: prospects.meta.current_page === 1 ? "#9ca3af" : "#374151",
                  cursor: prospects.meta.current_page === 1 ? "not-allowed" : "pointer",
                  fontSize: "14px"
                }}
              >
                Previous
              </button>
              
              {Array.from({ length: prospects.meta.last_page }, (_, i) => i + 1)
                .filter(page => 
                  page === 1 || 
                  page === prospects.meta.last_page || 
                  Math.abs(page - prospects.meta.current_page) <= 2
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
                        backgroundColor: prospects.meta.current_page === page ? "#3b82f6" : "#ffffff",
                        color: prospects.meta.current_page === page ? "#ffffff" : "#374151",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: prospects.meta.current_page === page ? 600 : 400
                      }}
                    >
                      {page}
                    </button>
                  </div>
                ))}
              
              <button
                onClick={() => handlePageChange(prospects.meta.current_page + 1)}
                disabled={prospects.meta.current_page === prospects.meta.last_page}
                style={{
                  padding: "8px 12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  backgroundColor: prospects.meta.current_page === prospects.meta.last_page ? "#f9fafb" : "#ffffff",
                  color: prospects.meta.current_page === prospects.meta.last_page ? "#9ca3af" : "#374151",
                  cursor: prospects.meta.current_page === prospects.meta.last_page ? "not-allowed" : "pointer",
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
