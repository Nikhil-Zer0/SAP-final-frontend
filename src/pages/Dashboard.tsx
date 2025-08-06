import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { RiskGauge } from "@/components/dashboard/RiskGauge";
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  FileText,
  TrendingUp,
  Activity,
  Users
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DashboardData {
  timestamp: string;
  total_models_audited: number;
  compliant_models: number;
  non_compliant_models: number;
  compliance_rate: number;
  top_bias_source: string;
  most_risky_model: string;
  audit_status: string;
  risk_score: number;
  last_audit: string;
  pending_actions: number;
  trend: string;
}

interface ModelRisk {
  model_name: string;
  version: string;
  status: string;
  risk_score: number;
  bias_source: string;
  disparate_impact: number;
  last_audited: string;
}

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [modelRisks, setModelRisks] = useState<ModelRisk[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Mock API calls - replace with actual endpoints
      const summaryResponse = await mockApiCall('/api/v1/dashboard/summary') as DashboardData;
      const modelRiskResponse = await mockApiCall('/api/v1/dashboard/model_risk') as ModelRisk[];
      
      setDashboardData(summaryResponse);
      setModelRisks(modelRiskResponse);
    } catch (error) {
      toast({
        title: "Error loading dashboard",
        description: "Failed to fetch dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Mock API function - replace with actual API calls
  const mockApiCall = async (endpoint: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (endpoint === '/api/v1/dashboard/summary') {
      return {
        timestamp: "2025-08-06T03:30:00Z",
        total_models_audited: 12,
        compliant_models: 7,
        non_compliant_models: 5,
        compliance_rate: 0.58,
        top_bias_source: "gender",
        most_risky_model: "hiring_model_v1",
        audit_status: "in_progress",
        risk_score: 68,
        last_audit: "2025-08-05T10:30:00Z",
        pending_actions: 3,
        trend: "improving"
      };
    }
    
    if (endpoint === '/api/v1/dashboard/model_risk') {
      return [
        {
          model_name: "hiring_model_v1",
          version: "1.0",
          status: "NON-COMPLIANT",
          risk_score: 92,
          bias_source: "gender",
          disparate_impact: 0.717,
          last_audited: "2025-08-05"
        },
        {
          model_name: "fraud_detection_v2",
          version: "2.1",
          status: "COMPLIANT",
          risk_score: 34,
          bias_source: "none",
          disparate_impact: 0.91,
          last_audited: "2025-08-04"
        },
        {
          model_name: "credit_scoring_v3",
          version: "3.0",
          status: "NON-COMPLIANT",
          risk_score: 76,
          bias_source: "age",
          disparate_impact: 0.78,
          last_audited: "2025-08-03"
        }
      ];
    }
  };

  const getStatusColor = (status: string) => {
    return status === "COMPLIANT" ? "text-success" : "text-destructive";
  };

  const getRiskColor = (score: number) => {
    if (score <= 30) return "text-success";
    if (score <= 60) return "text-warning";
    if (score <= 85) return "text-destructive";
    return "text-risk-critical";
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">AI Model Dashboard</h1>
            <p className="text-muted-foreground">Monitor AI fairness and compliance across your enterprise</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-20 bg-muted rounded"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!dashboardData) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">AI Model Dashboard</h1>
          <p className="text-muted-foreground">Monitor AI fairness and compliance across your enterprise</p>
        </div>
        
        <div className="flex gap-3">
          <Button onClick={fetchDashboardData} variant="outline">
            <Activity className="w-4 h-4 mr-2" />
            Refresh Data
          </Button>
          <Button className="bg-gradient-to-r from-primary to-primary-glow hover:shadow-lg">
            <FileText className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Models"
          value={dashboardData.total_models_audited}
          icon={Shield}
          variant="default"
        />
        <MetricCard
          title="Compliant Models"
          value={dashboardData.compliant_models}
          icon={CheckCircle}
          variant="success"
        />
        <MetricCard
          title="Non-Compliant"
          value={dashboardData.non_compliant_models}
          icon={AlertTriangle}
          variant="destructive"
        />
        <MetricCard
          title="Pending Actions"
          value={dashboardData.pending_actions}
          icon={Clock}
          trend="down"
          trendValue="2"
          variant="warning"
        />
      </div>

      {/* Risk Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <RiskGauge score={dashboardData.risk_score} size="lg" />
        </div>
        
        <div className="lg:col-span-2">
          <Card className="p-6 h-full">
            <h3 className="text-xl font-semibold mb-4">Compliance Overview</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">GDPR Compliance</span>
                <span className="text-success font-medium">✓ Compliant</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">EEOC Guidelines</span>
                <span className="text-warning font-medium">⚠ Review Required</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">EU AI Act</span>
                <span className="text-destructive font-medium">✗ Non-Compliant</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Internal Policy</span>
                <span className="text-success font-medium">✓ Compliant</span>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
              <p className="text-sm text-foreground">
                <strong>Top Risk:</strong> {dashboardData.most_risky_model} shows bias in {dashboardData.top_bias_source}
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* Model Risk Breakdown */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Model Risk Breakdown</h3>
          <Button variant="outline" size="sm">
            <TrendingUp className="w-4 h-4 mr-2" />
            View Trends
          </Button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 text-muted-foreground font-medium">Model Name</th>
                <th className="text-left p-3 text-muted-foreground font-medium">Version</th>
                <th className="text-left p-3 text-muted-foreground font-medium">Status</th>
                <th className="text-left p-3 text-muted-foreground font-medium">Risk Score</th>
                <th className="text-left p-3 text-muted-foreground font-medium">Bias Source</th>
                <th className="text-left p-3 text-muted-foreground font-medium">Impact Ratio</th>
                <th className="text-left p-3 text-muted-foreground font-medium">Last Audited</th>
              </tr>
            </thead>
            <tbody>
              {modelRisks.map((model, index) => (
                <tr key={index} className="border-b border-border/50 hover:bg-accent/30">
                  <td className="p-3 font-medium">{model.model_name}</td>
                  <td className="p-3 text-muted-foreground">{model.version}</td>
                  <td className="p-3">
                    <span className={`font-medium ${getStatusColor(model.status)}`}>
                      {model.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`font-bold ${getRiskColor(model.risk_score)}`}>
                      {model.risk_score}
                    </span>
                  </td>
                  <td className="p-3 text-muted-foreground">{model.bias_source}</td>
                  <td className="p-3 text-muted-foreground">{model.disparate_impact.toFixed(3)}</td>
                  <td className="p-3 text-muted-foreground">{model.last_audited}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}