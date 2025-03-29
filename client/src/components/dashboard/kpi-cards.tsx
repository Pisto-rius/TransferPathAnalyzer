import { Card, CardContent } from "@/components/ui/card";
import { 
  Volume2,
  Pulse,
  WaveformIcon,
  ArrowDownToLine, 
  ArrowUpFromLine,
  Radar
} from "lucide-react";
import { KpiData } from "@/types/tpa";
import { formatSoundLevel, formatAcceleration, formatPercentage, formatFrequency } from "@/lib/tpa-utils";
import { NoDataEmptyState } from "@/components/ui/empty-state";

interface KpiCardsProps {
  data?: KpiData;
  isLoading?: boolean;
}

export function KpiCards({ data, isLoading = false }: KpiCardsProps) {
  if (isLoading) {
    return (
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold text-secondary-700 mb-3">Key Performance Indicators</h3>
          <div className="grid grid-cols-2 gap-4">
            {Array(4).fill(0).map((_, index) => (
              <div key={index} className="bg-secondary-50 rounded-md p-3 animate-pulse">
                <div className="h-4 bg-secondary-200 rounded w-2/3 mb-2"></div>
                <div className="h-6 bg-secondary-200 rounded w-1/2 mb-1"></div>
                <div className="h-3 bg-secondary-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <NoDataEmptyState 
        title="No KPI Data"
        description="KPI data is not available. Please run an analysis to see performance indicators."
      />
    );
  }

  return (
    <Card className="shadow-sm border border-secondary-200">
      <CardContent className="p-4">
        <h3 className="text-sm font-semibold text-secondary-700 mb-3">Key Performance Indicators</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-secondary-50 rounded-md p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-secondary-500">Overall Sound Pressure Level</span>
              <Volume2 className="h-4 w-4 text-primary-500" />
            </div>
            <div className="mt-1">
              <span className="text-xl font-semibold text-secondary-800">
                {formatSoundLevel(data.soundPressureLevel)}
              </span>
            </div>
            <div className="mt-1 flex items-center text-xs text-green-600">
              <ArrowDownToLine className="h-3 w-3 mr-1" />
              <span>3.2% lower than threshold</span>
            </div>
          </div>
          
          <div className="bg-secondary-50 rounded-md p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-secondary-500">Max Vibration Amplitude</span>
              <Pulse className="h-4 w-4 text-primary-500" />
            </div>
            <div className="mt-1">
              <span className="text-xl font-semibold text-secondary-800">
                {formatAcceleration(data.maxVibrationAmplitude)}
              </span>
            </div>
            <div className="mt-1 flex items-center text-xs text-red-600">
              <ArrowUpFromLine className="h-3 w-3 mr-1" />
              <span>5.7% above target</span>
            </div>
          </div>
          
          <div className="bg-secondary-50 rounded-md p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-secondary-500">Dominant Frequency</span>
              <WaveformIcon className="h-4 w-4 text-primary-500" />
            </div>
            <div className="mt-1">
              <span className="text-xl font-semibold text-secondary-800">
                {formatFrequency(data.dominantFrequency)}
              </span>
            </div>
            <div className="mt-1 flex items-center text-xs text-secondary-500">
              <span>Engine order: 2.0</span>
            </div>
          </div>
          
          <div className="bg-secondary-50 rounded-md p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-secondary-500">Transfer Efficiency</span>
              <Radar className="h-4 w-4 text-primary-500" />
            </div>
            <div className="mt-1">
              <span className="text-xl font-semibold text-secondary-800">
                {formatPercentage(data.transferEfficiency)}
              </span>
            </div>
            <div className="mt-1 flex items-center text-xs text-green-600">
              <ArrowUpFromLine className="h-3 w-3 mr-1" />
              <span>Optimal range</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
