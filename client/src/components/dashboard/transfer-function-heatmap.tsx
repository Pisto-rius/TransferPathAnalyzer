import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Scale } from "lucide-react";
import { TransferFunctionData } from "@/types/tpa";
import { 
  getPathsFromTransferFunction, 
  getFrequenciesFromTransferFunction,
  getTransferFunctionRange,
  getColorIntensity
} from "@/lib/tpa-utils";
import { NoDataEmptyState } from "@/components/ui/empty-state";

interface TransferFunctionHeatmapProps {
  data?: TransferFunctionData;
  isLoading?: boolean;
}

export function TransferFunctionHeatmap({ data, isLoading = false }: TransferFunctionHeatmapProps) {
  const [showAll, setShowAll] = useState(false);
  const [paths, setPaths] = useState<string[]>([]);
  const [frequencies, setFrequencies] = useState<string[]>([]);
  const [range, setRange] = useState<{ min: number, max: number }>({ min: 0, max: 1 });
  
  useEffect(() => {
    if (data) {
      const allPaths = getPathsFromTransferFunction(data);
      const allFrequencies = getFrequenciesFromTransferFunction(data);
      const valueRange = getTransferFunctionRange(data);
      
      setPaths(showAll ? allPaths : allPaths.slice(0, 5));
      setFrequencies(allFrequencies);
      setRange(valueRange);
    }
  }, [data, showAll]);
  
  if (isLoading) {
    return (
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-secondary-700">Transfer Function Heatmap</h3>
          </div>
          <div className="h-64 w-full bg-secondary-50 animate-pulse rounded-md"></div>
        </CardContent>
      </Card>
    );
  }

  if (!data || Object.keys(data).length === 0) {
    return (
      <NoDataEmptyState 
        title="No Transfer Function Data"
        description="Transfer function data is not available. Please run an analysis to see the heatmap."
      />
    );
  }

  return (
    <Card className="shadow-sm border border-secondary-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-secondary-700">Transfer Function Heatmap</h3>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" className="h-7 px-2">
              <Scale className="h-3 w-3 mr-1" />
              Scale
            </Button>
            <Button variant="outline" size="sm" className="h-7 px-2">
              <Download className="h-3 w-3 mr-1" />
              Export
            </Button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <div className="min-w-max">
            <div className="flex space-x-1 mb-2">
              <div className="w-20"></div> {/* Empty space for y-axis labels */}
              {frequencies.map((freq, index) => (
                <div 
                  key={index} 
                  className="w-8 text-xs text-secondary-600 text-center whitespace-nowrap"
                >
                  {freq}
                </div>
              ))}
            </div>
            
            {/* Heatmap rows */}
            {paths.map((path, pathIndex) => (
              <div key={pathIndex} className="flex items-center space-x-1 mb-1">
                <div className="w-20 text-xs text-secondary-700 truncate pr-1">{path}</div>
                {frequencies.map((freq, freqIndex) => {
                  const value = data[path][freq] || 0;
                  return (
                    <div
                      key={freqIndex}
                      className={`w-8 h-8 ${getColorIntensity(value, range.min, range.max)} heatmap-cell rounded`}
                      title={`${path} at ${freq}: ${value.toFixed(2)}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center text-xs">
            <span className="text-secondary-600 mr-1">Magnitude Scale:</span>
            <div className="flex items-center space-x-1">
              <div className="w-4 h-4 bg-blue-100 rounded"></div>
              <div className="w-4 h-4 bg-blue-300 rounded"></div>
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <div className="w-4 h-4 bg-blue-600 rounded"></div>
            </div>
            <div className="ml-1 flex space-x-1">
              <span>Low</span>
              <span>—</span>
              <span>High</span>
            </div>
          </div>
          <Button 
            variant="link" 
            size="sm" 
            className="text-xs text-primary-600 p-0 h-auto"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? "Show less paths" : "Show all paths"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
