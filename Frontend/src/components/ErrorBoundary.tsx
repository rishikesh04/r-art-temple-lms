import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 bg-white rounded-[40px] border border-slate-100 shadow-sm text-center">
          <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mb-6 shadow-sm">
            <AlertTriangle size={40} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Module Encountered an Error</h2>
          <p className="text-slate-500 max-w-md mx-auto mb-10">
            We've encountered an unexpected technical glitch while rendering this section. 
            {this.state.error && <span className="block mt-2 text-[10px] font-mono bg-slate-50 p-2 rounded-lg text-slate-400 overflow-auto">{this.state.error.message}</span>}
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button 
              onClick={this.handleReset}
              className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold flex items-center gap-2 hover:brightness-110 transition-all shadow-lg shadow-slate-200"
            >
              <RefreshCw size={18} />
              Reload Section
            </button>
            <a 
              href="/admin"
              className="px-8 py-3 bg-slate-100 text-slate-700 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-200 transition-all"
            >
              <Home size={18} />
              Back Overview
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
