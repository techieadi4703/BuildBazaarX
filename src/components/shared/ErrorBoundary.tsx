import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertCircle className="h-10 w-10" />
          </div>
          <h1 className="mb-2 text-2xl font-bold tracking-tight text-foreground md:text-3xl">Something went wrong</h1>
          <p className="mb-8 max-w-[500px] text-muted-foreground">
            We encountered an unexpected error while loading this section. Please try refreshing the page.
          </p>
          <Button onClick={() => window.location.reload()} size="lg" className="rounded-full">
            Refresh Page
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
