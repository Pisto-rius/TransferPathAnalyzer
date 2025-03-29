import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Download, 
  ZoomIn,
  ZoomOut,
  RefreshCw
} from "lucide-react";
import { generateFrequencyResponseData } from "@/lib/tpa-utils";
import { NoDataEmptyState } from "@/components/ui/empty-state";

// Import Recharts components
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

interface FrequencyResponseProps {
  // In real application we'd pass in the actual data
  // For now we'll generate demo data internally
  isLoading?: boolean;
}

export function FrequencyResponse({ isLoading = false }: FrequencyResponseProps) {
  const [responseData, setResponseData] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [isZoomed, setIsZoomed] = useState(false);
  
  useEffect(() => {
    // Generate some frequency response data for demonstration
    if (!isLoading) {
      const data = generateFrequencyResponseData();
      setResponseData(data);
      
      // Format data for Recharts
      const formatted = data.frequencies.map((freq: number, index: number) => ({
        frequency: freq,
        measured: data.measured[index],
        predicted: data.predicted[index],
        threshold: data.threshold[index]
      }));
      
      setChartData(formatted);
    }
  }, [isLoading]);
  
  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
  };
  
  const refreshData = () => {
    const data = generateFrequencyResponseData();
    setResponseData(data);
    
    const formatted = data.frequencies.map((freq: number, index: number) => ({
      frequency: freq,
      measured: data.measured[index],
      predicted: data.predicted[index],
      threshold: data.threshold[index]
    }));
    
    setChartData(formatted);
  };
  
  if (isLoading) {
    return (
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-secondary-700">Frequency Response</h3>
          </div>
          <div className="h-64 w-full bg-secondary-50 animate-pulse rounded-md"></div>
        </CardContent>
      </Card>
    );
  }

  if (!responseData || !chartData.length) {
    return (
      <NoDataEmptyState 
        title="No Frequency Response Data"
        description="Frequency response data is not available. Please run an analysis to see the response curves."
        action={
          <Button variant="outline" size="sm" onClick={refreshData}>
            <RefreshCw className="h-3 w-3 mr-1" />
            Generate Data
          </Button>
        }
      />
    );
  }

  return (
    <Card className="shadow-sm border border-secondary-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-secondary-700">Frequency Response</h3>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" className="h-7 px-2">
              <Download className="h-3 w-3 mr-1" />
              Export
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              className="h-7 w-7" 
              onClick={toggleZoom}
            >
              {isZoomed ? <ZoomOut className="h-3 w-3" /> : <ZoomIn className="h-3 w-3" />}
            </Button>
          </div>
        </div>
        
        <div className={`chart-container ${isZoomed ? 'h-96' : 'h-64'}`}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="frequency" 
                type="number"
                scale="log"
                domain={['auto', 'auto']}
                tickFormatter={(value) => {
                  if (value >= 1000) {
                    return `${(value / 1000).toFixed(0)}k`;
                  }
                  return value.toString();
                }}
                label={{ value: 'Frequency (Hz)', position: 'insideBottomRight', offset: -5 }}
              />
              <YAxis 
                label={{ value: 'Level (dB)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                formatter={(value: number) => [`${value.toFixed(1)} dB`, '']}
                labelFormatter={(label) => `Frequency: ${label >= 1000 ? `${(label / 1000).toFixed(1)} kHz` : `${label} Hz`}`}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="measured" 
                stroke="#3b82f6" 
                dot={false} 
                activeDot={{ r: 5 }}
                name="Measured"
              />
              <Line 
                type="monotone" 
                dataKey="predicted" 
                stroke="#f59e0b" 
                dot={false} 
                activeDot={{ r: 5 }}
                name="Predicted"
              />
              <Line 
                type="monotone" 
                dataKey="threshold" 
                stroke="#94a3b8" 
                dot={false}
                strokeDasharray="5 5"
                name="Threshold"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-2 flex items-center text-xs text-secondary-600">
          <div className="flex items-center mr-3">
            <span className="inline-block w-3 h-3 bg-primary-500 rounded-full mr-1"></span>
            <span>Measured</span>
          </div>
          <div className="flex items-center mr-3">
            <span className="inline-block w-3 h-3 bg-[#f59e0b] rounded-full mr-1"></span>
            <span>Predicted</span>
          </div>
          <div className="flex items-center">
            <span className="inline-block w-3 h-3 bg-secondary-400 rounded-full mr-1"></span>
            <span>Threshold</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
