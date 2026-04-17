import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  // @ts-ignore
  props: Props;
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    const { hasError } = this.state;
    const { children } = this.props;

    if (hasError) {
      return (
        <div className="min-h-screen bg-[#050507] flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] backdrop-blur-3xl rounded-[32px] p-10 shadow-2xl">
            <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-[-1px] mb-4">Something went wrong</h1>
            <p className="text-white/60 text-sm leading-relaxed mb-8">
              We encountered an unexpected error. Don't worry, your data is safe. Try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full h-14 bg-white text-black rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-gray-200 transition-all uppercase tracking-widest text-xs"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Platform
            </button>
          </div>
        </div>
      );
    }

    return children;
  }
}

export default ErrorBoundary;
