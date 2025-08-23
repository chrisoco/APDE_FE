import { Suspense } from "react";

interface LoadingBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

function DefaultLoadingFallback() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-primary rounded-full animate-pulse"></div>
          <div className="w-4 h-4 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-4 h-4 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
}

export function LoadingBoundary({ children, fallback }: LoadingBoundaryProps) {
  return (
    <Suspense fallback={fallback || <DefaultLoadingFallback />}>
      {children}
    </Suspense>
  );
}