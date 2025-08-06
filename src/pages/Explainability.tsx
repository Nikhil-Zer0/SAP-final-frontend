import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileUpload } from "@/components/common/FileUpload";
import { Brain, TrendingUp, TrendingDown, FileText, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ExplainabilityForm {
  file: File | null;
  model_name: string;
  model_version: string;
  target_variable: string;
  sensitive_attribute: string;
  instance_index: number;
  role: string;
}

interface FeatureImportance {
  feature: string;
  importance: number;
  direction: "positive" | "negative";
}

interface ExplainabilityResult {
  model_name: string;
  model_version: string;
  instance_index: number;
  shap_values: Record<string, number>;
  feature_importance: FeatureImportance[];
  natural_language_explanation: string;
  role: string;
  recommendations: string[];
}

export default function Explainability() {
  const [form, setForm] = useState<ExplainabilityForm>({
    file: null,
    model_name: "",
    model_version: "",
    target_variable: "",
    sensitive_attribute: "",
    instance_index: 0,
    role: "executive"
  });
  const [result, setResult] = useState<ExplainabilityResult | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: keyof ExplainabilityForm, value: string | number) => {
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
    
    const requiredFields = ['model_name', 'model_version', 'target_variable', 'sensitive_attribute'];
    for (const field of requiredFields) {
      if (!form[field as keyof ExplainabilityForm]) {
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
      // Mock API call - replace with actual endpoint
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockResult: ExplainabilityResult = {
        model_name: form.model_name,
        model_version: form.model_version,
        instance_index: form.instance_index,
        shap_values: {
          experience: -0.119,
          education: 0.071,
          gender: -0.109,
          age: 0.012
        },
        feature_importance: [
          {
            feature: "experience",
            importance: 0.119,
            direction: "negative"
          },
          {
            feature: "gender", 
            importance: 0.109,
            direction: "negative"
          },
          {
            feature: "education",
            importance: 0.071,
            direction: "positive"
          },
          {
            feature: "age",
            importance: 0.012,
            direction: "positive"
          }
        ],
        natural_language_explanation: "Executive Summary: The model's decisions are significantly influenced by gender and experience factors, showing potential bias concerns that require immediate attention for compliance with fairness regulations.",
        role: form.role,
        recommendations: [
          "Gender has a negative impact on outcomes. Consider implementing fairness-aware retraining.",
          "Monitor model performance quarterly to ensure continued fairness and compliance."
        ]
      };
      
      setResult(mockResult);
      toast({
        title: "Explainability analysis completed",
        description: `Generated explanation for ${form.role} role`,
      });
    } catch (error) {
      toast({
        title: "Analysis failed",
        description: "Failed to generate explainability report",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getFeatureColor = (direction: string) => {
    return direction === "positive" ? "text-success" : "text-destructive";
  };

  const getFeatureIcon = (direction: string) => {
    return direction === "positive" ? TrendingUp : TrendingDown;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Model Explainability</h1>
        <p className="text-muted-foreground">Generate SHAP-based explanations for AI model decisions</p>
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
                  <Label htmlFor="instance_index">Instance Index</Label>
                  <Input
                    id="instance_index"
                    type="number"
                    min="0"
                    value={form.instance_index}
                    onChange={(e) => handleInputChange('instance_index', parseInt(e.target.value) || 0)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="role">Explanation Role</Label>
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
            </div>
            
            <Button 
              onClick={handleSubmit} 
              disabled={loading} 
              className="w-full mt-6 bg-gradient-to-r from-primary to-primary-glow"
            >
              {loading ? "Generating..." : "Generate Explanation"}
            </Button>
          </Card>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {result && (
            <>
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Brain className="w-6 h-6 text-primary" />
                  <div>
                    <h3 className="text-lg font-semibold">Model Explanation</h3>
                    <p className="text-sm text-muted-foreground">
                      {result.model_name} v{result.model_version} - Instance {result.instance_index}
                    </p>
                  </div>
                </div>
                
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-primary capitalize">{result.role} Summary</span>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">
                    {result.natural_language_explanation}
                  </p>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Feature Importance</h3>
                <div className="space-y-4">
                  {result.feature_importance.map((feature, index) => {
                    const FeatureIcon = getFeatureIcon(feature.direction);
                    return (
                      <div key={index} className="flex items-center justify-between p-3 bg-card rounded-lg border">
                        <div className="flex items-center gap-3">
                          <FeatureIcon className={`w-5 h-5 ${getFeatureColor(feature.direction)}`} />
                          <span className="font-medium capitalize">{feature.feature}</span>
                        </div>
                        <div className="text-right">
                          <span className={`font-bold ${getFeatureColor(feature.direction)}`}>
                            {feature.importance.toFixed(3)}
                          </span>
                          <div className="text-xs text-muted-foreground capitalize">
                            {feature.direction} impact
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">SHAP Values</h3>
                <div className="space-y-3">
                  {Object.entries(result.shap_values).map(([feature, value]) => (
                    <div key={feature} className="flex items-center justify-between">
                      <span className="text-muted-foreground capitalize">{feature}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-border rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${value > 0 ? 'bg-success' : 'bg-destructive'}`}
                            style={{ width: `${Math.abs(value) * 100}%` }}
                          />
                        </div>
                        <span className={`font-mono text-sm ${value > 0 ? 'text-success' : 'text-destructive'}`}>
                          {value.toFixed(3)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Recommendations</h3>
                <div className="space-y-3">
                  {result.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-warning/5 rounded-lg border border-warning/20">
                      <Brain className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-foreground">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          )}
          
          {!result && !loading && (
            <Card className="p-6 text-center">
              <Brain className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Explanation Generated</h3>
              <p className="text-muted-foreground">
                Upload a CSV file and configure the model parameters to generate explanations
              </p>
            </Card>
          )}
          
          {loading && (
            <Card className="p-6 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold mb-2">Generating Explanation...</h3>
              <p className="text-muted-foreground">
                Creating SHAP-based explanations for your model
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}