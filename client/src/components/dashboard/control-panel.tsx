import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { FrequencyBand, Target, TpaComputationParams } from "@/types/tpa";

interface ControlPanelProps {
  defaultFrequencyBand?: FrequencyBand;
  defaultTarget?: Target;
  projectName?: string;
  projectDescription?: string;
  onUpdate?: (params: TpaComputationParams) => void;
  isLoading?: boolean;
}

export function ControlPanel({
  defaultFrequencyBand = "All Frequencies",
  defaultTarget = "Driver's Ear",
  projectName = "Engine Vibration Study",
  projectDescription = "Vehicle XYZ",
  onUpdate,
  isLoading = false
}: ControlPanelProps) {
  const [frequencyBand, setFrequencyBand] = useState<string>(defaultFrequencyBand);
  const [target, setTarget] = useState<string>(defaultTarget);
  
  const handleUpdate = () => {
    if (onUpdate) {
      onUpdate({
        frequencyBand,
        target
      });
    }
  };
  
  const frequencyBands: FrequencyBand[] = [
    "All Frequencies",
    "20-100 Hz",
    "100-500 Hz",
    "500-2000 Hz"
  ];
  
  const targets: Target[] = [
    "Driver's Ear",
    "Passenger Seat",
    "Rear Cabin"
  ];
  
  return (
    <section className="bg-white border-b border-secondary-200 p-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-secondary-800">Dashboard Overview</h2>
          <p className="text-sm text-secondary-500">{projectName} - {projectDescription}</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center">
            <span className="text-sm font-medium text-secondary-700 mr-2">Frequency Band:</span>
            <Select value={frequencyBand} onValueChange={setFrequencyBand}>
              <SelectTrigger className="bg-white border border-secondary-300 rounded-md text-sm py-1 h-8 w-[180px]">
                <SelectValue placeholder="All Frequencies" />
              </SelectTrigger>
              <SelectContent>
                {frequencyBands.map((band) => (
                  <SelectItem key={band} value={band}>
                    {band}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center">
            <span className="text-sm font-medium text-secondary-700 mr-2">Target:</span>
            <Select value={target} onValueChange={setTarget}>
              <SelectTrigger className="bg-white border border-secondary-300 rounded-md text-sm py-1 h-8 w-[180px]">
                <SelectValue placeholder="Driver's Ear" />
              </SelectTrigger>
              <SelectContent>
                {targets.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            onClick={handleUpdate}
            disabled={isLoading}
            className="bg-primary-600 hover:bg-primary-700 text-white"
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? "Updating..." : "Update Analysis"}
          </Button>
        </div>
      </div>
    </section>
  );
}
