import { cn } from "@/lib/utils";
import { AlertTriangle, RotateCcw, Home, RefreshCw } from "lucide-react";
import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorCount: number;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorCount: 0 };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorCount: 0 };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[ErrorBoundary] Caught error:', error);
      console.error('[ErrorBoundary] Error info:', errorInfo);
    }
    this.setState((prevState) => ({
      errorCount: prevState.errorCount + 1,
    }));
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  handleHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <div className="flex items-center justify-center min-h-screen p-8 bg-gradient-to-br from-red-50 to-orange-50">
          <div className="flex flex-col items-center w-full max-w-2xl bg-white rounded-lg shadow-lg p-8">
            <div className="bg-red-100 rounded-full p-4 mb-6">
              <AlertTriangle size={48} className="text-red-600" />
            </div>

            <h2 className="text-2xl font-bold text-center mb-2">Oops! Something went wrong</h2>
            <p className="text-center text-gray-600 mb-6">We encountered an unexpected error. Please try one of the options below.</p>

            {process.env.NODE_ENV === 'development' && (
              <div className="p-4 w-full rounded bg-gray-100 overflow-auto mb-6 max-h-40">
                <pre className="text-xs text-gray-700 whitespace-break-spaces font-mono">
                  {this.state.error.message}
                </pre>
              </div>
            )}

            {this.state.errorCount > 2 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-6 w-full">
                <p className="text-sm text-yellow-800">Multiple errors detected. Consider reloading the page.</p>
              </div>
            )}

            <div className="space-y-3 w-full">
              <button
                onClick={this.handleReset}
                className={cn(
                  "flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg",
                  "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                )}
              >
                <RefreshCw size={16} />
                Try Again
              </button>

              <button
                onClick={() => window.location.reload()}
                className={cn(
                  "flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg",
                  "bg-gray-200 text-gray-900 hover:bg-gray-300 cursor-pointer"
                )}
              >
                <RotateCcw size={16} />
                Reload Page
              </button>

              <button
                onClick={this.handleHome}
                className={cn(
                  "flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg",
                  "bg-gray-200 text-gray-900 hover:bg-gray-300 cursor-pointer"
                )}
              >
                <Home size={16} />
                Go to Home
              </button>
            </div>

            <p className="text-center text-xs text-gray-500 mt-6">If the problem persists, please contact support.</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
