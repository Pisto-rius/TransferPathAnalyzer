import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { ControlPanel } from "@/components/dashboard/control-panel";
import { FrequencyResponse } from "@/components/dashboard/frequency-response";
import { PredictionAccuracy } from "@/components/dashboard/prediction-accuracy";
import { useTpaData, useComputeTpa } from "@/hooks/use-tpa-data";
import { TpaComputationParams } from "@/types/tpa";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { NoDataEmptyState } from "@/components/ui/empty-state";
import { Download, Save } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Area, AreaChart } from "recharts";

export default function SystemResponse() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [computeParams, setComputeParams] = useState<TpaComputationParams>({
    frequencyBand: "All Frequencies",
    target: "Driver's Ear"
  });
  const [analysisType, setAnalysisType] = useState("single-point");
  
  const { data: tpaData, isLoading } = useTpaData(computeParams);
  const computeTpaMutation = useComputeTpa();
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  const handleUpdateAnalysis = (params: TpaComputationParams) => {
    setComputeParams(params);
    computeTpaMutation.mutate(params);
  };
  
  // Generate waterfall data for demonstration
  const generateWaterfallData = () => {
    const data = [];
    for (let rpm = 1000; rpm <= 6000; rpm += 500) {
      let item: any = { rpm };
      for (let freq = 125; freq <= 1000; freq *= 2) {
        // Generate a value with peaks at specific RPMs depending on frequency
        const peakRpm = 1000 + (freq * 5);
        const distance = Math.abs(rpm - peakRpm);
        const value = Math.max(0, 80 - (distance / 100));
        item[`${freq}Hz`] = value;
      }
      data.push(item);
    }
    return data;
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
            projectDescription="System Response Analysis"
            onUpdate={handleUpdateAnalysis}
            isLoading={isLoading || computeTpaMutation.isPending}
          />
          
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
              <div className="h-full">
                <FrequencyResponse 
                  isLoading={isLoading || computeTpaMutation.isPending} 
                />
              </div>
              <div className="h-full">
                <PredictionAccuracy 
                  data={tpaData?.predictionAccuracy} 
                  isLoading={isLoading || computeTpaMutation.isPending} 
                />
              </div>
            </div>
            
            <Card className="mb-4">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>System Response Analysis</CardTitle>
                    <CardDescription>Analyze the system's response across different conditions</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Select value={analysisType} onValueChange={setAnalysisType}>
                      <SelectTrigger className="h-8 w-[180px]">
                        <SelectValue placeholder="Analysis Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single-point">Single Point</SelectItem>
                        <SelectItem value="multi-point">Multi-Point</SelectItem>
                        <SelectItem value="order-tracking">Order Tracking</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm">
                      <Save className="h-4 w-4 mr-1" />
                      Save Analysis
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="time">
                  <TabsList>
                    <TabsTrigger value="time">Time Domain</TabsTrigger>
                    <TabsTrigger value="frequency">Frequency Domain</TabsTrigger>
                    <TabsTrigger value="order">Order Domain</TabsTrigger>
                  </TabsList>
                  <TabsContent value="time" className="pt-4">
                    <div className="h-[400px]">
                      <Card>
                        <CardHeader>
                          <CardTitle>Impulse Response</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={300}>
                            <LineChart
                              data={Array(100).fill(0).map((_, i) => ({
                                time: i,
                                amplitude: Math.exp(-i/20) * Math.cos(i/2) * 50 * (i < 5 ? i/5 : 1)
                              }))}
                              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis 
                                dataKey="time"
                                label={{ value: 'Time (ms)', position: 'insideBottomRight', offset: -10 }} 
                              />
                              <YAxis 
                                label={{ value: 'Amplitude', angle: -90, position: 'insideLeft' }}
                              />
                              <Tooltip formatter={(value: number) => [`${value.toFixed(2)}`, 'Amplitude']} />
                              <Line 
                                type="monotone" 
                                dataKey="amplitude" 
                                stroke="#3b82f6" 
                                dot={false}
                                isAnimationActive={false}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                  <TabsContent value="frequency" className="pt-4">
                    <div className="h-[400px]">
                      <Card>
                        <CardHeader>
                          <CardTitle>Frequency Response</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={300}>
                            <AreaChart
                              data={[
                                { frequency: "20Hz", measured: 45, predicted: 43 },
                                { frequency: "31.5Hz", measured: 48, predicted: 46 },
                                { frequency: "50Hz", measured: 65, predicted: 62 },
                                { frequency: "80Hz", measured: 73, predicted: 75 },
                                { frequency: "125Hz", measured: 68, predicted: 70 },
                                { frequency: "200Hz", measured: 60, predicted: 63 },
                                { frequency: "315Hz", measured: 45, predicted: 48 },
                                { frequency: "500Hz", measured: 50, predicted: 53 },
                                { frequency: "800Hz", measured: 55, predicted: 58 },
                                { frequency: "1.25kHz", measured: 45, predicted: 47 },
                                { frequency: "2kHz", measured: 38, predicted: 40 },
                                { frequency: "3.15kHz", measured: 35, predicted: 33 },
                                { frequency: "5kHz", measured: 30, predicted: 28 },
                                { frequency: "8kHz", measured: 25, predicted: 23 },
                                { frequency: "12.5kHz", measured: 20, predicted: 18 },
                              ]}
                              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis 
                                dataKey="frequency"
                                tick={{ fontSize: 10 }}
                                interval={0}
                                angle={-45}
                                textAnchor="end"
                                height={50}
                              />
                              <YAxis 
                                label={{ value: 'dB', angle: -90, position: 'insideLeft' }}
                              />
                              <Tooltip />
                              <Legend />
                              <Area 
                                type="monotone" 
                                dataKey="measured" 
                                stroke="#3b82f6" 
                                fill="#3b82f680" 
                                name="Measured" 
                              />
                              <Area 
                                type="monotone" 
                                dataKey="predicted" 
                                stroke="#f59e0b" 
                                fill="#f59e0b80" 
                                name="Predicted" 
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                  <TabsContent value="order" className="pt-4">
                    <div className="h-[400px]">
                      <Card>
                        <CardHeader>
                          <CardTitle>RPM vs. Frequency Waterfall</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={300}>
                            <LineChart
                              data={generateWaterfallData()}
                              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis 
                                dataKey="rpm"
                                label={{ value: 'Engine Speed (RPM)', position: 'insideBottomRight', offset: -10 }} 
                              />
                              <YAxis 
                                label={{ value: 'Sound Pressure Level (dB)', angle: -90, position: 'insideLeft' }}
                              />
                              <Tooltip formatter={(value: number) => [`${value.toFixed(1)} dB`, '']} />
                              <Legend />
                              <Line 
                                type="monotone" 
                                dataKey="125Hz" 
                                stroke="#3b82f6" 
                                dot={false}
                                name="125 Hz"
                              />
                              <Line 
                                type="monotone" 
                                dataKey="250Hz" 
                                stroke="#ef4444" 
                                dot={false}
                                name="250 Hz"
                              />
                              <Line 
                                type="monotone" 
                                dataKey="500Hz" 
                                stroke="#34d399" 
                                dot={false}
                                name="500 Hz"
                              />
                              <Line 
                                type="monotone" 
                                dataKey="1000Hz" 
                                stroke="#a855f7" 
                                dot={false}
                                name="1000 Hz"
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Modal Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="py-10 text-center text-secondary-500">
                    Modal analysis visualization will be displayed here
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Damping Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={[
                          { frequency: "20Hz", damping: 2.1 },
                          { frequency: "31.5Hz", damping: 1.8 },
                          { frequency: "50Hz", damping: 1.5 },
                          { frequency: "80Hz", damping: 1.2 },
                          { frequency: "125Hz", damping: 1.1 },
                          { frequency: "200Hz", damping: 1.3 },
                          { frequency: "315Hz", damping: 1.6 },
                          { frequency: "500Hz", damping: 2.0 },
                          { frequency: "800Hz", damping: 2.3 },
                          { frequency: "1.25kHz", damping: 2.5 },
                          { frequency: "2kHz", damping: 2.8 },
                          { frequency: "3.15kHz", damping: 3.0 },
                          { frequency: "5kHz", damping: 3.2 },
                          { frequency: "8kHz", damping: 3.3 },
                        ]}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="frequency"
                          tick={{ fontSize: 8 }}
                          interval={1}
                        />
                        <YAxis 
                          label={{ value: '%', angle: -90, position: 'insideLeft', fontSize: 10, dx: -10 }}
                          tick={{ fontSize: 10 }}
                        />
                        <Tooltip formatter={(value: number) => [`${value.toFixed(1)}%`, 'Damping Ratio']} />
                        <Area
                          type="monotone"
                          dataKey="damping"
                          stroke="#3b82f6"
                          fill="#3b82f620"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Energy Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={[
                          { band: "Low", kinetic: 35, potential: 25, dissipated: 40 },
                          { band: "Mid", kinetic: 30, potential: 20, dissipated: 50 },
                          { band: "High", kinetic: 20, potential: 15, dissipated: 65 },
                        ]}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        stackOffset="expand"
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="band" />
                        <YAxis tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
                        <Tooltip formatter={(value: number) => [`${(value * 100).toFixed(1)}%`, '']} />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="kinetic"
                          stackId="1"
                          stroke="#3b82f6"
                          fill="#3b82f6"
                          name="Kinetic"
                        />
                        <Area
                          type="monotone"
                          dataKey="potential"
                          stackId="1"
                          stroke="#34d399"
                          fill="#34d399"
                          name="Potential"
                        />
                        <Area
                          type="monotone"
                          dataKey="dissipated"
                          stackId="1"
                          stroke="#f59e0b"
                          fill="#f59e0b"
                          name="Dissipated"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
