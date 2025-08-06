import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileUpload } from "@/components/common/FileUpload";
import { RiskGauge } from "@/components/dashboard/RiskGauge";
import { AlertTriangle, CheckCircle, TrendingDown, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { biasDetectionApi, BiasDetectionResult, ApiError } from "@/lib/api";

interface BiasDetectionForm {
  file: File | null;
  model_name: string;
  model_version: string;
  target_variable: string;
  sensitive_attribute: string;
  privileged_group: string;
  unprivileged_group: string;
}

// Interface moved to api.ts

export default function BiasDetection() {
  const [form, setForm] = useState<BiasDetectionForm>({
    file: null,
    model_name: "",
    model_version: "",
    target_variable: "",
    sensitive_attribute: "",
    privileged_group: "",
    unprivileged_group: ""
  });
  const [result, setResult] = useState<BiasDetectionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: keyof BiasDetectionForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = (file: File) => {
    setForm(prev => ({ ...prev, file }));
  };

  const validateForm = () => {
    if (!form.file) {
      toast({
        title: "File required",
        description: "Please upload a CSV file",
        variant: "destructive",
      });
      return false;
    }
    
    const requiredFields = ['model_name', 'model_version', 'target_variable', 'sensitive_attribute', 'privileged_group', 'unprivileged_group'];
    for (const field of requiredFields) {
      if (!form[field as keyof BiasDetectionForm]) {
        toast({
          title: "Missing required field",
          description: `Please fill in ${field.replace('_', ' ')}`,
          variant: "destructive",
        });
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const result = await biasDetectionApi.detect(
        form.file!,
        form.model_name,
        form.model_version,
        form.target_variable,
        form.sensitive_attribute,
        form.privileged_group,
        form.unprivileged_group
      );
      
      console.log('Bias detection API response:', result);
      setResult(result);
      toast({
        title: "Bias detection completed",
        description: `Analysis completed for ${result.record_count ?? 0} records`,
      });
    } catch (error) {
      console.error('Bias detection API error:', error);
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : "Failed to perform bias detection";
        
      toast({
        title: "Analysis failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getMetricColor = (value: number, metric: string) => {
    if (metric === 'disparate_impact') {
      return value >= 0.8 ? "text-success" : "text-destructive";
    }
    return Math.abs(value) <= 0.1 ? "text-success" : "text-destructive";
  };

  const getStatusIcon = (status: string) => {
    return status === "COMPLIANT" ? CheckCircle : AlertTriangle;
  };

  const getStatusColor = (status: string) => {
    return status === "COMPLIANT" ? "text-success" : "text-destructive";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Bias Detection</h1>
        <p className="text-muted-foreground">Analyze AI models for algorithmic bias and fairness violations</p>
      </div>

      {/* Input Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <FileUpload onFileSelect={handleFileSelect} />
          
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Model Configuration</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="model_name">Model Name</Label>
                  <Input
                    id="model_name"
                    placeholder="e.g., hiring_classifier"
                    value={form.model_name}
                    onChange={(e) => handleInputChange('model_name', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="model_version">Model Version</Label>
                  <Input
                    id="model_version"
                    placeholder="e.g., 1.0"
                    value={form.model_version}
                    onChange={(e) => handleInputChange('model_version', e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="target_variable">Target Variable</Label>
                <Input
                  id="target_variable"
                  placeholder="e.g., hired, approved, selected"
                  value={form.target_variable}
                  onChange={(e) => handleInputChange('target_variable', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="sensitive_attribute">Sensitive Attribute</Label>
                <Select onValueChange={(value) => handleInputChange('sensitive_attribute', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select sensitive attribute" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gender">Gender</SelectItem>
                    <SelectItem value="race">Race</SelectItem>
                    <SelectItem value="age">Age</SelectItem>
                    <SelectItem value="ethnicity">Ethnicity</SelectItem>
                    <SelectItem value="religion">Religion</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="privileged_group">Privileged Group</Label>
                  <Input
                    id="privileged_group"
                    placeholder="e.g., Male, White"
                    value={form.privileged_group}
                    onChange={(e) => handleInputChange('privileged_group', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="unprivileged_group">Unprivileged Group</Label>
                  <Input
                    id="unprivileged_group"
                    placeholder="e.g., Female, Non-White"
                    value={form.unprivileged_group}
                    onChange={(e) => handleInputChange('unprivileged_group', e.target.value)}
                  />
                </div>
              </div>
            </div>
            
            <Button 
              onClick={handleSubmit} 
              disabled={loading} 
              className="w-full mt-6 bg-gradient-to-r from-primary to-primary-glow"
            >
              {loading ? "Analyzing..." : "Run Bias Detection"}
            </Button>
          </Card>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {result && (
            <>
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  {(() => {
                    const StatusIcon = getStatusIcon(result.audit_status);
                    return <StatusIcon className={`w-6 h-6 ${getStatusColor(result.audit_status)}`} />;
                  })()}
                  <div>
                    <h3 className="text-lg font-semibold">Audit Status</h3>
                    <p className={`font-medium ${getStatusColor(result.audit_status)}`}>
                      {result.audit_status}
                    </p>
                  </div>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  Analyzed {result.record_count ?? 0} records
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Fairness Metrics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Disparate Impact</span>
                    <span className={`font-bold ${getMetricColor(result.metrics.disparate_impact ?? 0, 'disparate_impact')}`}>
                      {result.metrics.disparate_impact?.toFixed(3) ?? 'N/A'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Statistical Parity Difference</span>
                    <span className={`font-bold ${getMetricColor(result.metrics.statistical_parity_difference ?? 0, 'spd')}`}>
                      {result.metrics.statistical_parity_difference?.toFixed(3) ?? 'N/A'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Equal Opportunity Difference</span>
                    <span className={`font-bold ${getMetricColor(result.metrics.equal_opportunity_difference ?? 0, 'eod')}`}>
                      {result.metrics.equal_opportunity_difference?.toFixed(3) ?? 'N/A'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Average Odds Difference</span>
                    <span className={`font-bold ${getMetricColor(result.metrics.average_odds_difference ?? 0, 'aod')}`}>
                      {result.metrics.average_odds_difference?.toFixed(3) ?? 'N/A'}
                    </span>
                  </div>
                </div>
                
                {/* Disparate Impact Gauge */}
                <div className="mt-6">
                  <h4 className="text-sm font-medium mb-3">Disparate Impact Visualization</h4>
                  <div className="flex justify-center">
                    <RiskGauge 
                      score={result.metrics.disparate_impact ? Math.round((1 - result.metrics.disparate_impact) * 100) : 0} 
                      size="md" 
                    />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Recommendations</h3>
                <div className="space-y-3">
                  {result.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
                      <TrendingDown className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-foreground">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          )}
          
          {!result && !loading && (
            <Card className="p-6 text-center">
              <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Analysis Yet</h3>
              <p className="text-muted-foreground">
                Upload a CSV file and configure the parameters to run bias detection
              </p>
            </Card>
          )}
          
          {loading && (
            <Card className="p-6 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold mb-2">Analyzing...</h3>
              <p className="text-muted-foreground">
                Running bias detection analysis on your data
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}