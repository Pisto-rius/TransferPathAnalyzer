import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, FileQuestion, Database } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function EmptyState({
  title,
  description,
  icon,
  action,
}: EmptyStateProps) {
  return (
    <Card className="w-full">
      <CardContent className="pt-6 flex flex-col items-center justify-center text-center p-8">
        <div className="w-12 h-12 flex items-center justify-center rounded-full bg-secondary-100 text-secondary-500 mb-4">
          {icon || <FileQuestion className="h-6 w-6" />}
        </div>
        <h3 className="text-lg font-semibold text-secondary-800 mb-2">
          {title}
        </h3>
        <p className="text-sm text-secondary-500 mb-4 max-w-md">
          {description}
        </p>
        {action && <div className="mt-2">{action}</div>}
      </CardContent>
    </Card>
  );
}

export function NoDataEmptyState({
  title = "No Data Available",
  description = "There is no data available to display. Please import or select data to continue.",
  action,
}: Partial<EmptyStateProps>) {
  return (
    <EmptyState
      title={title}
      description={description}
      icon={<Database className="h-6 w-6" />}
      action={action}
    />
  );
}

export function ErrorEmptyState({
  title = "Error Loading Data",
  description = "There was an error loading the data. Please try again later.",
  action,
}: Partial<EmptyStateProps>) {
  return (
    <EmptyState
      title={title}
      description={description}
      icon={<AlertTriangle className="h-6 w-6" />}
      action={action}
    />
  );
}
