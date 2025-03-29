import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import SourceContributions from "@/pages/source-contributions";
import TransferFunctions from "@/pages/transfer-functions";
import SystemResponse from "@/pages/system-response";
import DataManagement from "@/pages/data-management";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/source-contributions" component={SourceContributions} />
      <Route path="/transfer-functions" component={TransferFunctions} />
      <Route path="/system-response" component={SystemResponse} />
      <Route path="/data-management" component={DataManagement} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
