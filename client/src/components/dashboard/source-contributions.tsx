import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SourceContribution } from "@/types/tpa";
import { sourceColors } from "@/lib/tpa-utils";
import { NoDataEmptyState } from "@/components/ui/empty-state";

// Import Recharts components
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";

interface SourceContributionsProps {
  data?: SourceContribution[];
  isLoading?: boolean;
}

const sourceOptions = [
  { value: "all", label: "All Sources" },
  { value: "engine", label: "Engine" },
  { value: "transmission", label: "Transmission" },
  { value: "exhaust", label: "Exhaust" },
];

export function SourceContributions({ data, isLoading = false }: SourceContributionsProps) {
  const [selectedSource, setSelectedSource] = useState("all");

  if (isLoading) {
    return (
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-secondary-700">Source Contributions</h3>
          </div>
          <div className="h-64 w-full bg-secondary-50 animate-pulse rounded-md"></div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <NoDataEmptyState 
        title="No Source Contribution Data"
        description="Source contribution data is not available. Please run an analysis to see contribution levels."
      />
    );
  }

  // Add colors to each source contribution
  const enhancedData = data.map(item => ({
    ...item,
    color: sourceColors[item.name as keyof typeof sourceColors] || "#6366f1" // Default to indigo
  }));

  return (
    <Card className="shadow-sm border border-secondary-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-secondary-700">Source Contributions</h3>
          <div className="flex items-center">
            <Select 
              value={selectedSource} 
              onValueChange={setSelectedSource}
            >
              <SelectTrigger className="text-xs h-7 w-auto mr-2">
                <SelectValue placeholder="All Sources" />
              </SelectTrigger>
              <SelectContent>
                {sourceOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="h-7">
              <SlidersHorizontal className="h-3 w-3 mr-1" />
              Filter
            </Button>
          </div>
        </div>
        
        <div className="chart-container h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={enhancedData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="name" 
                tickFormatter={(value) => {
                  // Abbreviate names if too long
                  if (value.length > 10) {
                    return value.substring(0, 8) + '...';
                  }
                  return value;
                }}
              />
              <YAxis 
                label={{ value: 'Contribution (dB)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip
                formatter={(value: number) => [`${value.toFixed(1)} dB`, 'Contribution']}
                labelFormatter={(label) => `Source: ${label}`}
              />
              <Bar 
                dataKey="value" 
                name="Contribution"
              >
                {enhancedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-2 grid grid-cols-4 gap-2 text-xs">
          {enhancedData.map((source, index) => (
            <div key={index} className="flex items-center">
              <span 
                className="inline-block w-3 h-3 rounded-full mr-1" 
                style={{ backgroundColor: source.color }}
              ></span>
              <span className="truncate">{source.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
