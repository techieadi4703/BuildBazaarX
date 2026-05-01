import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
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

  private handleReset = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#fcf9f6] p-6 text-center">
          <div className="max-w-md w-full">
            <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-red-100">
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
            <h1 className="text-3xl font-headline font-bold text-[#1c1c1a] mb-4 tracking-tight">System Interruption</h1>
            <p className="text-[#74777d] font-body mb-8 leading-relaxed">
              An unexpected error occurred while rendering this module. Our structural integrity protocol has safely isolated the failure.
            </p>
            <div className="flex flex-col gap-3">
              <Button 
                onClick={this.handleReset}
                className="w-full bg-[#1c1c1a] hover:bg-[#735c00] text-white rounded-xl h-14 font-bold uppercase tracking-widest transition-all shadow-xl"
              >
                <RefreshCw className="w-4 h-4 mr-3" />
                Initialize Recovery
              </Button>
              <Button 
                variant="ghost" 
                asChild
                className="w-full text-[10px] font-bold uppercase tracking-widest text-[#c4c6cc] hover:text-[#735c00]"
              >
                <a href="/">Return to Control Center</a>
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.children;
  }
}
