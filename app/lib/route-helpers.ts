import { isRouteErrorResponse } from "react-router";

interface ErrorBoundaryProps {
  error: unknown;
}

interface RouteErrorBoundaryOptions {
  entityName: string;
  retryAction?: () => void;
}

export function createRouteErrorBoundary(options: RouteErrorBoundaryOptions) {
  return function RouteErrorBoundary({ error }: ErrorBoundaryProps) {
    let message = `Something went wrong loading ${options.entityName}.`;
    let details = `Unable to load the ${options.entityName} data.`;

    if (isRouteErrorResponse(error)) {
      message = error.status === 404 
        ? `${options.entityName} not found` 
        : `Error loading ${options.entityName}`;
      details = error.status === 404 
        ? `The ${options.entityName} resource could not be found.` 
        : error.statusText || details;
    } else if (error && error instanceof Error) {
      details = error.message;
    }

    return (
      <div className="container mx-auto py-6">
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-red-600">{message}</h2>
            <p className="text-muted-foreground mt-2">{details}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  };
}