import React, { StrictMode, Component, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

class ErrorBoundary extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    (this as any).state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    const { hasError, error } = (this as any).state;
    if (hasError) {
      return (
        <div className="min-h-screen bg-red-950 flex items-center justify-center p-4">
          <div className="glass-card p-8 rounded-2xl shadow-xl max-w-md w-full border border-red-500/30">
            <h1 className="text-2xl font-bold text-red-500 mb-4">Something went wrong</h1>
            <p className="text-text-secondary mb-6">
              The application encountered an error. This might be due to a Firebase configuration issue or a network error.
            </p>
            <pre className="bg-black/40 p-4 rounded-lg text-xs overflow-auto max-h-40 mb-6 text-red-400 border border-red-500/20">
              {error?.message || String(error)}
            </pre>
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-blood-red text-white py-3 rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-900/40"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
