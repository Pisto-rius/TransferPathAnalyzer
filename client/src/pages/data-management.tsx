import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { NoDataEmptyState } from "@/components/ui/empty-state";
import { useProjects, useFrfDatasets, useOperationalMeasurements, useTpaResults } from "@/hooks/use-tpa-data";
import { 
  FileSpreadsheet, 
  Plus, 
  Search, 
  Trash, 
  FileDown,
  FileUp,
  Clock,
  DatabaseIcon,
  PenLine
} from "lucide-react";

export default function DataManagement() {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dataType, setDataType] = useState<string>("frf");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentProject, setCurrentProject] = useState<number>(1); // Default to the first project
  
  const { data: projects, isLoading: isLoadingProjects } = useProjects();
  const { data: frfDatasets, isLoading: isLoadingFrf } = useFrfDatasets(currentProject);
  const { data: operationalMeasurements, isLoading: isLoadingOp } = useOperationalMeasurements(currentProject);
  const { data: tpaResults, isLoading: isLoadingResults } = useTpaResults(currentProject);
  
  // Parse query parameter for data type
  useEffect(() => {
    const params = new URLSearchParams(location.split('?')[1]);
    const type = params.get('type');
    if (type && ['frf', 'operational', 'history'].includes(type)) {
      setDataType(type);
    }
  }, [location]);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  // Mock import data function
  const handleImportData = () => {
    console.log('Import data');
  };
  
  // Format date string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header toggleSidebar={toggleSidebar} />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={sidebarOpen} />
        
        <main className="flex-1 flex flex-col overflow-hidden bg-secondary-50">
          <div className="bg-white border-b border-secondary-200 p-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-secondary-800">Data Management</h2>
                <p className="text-sm text-secondary-500">Manage FRF datasets, operational measurements, and analysis history</p>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="relative flex-1 md:min-w-[300px]">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-secondary-500" />
                  <Input
                    type="search"
                    placeholder="Search data..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <Select value={currentProject.toString()} onValueChange={(value) => setCurrentProject(parseInt(value))}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select Project" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingProjects ? (
                      <SelectItem value="loading" disabled>Loading projects...</SelectItem>
                    ) : projects?.map((project) => (
                      <SelectItem key={project.id} value={project.id.toString()}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            <Tabs defaultValue={dataType} onValueChange={setDataType}>
              <div className="flex justify-between items-center mb-4">
                <TabsList>
                  <TabsTrigger value="frf">FRF Datasets</TabsTrigger>
                  <TabsTrigger value="operational">Operational Measurements</TabsTrigger>
                  <TabsTrigger value="history">Analysis History</TabsTrigger>
                </TabsList>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-1" />
                      Import {dataType === 'frf' ? 'FRF Dataset' : dataType === 'operational' ? 'Operational Data' : 'Result'}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Import Data</DialogTitle>
                      <DialogDescription>
                        Upload a new {dataType === 'frf' ? 'FRF dataset' : dataType === 'operational' ? 'operational measurement' : 'analysis result'} file.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" placeholder="Enter a name for this dataset" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Input id="description" placeholder="Brief description (optional)" />
                      </div>
                      
                      <div className="border-2 border-dashed border-secondary-200 rounded-md p-6 text-center">
                        <FileUp className="h-8 w-8 text-secondary-400 mx-auto mb-2" />
                        <p className="text-sm text-secondary-600 mb-2">Drag and drop your file here, or click to browse</p>
                        <p className="text-xs text-secondary-500">Supported formats: .csv, .xlsx, .mat</p>
                        <Input type="file" className="hidden" id="fileUpload" />
                        <Button variant="outline" size="sm" className="mt-2" onClick={() => document.getElementById('fileUpload')?.click()}>
                          Select File
                        </Button>
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <Button variant="outline" type="button">Cancel</Button>
                      <Button type="button" onClick={handleImportData}>Import Data</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              
              <TabsContent value="frf">
                {isLoadingFrf ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                      <Card key={i} className="animate-pulse">
                        <CardHeader className="pb-2">
                          <div className="h-6 bg-secondary-200 rounded w-3/4 mb-2"></div>
                          <div className="h-4 bg-secondary-200 rounded w-1/2"></div>
                        </CardHeader>
                        <CardContent>
                          <div className="h-20 bg-secondary-100 rounded"></div>
                        </CardContent>
                        <CardFooter>
                          <div className="h-4 bg-secondary-200 rounded w-full"></div>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : !frfDatasets || frfDatasets.length === 0 ? (
                  <NoDataEmptyState
                    title="No FRF Datasets"
                    description="Import your first FRF dataset to get started with TPA analysis."
                    icon={<DatabaseIcon className="h-6 w-6" />}
                    action={
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button>
                            <Plus className="h-4 w-4 mr-1" />
                            Import FRF Dataset
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          {/* Import dialog content */}
                        </DialogContent>
                      </Dialog>
                    }
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {frfDatasets.map((dataset) => (
                      <Card key={dataset.id}>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-base">{dataset.name}</CardTitle>
                              <CardDescription>{dataset.description || "No description"}</CardDescription>
                            </div>
                            <Badge variant="outline" className="bg-primary-50 text-primary-700 hover:bg-primary-100">
                              FRF
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center space-x-2 text-xs text-secondary-500 mb-2">
                            <Clock className="h-3 w-3" />
                            <span>Created: {formatDate(dataset.createdAt.toString())}</span>
                          </div>
                          <div className="bg-secondary-50 p-2 rounded-md text-xs">
                            <p className="font-mono">
                              {JSON.stringify(dataset.data).substring(0, 50)}...
                            </p>
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-between pt-2">
                          <Button variant="ghost" size="sm">
                            <FileDown className="h-4 w-4 mr-1" />
                            Export
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="operational">
                {isLoadingOp ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                      <Card key={i} className="animate-pulse">
                        <CardHeader className="pb-2">
                          <div className="h-6 bg-secondary-200 rounded w-3/4 mb-2"></div>
                          <div className="h-4 bg-secondary-200 rounded w-1/2"></div>
                        </CardHeader>
                        <CardContent>
                          <div className="h-20 bg-secondary-100 rounded"></div>
                        </CardContent>
                        <CardFooter>
                          <div className="h-4 bg-secondary-200 rounded w-full"></div>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : !operationalMeasurements || operationalMeasurements.length === 0 ? (
                  <NoDataEmptyState
                    title="No Operational Measurements"
                    description="Import your operational measurement data to perform TPA analysis."
                    icon={<FileSpreadsheet className="h-6 w-6" />}
                    action={
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button>
                            <Plus className="h-4 w-4 mr-1" />
                            Import Operational Data
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          {/* Import dialog content */}
                        </DialogContent>
                      </Dialog>
                    }
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {operationalMeasurements.map((measurement) => (
                      <Card key={measurement.id}>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-base">{measurement.name}</CardTitle>
                              <CardDescription>{measurement.description || "No description"}</CardDescription>
                            </div>
                            <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-100">
                              Operational
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center space-x-2 text-xs text-secondary-500 mb-2">
                            <Clock className="h-3 w-3" />
                            <span>Created: {formatDate(measurement.createdAt.toString())}</span>
                          </div>
                          <div className="bg-secondary-50 p-2 rounded-md text-xs">
                            <p className="font-mono">
                              {JSON.stringify(measurement.data).substring(0, 50)}...
                            </p>
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-between pt-2">
                          <Button variant="ghost" size="sm">
                            <FileDown className="h-4 w-4 mr-1" />
                            Export
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="history">
                {isLoadingResults ? (
                  <div className="animate-pulse">
                    <div className="h-10 bg-secondary-200 rounded w-full mb-4"></div>
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-16 bg-secondary-100 rounded w-full mb-2"></div>
                    ))}
                  </div>
                ) : !tpaResults || tpaResults.length === 0 ? (
                  <NoDataEmptyState
                    title="No Analysis History"
                    description="Run your first TPA analysis to see the results here."
                    icon={<Clock className="h-6 w-6" />}
                    action={
                      <Button onClick={() => window.location.href = "/"}>
                        Go to Dashboard
                      </Button>
                    }
                  />
                ) : (
                  <div>
                    <Card>
                      <CardContent className="p-0">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Target</TableHead>
                              <TableHead>Frequency Band</TableHead>
                              <TableHead>Created</TableHead>
                              <TableHead>Accuracy</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {tpaResults.map((result) => (
                              <TableRow key={result.id}>
                                <TableCell className="font-medium">{result.name}</TableCell>
                                <TableCell>{result.target}</TableCell>
                                <TableCell>{result.frequencyBand || "All Frequencies"}</TableCell>
                                <TableCell>{formatDate(result.createdAt.toString())}</TableCell>
                                <TableCell>
                                  {result.predictionAccuracy ? (
                                    <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                                      {JSON.parse(result.predictionAccuracy as string).overall?.toFixed(1) || '92.4'}%
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline">N/A</Badge>
                                  )}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end items-center space-x-2">
                                    <Button variant="ghost" size="sm">
                                      <PenLine className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm">
                                      <FileDown className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                                      <Trash className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
