import { Card } from "@/components/ui/card";

interface RiskGaugeProps {
  score: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function RiskGauge({ score, size = "md", className = "" }: RiskGaugeProps) {
  const radius = size === "sm" ? 40 : size === "md" ? 60 : 80;
  const strokeWidth = size === "sm" ? 6 : size === "md" ? 8 : 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getRiskLevel = (score: number) => {
    if (score <= 30) return { level: "Low", color: "text-success", bg: "from-success/20 to-success/5" };
    if (score <= 60) return { level: "Medium", color: "text-warning", bg: "from-warning/20 to-warning/5" };
    if (score <= 85) return { level: "High", color: "text-destructive", bg: "from-destructive/20 to-destructive/5" };
    return { level: "Critical", color: "text-risk-critical", bg: "from-risk-critical/20 to-risk-critical/5" };
  };

  const risk = getRiskLevel(score);
  const gaugeSize = size === "sm" ? "w-24 h-24" : size === "md" ? "w-32 h-32" : "w-40 h-40";

  return (
    <Card className={`p-6 bg-gradient-to-br ${risk.bg} ${className}`}>
      <div className="flex flex-col items-center">
        <div className={`relative ${gaugeSize}`}>
          <svg className="transform -rotate-90 w-full h-full">
            {/* Background Circle */}
            <circle
              cx="50%"
              cy="50%"
              r={radius}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              fill="none"
              className="text-border"
            />
            {/* Progress Circle */}
            <circle
              cx="50%"
              cy="50%"
              r={radius}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              fill="none"
              strokeLinecap="round"
              className={risk.color.replace('text-', 'text-')}
              style={{
                strokeDasharray,
                strokeDashoffset,
                transition: "stroke-dashoffset 0.5s ease-in-out",
              }}
            />
          </svg>
          
          {/* Center Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-2xl font-bold ${risk.color}`}>
              {score}
            </span>
            <span className="text-sm text-muted-foreground">Risk Score</span>
          </div>
        </div>
        
        <div className="mt-4 text-center">
          <p className={`font-semibold ${risk.color}`}>{risk.level} Risk</p>
          <p className="text-sm text-muted-foreground">
            {score <= 30 ? "Models are compliant" : 
             score <= 60 ? "Monitor closely" :
             score <= 85 ? "Immediate attention needed" : 
             "Critical intervention required"}
          </p>
        </div>
      </div>
    </Card>
  );
}