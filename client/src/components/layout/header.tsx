import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Bell,
  FileUp,
  Menu,
  Search,
  Activity
} from "lucide-react";

interface HeaderProps {
  toggleSidebar: () => void;
}

export function Header({ toggleSidebar }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  
  return (
    <header className="bg-white border-b border-secondary-200 py-2 px-4 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden mr-2" 
          onClick={toggleSidebar}
          aria-label="Toggle Sidebar"
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        <div className="flex items-center space-x-2">
          <Activity className="h-6 w-6 text-primary-600" />
          <Link href="/">
            <a className="text-xl font-semibold text-secondary-800">TPA Tool</a>
          </Link>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="hidden md:flex items-center space-x-2 bg-secondary-50 rounded-md border border-secondary-200 py-1 px-3">
          <Search className="h-4 w-4 text-secondary-500" />
          <Input 
            type="text" 
            placeholder="Search analysis..." 
            className="bg-transparent border-none outline-none text-sm text-secondary-800 w-48 p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="bg-primary-50 text-primary-700 border-primary-100 hover:bg-primary-100"
        >
          <FileUp className="h-4 w-4 mr-1" />
          <span>Import Data</span>
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className="text-secondary-600 hover:bg-secondary-100"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
        </Button>
        
        <Avatar className="h-8 w-8 border-2 border-secondary-200">
          <AvatarFallback className="bg-primary-100 text-primary-700 text-sm">
            TU
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
