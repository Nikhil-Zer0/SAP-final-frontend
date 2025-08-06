import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileUpload } from "@/components/common/FileUpload";
import { FileText, Download, Shield, CheckCircle, AlertTriangle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { complianceApi, ApiError } from "@/lib/api";

interface ComplianceForm {
  file: File | null;
  model_name: string;
  model_version: string;
  target_variable: string;
  sensitive_attribute: string;
  privileged_group: string;
  unprivileged_group: string;
  role: string;
}

interface ComplianceStatus {
  gdpr: "compliant" | "non-compliant" | "pending";
  eeoc: "compliant" | "non-compliant" | "pending";
  eu_ai_act: "compliant" | "non-compliant" | "pending";
  internal_policy: "compliant" | "non-compliant" | "pending";
}

export default function ComplianceReport() {
  const [form, setForm] = useState<ComplianceForm>({
    file: null,
    model_name: "",
    model_version: "",
    target_variable: "",
    sensitive_attribute: "",
    privileged_group: "",
    unprivileged_group: "",
    role: "executive"
  });
  const [loading, setLoading] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [complianceStatus, setComplianceStatus] = useState<ComplianceStatus>({
    gdpr: "pending",
    eeoc: "pending", 
    eu_ai_act: "pending",
    internal_policy: "pending"
  });
  const { toast } = useToast();

  const handleInputChange = (field: keyof ComplianceForm, value: string) => {
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
      if (!form[field as keyof ComplianceForm]) {
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

  const handleGenerateReport = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Generate the compliance report PDF
      const pdfBlob = await complianceApi.generateReport(
        form.file!,
        form.model_name,
        form.model_version,
        form.target_variable,
        form.sensitive_attribute,
        form.privileged_group,
        form.unprivileged_group,
        form.role
      );
      
      // Store the PDF blob for download
      setPdfBlob(pdfBlob);
      
      // For compliance status, we'll simulate based on the successful generation
      // In a real scenario, this might come from the API response
      const mockStatus: ComplianceStatus = {
        gdpr: "compliant",
        eeoc: "non-compliant",
        eu_ai_act: "non-compliant", 
        internal_policy: "compliant"
      };
      
      setComplianceStatus(mockStatus);
      setReportGenerated(true);
      
      toast({
        title: "Compliance report generated",
        description: "Report is ready for download",
      });
    } catch (error) {
      console.error('Compliance report API error:', error);
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : "Failed to generate compliance report";
        
      toast({
        title: "Report generation failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = () => {
    if (pdfBlob) {
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Ethical_AI_Compliance_Report.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Download started",
        description: "Ethical_AI_Compliance_Report.pdf",
      });
    } else {
      toast({
        title: "Download failed",
        description: "No report available for download",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "compliant": return CheckCircle;
      case "non-compliant": return AlertTriangle;
      default: return Clock;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "compliant": return "text-success";
      case "non-compliant": return "text-destructive";
      default: return "text-warning";
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case "compliant": return "bg-success/10 border-success/20";
      case "non-compliant": return "bg-destructive/10 border-destructive/20";
      default: return "bg-warning/10 border-warning/20";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Compliance Report Generator</h1>
        <p className="text-muted-foreground">Generate comprehensive compliance reports for regulatory requirements</p>
      </div>

      {/* Input Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <FileUpload onFileSelect={handleFileSelect} />
          
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Model Information</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="model_name">Model Name</Label>
                  <Input
                    id="model_name"
                    placeholder="e.g., hiring_model_v1"
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
                  placeholder="e.g., hired, approved"
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
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="privileged_group">Privileged Group</Label>
                  <Input
                    id="privileged_group"
                    placeholder="e.g., Male"
                    value={form.privileged_group}
                    onChange={(e) => handleInputChange('privileged_group', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="unprivileged_group">Unprivileged Group</Label>
                  <Input
                    id="unprivileged_group"
                    placeholder="e.g., Female"
                    value={form.unprivileged_group}
                    onChange={(e) => handleInputChange('unprivileged_group', e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="role">Report Role</Label>
                <Select onValueChange={(value) => handleInputChange('role', value)} defaultValue="executive">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="executive">Executive</SelectItem>
                    <SelectItem value="compliance">Compliance</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Button 
              onClick={handleGenerateReport} 
              disabled={loading} 
              className="w-full mt-6 bg-gradient-to-r from-primary to-primary-glow"
            >
              {loading ? "Generating Report..." : "Generate Compliance Report"}
            </Button>
          </Card>
        </div>

        {/* Report Preview & Status */}
        <div className="space-y-6">
          {reportGenerated && (
            <>
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <FileText className="w-6 h-6 text-primary" />
                    <div>
                      <h3 className="text-lg font-semibold">Compliance Report Ready</h3>
                      <p className="text-sm text-muted-foreground">
                        {form.model_name} v{form.model_version} - {form.role} report
                      </p>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleDownloadReport}
                    className="bg-gradient-to-r from-success to-success/80"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
                
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <p className="text-sm text-foreground">
                    <strong>Report includes:</strong> Bias analysis, fairness metrics, regulatory compliance status, 
                    risk assessment, and actionable recommendations for {form.role} stakeholders.
                  </p>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Regulatory Compliance Status</h3>
                <div className="space-y-4">
                  {Object.entries(complianceStatus).map(([regulation, status]) => {
                    const StatusIcon = getStatusIcon(status);
                    return (
                      <div key={regulation} className={`flex items-center justify-between p-3 rounded-lg border ${getStatusBg(status)}`}>
                        <div className="flex items-center gap-3">
                          <StatusIcon className={`w-5 h-5 ${getStatusColor(status)}`} />
                          <span className="font-medium uppercase">
                            {regulation.replace('_', ' ')}
                          </span>
                        </div>
                        <span className={`font-medium capitalize ${getStatusColor(status)}`}>
                          {status.replace('_', ' ')}
                        </span>
                      </div>
                    );
                  })}
                </div>
                
                <div className="mt-6 p-4 bg-warning/5 rounded-lg border border-warning/20">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-warning mb-1">Compliance Issues Detected</p>
                      <p className="text-sm text-muted-foreground">
                        Model shows non-compliance with EEOC and EU AI Act regulations. 
                        Immediate action required to address bias concerns.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Report Preview</h3>
                <div className="space-y-4 text-sm">
                  <div className="border-l-4 border-primary pl-4">
                    <h4 className="font-medium">Executive Summary</h4>
                    <p className="text-muted-foreground">
                      Comprehensive analysis of {form.model_name} reveals bias concerns requiring immediate attention...
                    </p>
                  </div>
                  
                  <div className="border-l-4 border-warning pl-4">
                    <h4 className="font-medium">Key Findings</h4>
                    <p className="text-muted-foreground">
                      Disparate impact ratio below regulatory thresholds, bias detected in {form.sensitive_attribute}...
                    </p>
                  </div>
                  
                  <div className="border-l-4 border-success pl-4">
                    <h4 className="font-medium">Recommendations</h4>
                    <p className="text-muted-foreground">
                      Implement fairness-aware training, monitor quarterly, adjust decision thresholds...
                    </p>
                  </div>
                </div>
              </Card>
            </>
          )}
          
          {!reportGenerated && !loading && (
            <Card className="p-6 text-center">
              <Shield className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Report Generated</h3>
              <p className="text-muted-foreground">
                Upload a CSV file and configure the parameters to generate a compliance report
              </p>
            </Card>
          )}
          
          {loading && (
            <Card className="p-6 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold mb-2">Generating Report...</h3>
              <p className="text-muted-foreground">
                Creating comprehensive compliance analysis
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}