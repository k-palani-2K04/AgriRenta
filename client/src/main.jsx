import React, { Component, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[AgriRenta UI ErrorBoundary]', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center space-y-4 font-sans">
          <div className="w-16 h-16 bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 rounded-full flex items-center justify-center text-2xl font-black">
            🚜
          </div>
          <h1 className="text-2xl font-black text-white">AgriRenta Application Recovered</h1>
          <p className="text-xs text-slate-400 max-w-sm">
            An unexpected UI rendering glitch occurred. Click below to refresh your session.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-3 rounded-2xl text-xs shadow-lg transition-transform active:scale-95"
          >
            Reload AgriRenta Platform 🔄
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
