import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from "recharts";
import { SvdAnalysisData } from "@/types/tpa";
import { Progress } from "@/components/ui/progress";
import { NoDataEmptyState } from "@/components/ui/empty-state";
import { CheckCircle2, AlertCircle } from "lucide-react";

interface SvdAnalysisProps {
  data?: SvdAnalysisData;
  isLoading?: boolean;
}

export function SvdAnalysis({ data, isLoading = false }: SvdAnalysisProps) {
  if (isLoading) {
    return (
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold text-secondary-700 mb-3">SVD Analysis</h3>
          <div className="space-y-4">
            <div className="animate-pulse h-4 bg-secondary-200 rounded w-full"></div>
            <div className="animate-pulse h-16 bg-secondary-200 rounded w-full"></div>
            <div className="animate-pulse h-32 bg-secondary-200 rounded w-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <NoDataEmptyState 
        title="No SVD Analysis Data"
        description="Singular Value Decomposition analysis is not available. Please run an analysis to see the results."
      />
    );
  }

  // Format data for the bar chart
  const chartData = data.singularValues.map((value, index) => ({
    index: index + 1,
    value: value,
    isUsed: index < data.singularValuesUsed
  }));

  return (
    <Card className="shadow-sm border border-secondary-200">
      <CardContent className="p-4">
        <h3 className="text-sm font-semibold text-secondary-700 mb-3">SVD Analysis</h3>
        
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-secondary-600 mb-1">
            <span>Truncation Level</span>
            <span>{data.truncationLevel}%</span>
          </div>
          <Progress value={data.truncationLevel} className="h-2" />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-secondary-600">Singular Values Used</span>
            <span className="text-sm font-medium">
              {data.singularValuesUsed} / {data.singularValues.length}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-secondary-600">Condition Number</span>
            <span className="text-sm font-medium">{data.conditionNumber.toFixed(1)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-secondary-600">Inversion Quality</span>
            <div className="flex items-center">
              <span className={`text-sm font-medium mr-1 ${
                data.inversionQuality === 'Good' ? 'text-green-600' : 'text-amber-600'
              }`}>
                {data.inversionQuality}
              </span>
              {data.inversionQuality === 'Good' ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-amber-600" />
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-medium text-secondary-700">Singular Values</h4>
            <Button variant="link" size="sm" className="text-xs text-primary-600 p-0 h-auto">
              Details
            </Button>
          </div>
          
          <div className="h-32 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{
                  top: 5,
                  right: 5,
                  left: 5,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="index" 
                  tick={{ fontSize: 10 }}
                  tickFormatter={(value) => value % 2 === 0 ? value : ''}
                />
                <YAxis 
                  tick={{ fontSize: 10 }}
                  domain={[0, 'dataMax']}
                />
                <Bar dataKey="value" name="Singular Value">
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.isUsed ? '#2563eb' : '#94a3b8'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
