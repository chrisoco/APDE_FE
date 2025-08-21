import { useState, useEffect } from "react";
import type { Campaign } from "~/lib/types";
import { apiHelpers } from "~/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Combobox } from "~/components/ui/combobox";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface CampaignOverview {
  campaign_id: string;
  campaign_title: string;
  status: string;
  start_date: string;
  end_date: string;
}

interface Visits {
  total: number;
  unique_ip: number;
  total_unique: number;
}

interface Statistics {
  total_prospects_notified: number;
  unique_prospect_visits: number;
  email_cta_click_rate: number;
}

interface DeviceBrowserBreakdown {
  device_types: Record<string, number>;
  browsers: Record<string, number>;
  operating_systems: Record<string, number>;
  languages: Record<string, number>;
}

interface UtmSources {
  source: Record<string, number>;
  medium: Record<string, number>;
}

interface CampaignAnalytics {
  campaign_overview: CampaignOverview;
  visits: Visits;
  statistics: Statistics;
  device_browser_breakdown: DeviceBrowserBreakdown;
  utm_sources: UtmSources;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

export default function AdminIndex() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("");
  const [analytics, setAnalytics] = useState<CampaignAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const [campaignsLoaded, setCampaignsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load campaigns on component mount
  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    if (campaignsLoaded) return;
    
    setLoadingCampaigns(true);
    try {
      const response = await apiHelpers.get('/api/campaigns');
      setCampaigns(response.data || []);
      setCampaignsLoaded(true);
    } catch {
      setError('Failed to load campaigns');
    } finally {
      setLoadingCampaigns(false);
    }
  };

  const loadAnalytics = async (campaignId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiHelpers.get<CampaignAnalytics>(
        `/api/campaigns/${campaignId}/analytics`,
        { requiresAuth: true }
      );
      setAnalytics(response);
    } catch {
      setError('Failed to load analytics data');
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  };

  const formatDataForChart = (data: Record<string, number>) => {
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  };

  const formatDataForBarChart = (data: Record<string, number>) => {
    return Object.entries(data).map(([name, count]) => ({ name, count }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
        <p className="text-muted-foreground">View comprehensive campaign analytics and insights</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Campaign Analytics</CardTitle>
          <CardDescription>
            Select a campaign to view detailed analytics and performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="campaign-select">Select Campaign</Label>
            <Combobox
              options={[
                { value: "", label: "Select a campaign" },
                ...campaigns.map((campaign) => ({
                  value: campaign.id,
                  label: `${campaign.title} (${campaign.status})`,
                }))
              ]}
              value={selectedCampaignId}
              onValueChange={(value) => {
                setSelectedCampaignId(value);
                if (value) {
                  loadAnalytics(value);
                }
                if (!campaignsLoaded) {
                  loadCampaigns();
                }
              }}
              placeholder={loadingCampaigns ? "Loading campaigns..." : "Search campaigns..."}
              emptyMessage="No campaigns found."
              disabled={loadingCampaigns}
            />
          </div>

          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
              {error}
            </div>
          )}

          {analytics && (
            <div className="space-y-6">
              {/* Campaign Overview */}
              <Card>
                <CardHeader>
                  <CardTitle>{analytics.campaign_overview.campaign_title}</CardTitle>
                  <CardDescription>
                    Status: {analytics.campaign_overview.status} | 
                    Started: {new Date(analytics.campaign_overview.start_date).toLocaleDateString()} | 
                    Ended: {new Date(analytics.campaign_overview.end_date).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Key Metrics */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Visits</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.visits.total}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Unique Visitors</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.visits.unique_ip}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Prospects Notified</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.statistics.total_prospects_notified}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Prospect Visits</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.statistics.unique_prospect_visits}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Email CTR</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.statistics.email_cta_click_rate}%</div>
                  </CardContent>
                </Card>
              </div>

              <Separator />

              {/* Device & Browser Analytics */}
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Device Types</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={formatDataForChart(analytics.device_browser_breakdown.device_types)}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {formatDataForChart(analytics.device_browser_breakdown.device_types).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Browsers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={formatDataForBarChart(analytics.device_browser_breakdown.browsers)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Operating Systems</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={formatDataForChart(analytics.device_browser_breakdown.operating_systems)}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#82ca9d"
                          dataKey="value"
                        >
                          {formatDataForChart(analytics.device_browser_breakdown.operating_systems).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Languages</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={formatDataForBarChart(analytics.device_browser_breakdown.languages)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#ffc658" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <Separator />

              {/* UTM Source Analytics */}
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Traffic Sources</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={formatDataForBarChart(analytics.utm_sources.source)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#00C49F" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Traffic Medium</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={formatDataForChart(analytics.utm_sources.medium)}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#FF8042"
                          dataKey="value"
                        >
                          {formatDataForChart(analytics.utm_sources.medium).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading analytics...</div>
            </div>
          )}

          {!analytics && !loading && selectedCampaignId && (
            <div className="text-center py-8 text-muted-foreground">
              No analytics data available for this campaign
            </div>
          )}

          {!selectedCampaignId && !loading && (
            <div className="text-center py-8 text-muted-foreground">
              Select a campaign to view analytics
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
