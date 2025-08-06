// API configuration and utility functions
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export class ApiError extends Error {
  constructor(message: string, public status: number, public response?: any) {
    super(message);
    this.name = 'ApiError';
  }
}

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    // Create timeout controller for better browser compatibility
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorData
      );
    }

    return await response.json();
  } catch (error: any) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (error.name === 'AbortError') {
      throw new ApiError('Request timeout - server may be unavailable', 0);
    }
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new ApiError('Network error - cannot connect to server', 0);
    }
    throw new ApiError('Network error or server unavailable', 0);
  }
}

// Form data API request for file uploads
async function apiFormRequest<T>(
  endpoint: string,
  formData: FormData
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    // Create timeout controller for better browser compatibility
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout for file uploads
    
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorData
      );
    }

    return await response.json();
  } catch (error: any) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (error.name === 'AbortError') {
      throw new ApiError('Request timeout - server may be unavailable', 0);
    }
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new ApiError('Network error - cannot connect to server', 0);
    }
    throw new ApiError('Network error or server unavailable', 0);
  }
}

// Dashboard API calls
export const dashboardApi = {
  getSummary: () => apiRequest<DashboardData>('/api/v1/dashboard/summary'),
  getModelRisk: () => apiRequest<ModelRisk[]>('/api/v1/dashboard/model_risk'),
  getComplianceTrend: () => apiRequest<ComplianceTrend[]>('/api/v1/dashboard/compliance_trend'),
};

// Bias Detection API
export const biasDetectionApi = {
  detect: (
    file: File,
    modelName: string,
    modelVersion: string,
    targetVariable: string,
    sensitiveAttribute: string,
    privilegedGroup: string,
    unprivilegedGroup: string
  ) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('model_name', modelName);
    formData.append('model_version', modelVersion);
    formData.append('target_variable', targetVariable);
    formData.append('sensitive_attribute', sensitiveAttribute);
    formData.append('privileged_group', privilegedGroup);
    formData.append('unprivileged_group', unprivilegedGroup);
    
    return apiFormRequest<BiasDetectionResult>('/api/v1/bias/detect', formData);
  },
};

// Explainability API
export const explainabilityApi = {
  explain: (
    file: File,
    modelName: string,
    modelVersion: string,
    targetVariable: string,
    sensitiveAttribute: string,
    instanceIndex: number,
    role: string
  ) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('model_name', modelName);
    formData.append('model_version', modelVersion);
    formData.append('target_variable', targetVariable);
    formData.append('sensitive_attribute', sensitiveAttribute);
    formData.append('instance_index', instanceIndex.toString());
    formData.append('role', role);
    
    return apiFormRequest<ExplainabilityResult>('/api/v1/explain', formData);
  },
};

// Compliance Report API
export const complianceApi = {
  generateReport: async (
    file: File,
    modelName: string,
    modelVersion: string,
    targetVariable: string,
    sensitiveAttribute: string,
    privilegedGroup: string,
    unprivilegedGroup: string,
    role: string = 'executive'
  ) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('model_name', modelName);
    formData.append('model_version', modelVersion);
    formData.append('target_variable', targetVariable);
    formData.append('sensitive_attribute', sensitiveAttribute);
    formData.append('privileged_group', privilegedGroup);
    formData.append('unprivileged_group', unprivilegedGroup);
    formData.append('role', role);
    
    const url = `${API_BASE_URL}/api/v1/compliance/generate`;
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorData
      );
    }

    // Return blob for PDF download
    return response.blob();
  },
};

// Type definitions matching API responses
export interface DashboardData {
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

export interface ModelRisk {
  model_name: string;
  version: string;
  status: string;
  risk_score: number;
  bias_source: string;
  disparate_impact: number;
  last_audited: string;
}

export interface ComplianceTrend {
  week: string;
  compliant_models: number;
}

export interface BiasDetectionResult {
  metrics: {
    disparate_impact: number;
    statistical_parity_difference: number;
    equal_opportunity_difference: number;
    average_odds_difference: number;
  };
  audit_status: string;
  recommendations: string[];
  record_count: number;
}

export interface ExplainabilityResult {
  model_name: string;
  model_version: string;
  instance_index: number;
  shap_values: Record<string, number>;
  feature_importance: Array<{
    feature: string;
    importance: number;
    direction: string;
  }>;
  natural_language_explanation: string;
  role: string;
  recommendations: string[];
}