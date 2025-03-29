import { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  DatabaseIcon,
  FilePieChart,
  FileSpreadsheet,
  History,
  LayoutDashboard,
  Settings,
  SlidersHorizontal,
  UserCog,
  WaveformIcon
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface SidebarProps {
  isOpen: boolean;
}

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}

const NavItem = ({ href, icon, label, active }: NavItemProps) => {
  return (
    <li>
      <Link href={href}>
        <a 
          className={cn(
            "flex items-center px-3 py-2 rounded-md",
            active 
              ? "text-primary-600 bg-primary-50 font-medium" 
              : "text-secondary-600 hover:bg-secondary-50"
          )}
        >
          {icon}
          <span>{label}</span>
        </a>
      </Link>
    </li>
  );
};

export function Sidebar({ isOpen }: SidebarProps) {
  const [location] = useLocation();
  
  return (
    <aside 
      className={cn(
        "sidebar bg-white w-64 border-r border-secondary-200 flex flex-col z-30 h-full fixed md:sticky top-0 left-0",
        "transform transition-transform duration-300 ease-in-out md:transform-none",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <nav className="p-4 flex-1 overflow-y-auto">
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-secondary-500 uppercase tracking-wider mb-2">
            Analysis
          </h3>
          <ul className="space-y-1">
            <NavItem 
              href="/" 
              icon={<LayoutDashboard className="mr-2 h-4 w-4" />}
              label="Dashboard"
              active={location === "/"}
            />
            <NavItem 
              href="/source-contributions" 
              icon={<BarChart3 className="mr-2 h-4 w-4" />}
              label="Source Contributions"
              active={location === "/source-contributions"}
            />
            <NavItem 
              href="/transfer-functions" 
              icon={<WaveformIcon className="mr-2 h-4 w-4" />}
              label="Transfer Functions"
              active={location === "/transfer-functions"}
            />
            <NavItem 
              href="/system-response" 
              icon={<FilePieChart className="mr-2 h-4 w-4" />}
              label="System Response"
              active={location === "/system-response"}
            />
          </ul>
        </div>

        <div className="mb-6">
          <h3 className="text-xs font-semibold text-secondary-500 uppercase tracking-wider mb-2">
            Data
          </h3>
          <ul className="space-y-1">
            <NavItem 
              href="/data-management?type=frf" 
              icon={<DatabaseIcon className="mr-2 h-4 w-4" />}
              label="FRF Datasets"
              active={location === "/data-management?type=frf"}
            />
            <NavItem 
              href="/data-management?type=operational" 
              icon={<FileSpreadsheet className="mr-2 h-4 w-4" />}
              label="Operational Measurements"
              active={location === "/data-management?type=operational"}
            />
            <NavItem 
              href="/data-management?type=history" 
              icon={<History className="mr-2 h-4 w-4" />}
              label="Analysis History"
              active={location === "/data-management?type=history"}
            />
          </ul>
        </div>

        <div className="mb-6">
          <h3 className="text-xs font-semibold text-secondary-500 uppercase tracking-wider mb-2">
            Configuration
          </h3>
          <ul className="space-y-1">
            <NavItem 
              href="/settings" 
              icon={<Settings className="mr-2 h-4 w-4" />}
              label="Settings"
              active={location === "/settings"}
            />
            <NavItem 
              href="/preferences" 
              icon={<UserCog className="mr-2 h-4 w-4" />}
              label="User Preferences"
              active={location === "/preferences"}
            />
          </ul>
        </div>
      </nav>

      <div className="p-4 border-t border-secondary-200">
        <div className="bg-secondary-50 rounded-md p-3">
          <h4 className="text-sm font-medium text-secondary-700 mb-2">Current Project</h4>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            <span className="text-sm text-secondary-600">Engine Vibration Study</span>
          </div>
          <div className="mt-2 text-xs text-secondary-500">Last updated: 2 hours ago</div>
        </div>
      </div>
    </aside>
  );
}
