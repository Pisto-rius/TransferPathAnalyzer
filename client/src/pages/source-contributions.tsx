import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { ControlPanel } from "@/components/dashboard/control-panel";
import { useTpaData, useComputeTpa } from "@/hooks/use-tpa-data";
import { TpaComputationParams } from "@/types/tpa";
import { SourceContributions as SourceContributionsComponent } from "@/components/dashboard/source-contributions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NoDataEmptyState } from "@/components/ui/empty-state";
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { sourceColors } from "@/lib/tpa-utils";

export default function SourceContributions() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [computeParams, setComputeParams] = useState<TpaComputationParams>({
    frequencyBand: "All Frequencies",
    target: "Driver's Ear"
  });
  const [viewType, setViewType] = useState("bar"); // 'bar', 'pie', 'ranked'
  
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
            projectName="Engine Vibration Study"
            projectDescription="Source Contribution Analysis"
            onUpdate={handleUpdateAnalysis}
            isLoading={isLoading || computeTpaMutation.isPending}
          />
          
          <div className="flex-1 overflow-y-auto p-4">
            <Card className="mb-4">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle>Source Contributions Analysis</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Select value={viewType} onValueChange={setViewType}>
                      <SelectTrigger className="h-8 w-[150px]">
                        <SelectValue placeholder="View Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bar">Bar Chart</SelectItem>
                        <SelectItem value="pie">Pie Chart</SelectItem>
                        <SelectItem value="ranked">Ranked List</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="all">
                  <TabsList>
                    <TabsTrigger value="all">All Sources</TabsTrigger>
                    <TabsTrigger value="engine">Engine</TabsTrigger>
                    <TabsTrigger value="transmission">Transmission</TabsTrigger>
                    <TabsTrigger value="suspension">Suspension</TabsTrigger>
                  </TabsList>
                  <TabsContent value="all" className="pt-4">
                    {viewType === "bar" ? (
                      <div className="h-[400px]">
                        <SourceContributionsComponent 
                          data={tpaData?.contributionData} 
                          isLoading={isLoading || computeTpaMutation.isPending} 
                        />
                      </div>
                    ) : viewType === "pie" ? (
                      <div className="h-[400px]">
                        {!tpaData?.contributionData ? (
                          <NoDataEmptyState />
                        ) : (
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={tpaData.contributionData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={150}
                                fill="#8884d8"
                                dataKey="value"
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                              >
                                {tpaData.contributionData.map((entry, index) => (
                                  <Cell 
                                    key={`cell-${index}`} 
                                    fill={sourceColors[entry.name as keyof typeof sourceColors] || "#6366f1"} 
                                  />
                                ))}
                              </Pie>
                              <Tooltip formatter={(value: number) => [`${value.toFixed(1)} dB`, 'Contribution']} />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        )}
                      </div>
                    ) : (
                      <div className="h-[400px] overflow-y-auto">
                        {!tpaData?.contributionData ? (
                          <NoDataEmptyState />
                        ) : (
                          <div className="space-y-3">
                            {tpaData.contributionData
                              .sort((a, b) => b.value - a.value)
                              .map((item, index) => (
                                <div key={index} className="bg-white p-3 rounded-md border border-secondary-200">
                                  <div className="flex justify-between items-center mb-1">
                                    <div className="flex items-center">
                                      <div 
                                        className="w-3 h-3 rounded-full mr-2" 
                                        style={{ backgroundColor: sourceColors[item.name as keyof typeof sourceColors] || "#6366f1" }}
                                      ></div>
                                      <span className="font-medium">{item.name}</span>
                                    </div>
                                    <span className="font-semibold">{item.value.toFixed(1)} dB</span>
                                  </div>
                                  <div className="w-full bg-secondary-100 rounded-full h-2">
                                    <div 
                                      className="h-2 rounded-full" 
                                      style={{ 
                                        width: `${(item.value / Math.max(...tpaData.contributionData.map(d => d.value))) * 100}%`,
                                        backgroundColor: sourceColors[item.name as keyof typeof sourceColors] || "#6366f1"
                                      }}
                                    ></div>
                                  </div>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    )}
                  </TabsContent>
                  <TabsContent value="engine">
                    <div className="py-10 text-center text-secondary-500">
                      Engine component breakdown will be displayed here
                    </div>
                  </TabsContent>
                  <TabsContent value="transmission">
                    <div className="py-10 text-center text-secondary-500">
                      Transmission component breakdown will be displayed here
                    </div>
                  </TabsContent>
                  <TabsContent value="suspension">
                    <div className="py-10 text-center text-secondary-500">
                      Suspension component breakdown will be displayed here
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Frequency Contribution Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  {!tpaData?.contributionData ? (
                    <NoDataEmptyState />
                  ) : (
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={[
                            { name: 'Low (20-200Hz)', Engine: 25, Transmission: 15, Exhaust: 10, Suspension: 5 },
                            { name: 'Mid (200-1kHz)', Engine: 15, Transmission: 20, Exhaust: 15, Suspension: 12 },
                            { name: 'High (1k-10kHz)', Engine: 10, Transmission: 12, Exhaust: 25, Suspension: 18 },
                          ]}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis label={{ value: 'Contribution (dB)', angle: -90, position: 'insideLeft' }} />
                          <Tooltip formatter={(value: number) => [`${value.toFixed(1)} dB`, '']} />
                          <Legend />
                          <Bar dataKey="Engine" stackId="a" fill="#3b82f6" />
                          <Bar dataKey="Transmission" stackId="a" fill="#ef4444" />
                          <Bar dataKey="Exhaust" stackId="a" fill="#34d399" />
                          <Bar dataKey="Suspension" stackId="a" fill="#a855f7" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Contribution Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  {!tpaData?.contributionData ? (
                    <NoDataEmptyState />
                  ) : (
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          layout="vertical"
                          data={tpaData.contributionData.slice(0, 5).sort((a, b) => b.value - a.value)}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="name" type="category" width={100} />
                          <Tooltip formatter={(value: number) => [`${value.toFixed(1)} dB`, 'Contribution']} />
                          <Bar dataKey="value" name="Contribution">
                            {tpaData.contributionData.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={sourceColors[entry.name as keyof typeof sourceColors] || "#6366f1"} 
                              />
                            ))}
                          </Bar>
                        </BarChart>
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
