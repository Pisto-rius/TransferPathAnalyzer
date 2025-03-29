import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { ControlPanel } from "@/components/dashboard/control-panel";
import { TransferFunctionHeatmap } from "@/components/dashboard/transfer-function-heatmap";
import { useTpaData, useComputeTpa } from "@/hooks/use-tpa-data";
import { TpaComputationParams } from "@/types/tpa";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { NoDataEmptyState } from "@/components/ui/empty-state";
import { Download, SlidersHorizontal } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { getFrequenciesFromTransferFunction, getPathsFromTransferFunction } from "@/lib/tpa-utils";

export default function TransferFunctions() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [computeParams, setComputeParams] = useState<TpaComputationParams>({
    frequencyBand: "All Frequencies",
    target: "Driver's Ear"
  });
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [displayType, setDisplayType] = useState("heatmap"); // heatmap or frequency
  
  const { data: tpaData, isLoading } = useTpaData(computeParams);
  const computeTpaMutation = useComputeTpa();
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  const handleUpdateAnalysis = (params: TpaComputationParams) => {
    setComputeParams(params);
    computeTpaMutation.mutate(params);
  };
  
  const formatFrequencyData = () => {
    if (!tpaData?.transferFunctions || !selectedPath) return [];
    
    const pathData = tpaData.transferFunctions[selectedPath];
    if (!pathData) return [];
    
    return Object.entries(pathData).map(([freq, value]) => ({
      frequency: freq,
      amplitude: value
    }));
  };
  
  const pathOptions = tpaData?.transferFunctions 
    ? getPathsFromTransferFunction(tpaData.transferFunctions) 
    : [];
    
  if (pathOptions.length > 0 && !selectedPath) {
    setSelectedPath(pathOptions[0]);
  }
  
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header toggleSidebar={toggleSidebar} />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={sidebarOpen} />
        
        <main className="flex-1 flex flex-col overflow-hidden bg-secondary-50">
          <ControlPanel 
            defaultFrequencyBand={computeParams.frequencyBand as any}
            defaultTarget={computeParams.target as any}
            projectName="Engine Vibration Study"
            projectDescription="Transfer Function Analysis"
            onUpdate={handleUpdateAnalysis}
            isLoading={isLoading || computeTpaMutation.isPending}
          />
          
          <div className="flex-1 overflow-y-auto p-4">
            <Card className="mb-4">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Transfer Function Analysis</CardTitle>
                    <CardDescription>View and analyze transfer paths between sources and receivers</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Select value={displayType} onValueChange={setDisplayType}>
                      <SelectTrigger className="h-8 w-[150px]">
                        <SelectValue placeholder="View Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="heatmap">Heatmap View</SelectItem>
                        <SelectItem value="frequency">Frequency Response</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="magnitude">
                  <TabsList>
                    <TabsTrigger value="magnitude">Magnitude</TabsTrigger>
                    <TabsTrigger value="phase">Phase</TabsTrigger>
                    <TabsTrigger value="coherence">Coherence</TabsTrigger>
                  </TabsList>
                  <TabsContent value="magnitude" className="pt-4">
                    {displayType === "heatmap" ? (
                      <div className="h-[500px]">
                        <TransferFunctionHeatmap 
                          data={tpaData?.transferFunctions} 
                          isLoading={isLoading || computeTpaMutation.isPending} 
                        />
                      </div>
                    ) : (
                      <div className="h-[500px]">
                        <div className="p-4 bg-white rounded-lg border border-secondary-200 h-full">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-semibold text-secondary-700">Frequency Response</h3>
                            <div className="flex items-center space-x-2">
                              {pathOptions.length > 0 && (
                                <Select value={selectedPath || ""} onValueChange={setSelectedPath}>
                                  <SelectTrigger className="h-8 w-[200px]">
                                    <SelectValue placeholder="Select Path" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {pathOptions.map((path) => (
                                      <SelectItem key={path} value={path}>
                                        {path}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                              <Button variant="outline" size="sm" className="h-8">
                                <SlidersHorizontal className="h-3 w-3 mr-1" />
                                Options
                              </Button>
                            </div>
                          </div>
                          
                          {!tpaData?.transferFunctions ? (
                            <NoDataEmptyState />
                          ) : (
                            <ResponsiveContainer width="100%" height="85%">
                              <LineChart
                                data={formatFrequencyData()}
                                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis 
                                  dataKey="frequency" 
                                  label={{ value: 'Frequency', position: 'insideBottomRight', offset: -10 }}
                                />
                                <YAxis 
                                  label={{ value: 'Amplitude', angle: -90, position: 'insideLeft' }}
                                />
                                <Tooltip formatter={(value: number) => [`${value.toFixed(3)}`, 'Amplitude']} />
                                <Legend />
                                <Line 
                                  type="monotone" 
                                  dataKey="amplitude" 
                                  stroke="#3b82f6" 
                                  strokeWidth={2}
                                  name={selectedPath || "Path"} 
                                  dot={{ r: 3 }}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          )}
                        </div>
                      </div>
                    )}
                  </TabsContent>
                  <TabsContent value="phase">
                    <div className="py-10 text-center text-secondary-500">
                      Phase information will be displayed here
                    </div>
                  </TabsContent>
                  <TabsContent value="coherence">
                    <div className="py-10 text-center text-secondary-500">
                      Coherence information will be displayed here
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Path Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  {!tpaData?.transferFunctions ? (
                    <NoDataEmptyState />
                  ) : (
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            type="category"
                            dataKey="frequency"
                            allowDuplicatedCategory={false}
                          />
                          <YAxis label={{ value: 'Amplitude', angle: -90, position: 'insideLeft' }} />
                          <Tooltip />
                          <Legend />
                          {pathOptions.slice(0, 4).map((path, index) => {
                            const data = Object.entries(tpaData.transferFunctions[path] || {}).map(([freq, value]) => ({
                              frequency: freq,
                              [path]: value
                            }));
                            
                            return (
                              <Line 
                                key={path}
                                data={data}
                                type="monotone" 
                                dataKey={path} 
                                stroke={['#3b82f6', '#ef4444', '#34d399', '#a855f7'][index]} 
                                dot={false}
                              />
                            );
                          })}
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Transfer Path Efficiency</CardTitle>
                </CardHeader>
                <CardContent>
                  {!tpaData?.transferFunctions ? (
                    <NoDataEmptyState />
                  ) : (
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={[
                            { frequency: "125Hz", efficiency: 78 },
                            { frequency: "250Hz", efficiency: 82 },
                            { frequency: "500Hz", efficiency: 91 },
                            { frequency: "1kHz", efficiency: 87 },
                            { frequency: "2kHz", efficiency: 75 },
                            { frequency: "4kHz", efficiency: 68 },
                            { frequency: "8kHz", efficiency: 62 },
                          ]}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="frequency" />
                          <YAxis 
                            domain={[0, 100]} 
                            label={{ value: 'Efficiency (%)', angle: -90, position: 'insideLeft' }}
                          />
                          <Tooltip formatter={(value: number) => [`${value}%`, 'Efficiency']} />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="efficiency" 
                            stroke="#f59e0b" 
                            strokeWidth={2}
                            dot={{ r: 4 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
