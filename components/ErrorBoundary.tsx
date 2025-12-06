import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

// Fix: Make children optional to resolve 'Property children is missing' error in index.tsx
interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  // Fix: Explicitly define state property to resolve 'Property state does not exist' error
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    // Clear all app data
    localStorage.clear();
    // Hard reload
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 text-center font-sans">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6 animate-pulse">
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">Oups !</h1>
          <p className="text-gray-500 max-w-md mb-8">
            Une erreur inattendue s'est produite lors du chargement de l'interface. Cela est souvent dû à des données obsolètes dans le cache.
          </p>
          <div className="bg-gray-50 p-4 rounded-lg mb-8 text-left w-full max-w-md overflow-hidden">
             {/* Fix: Access state safely with optional chaining */}
             <p className="font-mono text-xs text-red-400 break-all">
               {this.state.error?.message || "Unknown Error"}
             </p>
          </div>
          <button
            onClick={this.handleReset}
            className="bg-black text-white px-8 py-4 rounded-xl font-bold flex items-center gap-3 hover:bg-blue-600 transition-all shadow-xl active:scale-95"
          >
            <RefreshCw className="w-5 h-5" />
            Réparer et Recharger
          </button>
        </div>
      );
    }

    // Fix: props exist on Component, access is safe
    return this.props.children;
  }
}