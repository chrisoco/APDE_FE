import { useState } from "react";
import type { Campaign } from "../../lib/types";
import { apiHelpers } from "../../lib/api";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Checkbox } from "../../components/ui/checkbox";
import { Label } from "../../components/ui/label";
import { Separator } from "../../components/ui/separator";

interface EmailSendResponse {
  message: string;
  emails_sent: number;
  total_emails_sent: number;
  notified_prospects: number;
  available_prospects: number;
  total_prospects: number;
}

interface SentEmailsStats {
  total_emails_sent: number;
  notified_prospects: number;
  available_prospects: number;
  total_prospects: number;
}

export default function CampaignOutbox() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("");
  const [forceOption, setForceOption] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const [campaignsLoaded, setCampaignsLoaded] = useState(false);
  const [sentStats, setSentStats] = useState<SentEmailsStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  const loadCampaigns = async () => {
    if (campaignsLoaded) return;
    
    setLoadingCampaigns(true);
    try {
      const response = await apiHelpers.get('/api/campaigns');
      const activeCampaigns = (response.data || []).filter((campaign: Campaign) => campaign.status === 'Active');
      setCampaigns(activeCampaigns);
      setCampaignsLoaded(true);
    } catch (err) {
      setError('Failed to load campaigns');
    } finally {
      setLoadingCampaigns(false);
    }
  };

  const loadSentStats = async (campaignId: string) => {
    setLoadingStats(true);
    // Don't clear sentStats immediately - keep previous values during loading
    try {
      const response = await apiHelpers.get<SentEmailsStats>(
        `/api/campaigns/${campaignId}/send-emails/sent`,
        { requiresAuth: true }
      );
      setSentStats(response);
    } catch (err) {
      console.error('Failed to load sent email stats:', err);
      setSentStats(null); // Only clear on error
    } finally {
      setLoadingStats(false);
    }
  };

  const handleSendEmails = async () => {
    if (!selectedCampaignId) {
      setError('Please select a campaign');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = forceOption ? { force: true } : undefined;
      await apiHelpers.post<EmailSendResponse>(
        `/api/campaigns/${selectedCampaignId}/send-emails`,
        {},
        { 
          requiresAuth: true, 
          includeCSRF: true,
          params 
        }
      );
      // Refresh the sent stats after successful send
      if (selectedCampaignId) {
        loadSentStats(selectedCampaignId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send emails');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Campaign Email Outbox</h1>
        <p className="text-muted-foreground">Send campaign emails to prospects</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Send Campaign Emails</CardTitle>
          <CardDescription>
            Select a campaign and configure sending options
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="campaign-select">Active Campaigns</Label>
            <Select 
              value={selectedCampaignId} 
              onValueChange={(value) => {
                setSelectedCampaignId(value);
                if (value) {
                  loadSentStats(value);
                }
              }}
              disabled={loadingCampaigns}
              onOpenChange={(open) => open && loadCampaigns()}
            >
              <SelectTrigger id="campaign-select">
                <SelectValue placeholder={loadingCampaigns ? "Loading active campaigns..." : "Select an active campaign"} />
              </SelectTrigger>
              <SelectContent>
                {campaigns.map((campaign) => (
                  <SelectItem key={campaign.id} value={campaign.id}>
                    {campaign.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Campaign Email Statistics</CardTitle>
              <CardDescription>
                {selectedCampaignId ? "Current email sending status for selected campaign" : "Please select a campaign to show statistics"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Total Emails Sent</p>
                  <p className="text-2xl font-bold">
                    {sentStats?.total_emails_sent ?? (loadingStats ? '0' : '-')}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Notified Prospects</p>
                  <p className="text-2xl font-bold">
                    {sentStats?.notified_prospects ?? (loadingStats ? '0' : '-')}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Available Prospects</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {sentStats?.available_prospects ?? (loadingStats ? '0' : '-')}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Total Prospects</p>
                  <p className="text-2xl font-bold">
                    {sentStats?.total_prospects ?? (loadingStats ? '0' : '-')}
                  </p>
                </div>
              </div>
              
              <Separator className="my-4" />
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Coverage Progress</p>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300" 
                    style={{ 
                      width: sentStats 
                        ? `${(sentStats.notified_prospects / sentStats.total_prospects) * 100}%` 
                        : '0%' 
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {sentStats 
                    ? `${((sentStats.notified_prospects / sentStats.total_prospects) * 100).toFixed(1)}% of prospects have been contacted`
                    : 'No data available'
                  }
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="force-option" 
              checked={forceOption}
              onCheckedChange={(checked) => setForceOption(checked === true)}
            />
            <Label 
              htmlFor="force-option"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Allow duplicate mailing (send to already notified prospects)
            </Label>
          </div>

          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
              {error}
            </div>
          )}

          <Button 
            onClick={handleSendEmails} 
            disabled={loading || !selectedCampaignId || loadingCampaigns}
            className="w-full"
          >
            {loading ? "Sending..." : "Send Emails"}
          </Button>
        </CardContent>
      </Card>

    </div>
  );
}