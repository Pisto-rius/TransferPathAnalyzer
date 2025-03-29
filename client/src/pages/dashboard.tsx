import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { ControlPanel } from "@/components/dashboard/control-panel";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { FrequencyResponse } from "@/components/dashboard/frequency-response";
import { SourceContributions } from "@/components/dashboard/source-contributions";
import { SvdAnalysis } from "@/components/dashboard/svd-analysis";
import { TransferFunctionHeatmap } from "@/components/dashboard/transfer-function-heatmap";
import { PredictionAccuracy } from "@/components/dashboard/prediction-accuracy";
import { useComputeTpa } from "@/hooks/use-tpa-data";
import { TpaComputationParams } from "@/types/tpa";
import { useTpaData } from "@/hooks/use-tpa-data";

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [computeParams, setComputeParams] = useState<TpaComputationParams>({
    frequencyBand: "All Frequencies",
    target: "Driver's Ear"
  });
  
  const { data: tpaData, isLoading } = useTpaData(computeParams);
  const computeTpaMutation = useComputeTpa();
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  const handleUpdateAnalysis = (params: TpaComputationParams) => {
    setComputeParams(params);
    computeTpaMutation.mutate(params);
  };
  
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header toggleSidebar={toggleSidebar} />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={sidebarOpen} />
        
        <main className="flex-1 flex flex-col overflow-hidden bg-secondary-50">
          <ControlPanel 
            defaultFrequencyBand={computeParams.frequencyBand as any}
            defaultTarget={computeParams.target as any}
            onUpdate={handleUpdateAnalysis}
            isLoading={isLoading || computeTpaMutation.isPending}
          />
          
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
              <KpiCards 
                data={tpaData?.kpis} 
                isLoading={isLoading || computeTpaMutation.isPending} 
              />
              
              <FrequencyResponse 
                isLoading={isLoading || computeTpaMutation.isPending} 
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
              <div className="lg:col-span-2">
                <SourceContributions 
                  data={tpaData?.contributionData} 
                  isLoading={isLoading || computeTpaMutation.isPending} 
                />
              </div>
              
              <SvdAnalysis 
                data={tpaData?.svdAnalysis} 
                isLoading={isLoading || computeTpaMutation.isPending} 
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <TransferFunctionHeatmap 
                  data={tpaData?.transferFunctions} 
                  isLoading={isLoading || computeTpaMutation.isPending} 
                />
              </div>
              
              <PredictionAccuracy 
                data={tpaData?.predictionAccuracy} 
                isLoading={isLoading || computeTpaMutation.isPending} 
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
