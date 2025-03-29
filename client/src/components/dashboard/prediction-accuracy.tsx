import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";
import { PredictionAccuracyData } from "@/types/tpa";
import { NoDataEmptyState } from "@/components/ui/empty-state";

interface PredictionAccuracyProps {
  data?: PredictionAccuracyData;
  isLoading?: boolean;
}

export function PredictionAccuracy({ data, isLoading = false }: PredictionAccuracyProps) {
  if (isLoading) {
    return (
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold text-secondary-700 mb-3">Prediction Accuracy</h3>
          <div className="space-y-4">
            <div className="animate-pulse h-4 bg-secondary-200 rounded w-full"></div>
            <div className="animate-pulse h-28 bg-secondary-200 rounded w-full"></div>
            <div className="animate-pulse h-32 bg-secondary-200 rounded w-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <NoDataEmptyState 
        title="No Prediction Accuracy Data"
        description="Prediction accuracy data is not available. Please run an analysis to see the results."
      />
    );
  }

  const getColorForAccuracy = (value: number) => {
    if (value >= 90) return "bg-green-500";
    if (value >= 80) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getTextColorForAccuracy = (value: number) => {
    if (value >= 90) return "text-green-600";
    if (value >= 80) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <Card className="shadow-sm border border-secondary-200">
      <CardContent className="p-4">
        <h3 className="text-sm font-semibold text-secondary-700 mb-3">Prediction Accuracy</h3>
        
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-secondary-600">Overall Accuracy</span>
            <span className={`text-sm font-medium ${getTextColorForAccuracy(data.overall)}`}>
              {data.overall.toFixed(1)}%
            </span>
          </div>
          <Progress 
            value={data.overall} 
            className="h-2" 
            indicatorClassName={getColorForAccuracy(data.overall)} 
          />
        </div>
        
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-secondary-600">Low Frequency (20-200Hz)</span>
              <span className={`text-xs font-medium ${getTextColorForAccuracy(data.lowFrequency)}`}>
                {data.lowFrequency.toFixed(1)}%
              </span>
            </div>
            <Progress 
              value={data.lowFrequency} 
              className="h-1.5" 
              indicatorClassName={getColorForAccuracy(data.lowFrequency)} 
            />
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-secondary-600">Mid Frequency (200-1kHz)</span>
              <span className={`text-xs font-medium ${getTextColorForAccuracy(data.midFrequency)}`}>
                {data.midFrequency.toFixed(1)}%
              </span>
            </div>
            <Progress 
              value={data.midFrequency} 
              className="h-1.5" 
              indicatorClassName={getColorForAccuracy(data.midFrequency)} 
            />
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-secondary-600">High Frequency (1k-10kHz)</span>
              <span className={`text-xs font-medium ${getTextColorForAccuracy(data.highFrequency)}`}>
                {data.highFrequency.toFixed(1)}%
              </span>
            </div>
            <Progress 
              value={data.highFrequency} 
              className="h-1.5" 
              indicatorClassName={getColorForAccuracy(data.highFrequency)} 
            />
          </div>
        </div>
        
        <div className="mt-4">
          <h4 className="text-xs font-medium text-secondary-700 mb-2">Error Distribution</h4>
          <div className="h-32 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data.errorDistribution}
                margin={{
                  top: 5,
                  right: 5,
                  left: 5,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="frequency" 
                  tick={{ fontSize: 10 }}
                />
                <YAxis 
                  tick={{ fontSize: 10 }}
                  domain={[0, 20]}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip 
                  formatter={(value: number) => [`${value.toFixed(1)}%`, 'Error']}
                  labelFormatter={(label) => `Frequency: ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="error" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name="Error"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="mt-4">
          <Button variant="secondary" size="sm" className="w-full">
            View Detailed Report
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
