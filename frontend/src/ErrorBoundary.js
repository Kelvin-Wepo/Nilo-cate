import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Ignore MetaMask injection errors
    if (error?.message?.includes('MetaMask') || error?.message?.includes('ethereum')) {
      console.log('MetaMask error suppressed - app will continue normally');
      this.setState({ hasError: false, error: null });
      return;
    }
  }

  render() {
    if (this.state.hasError && this.state.error) {
      // Don't show error UI for MetaMask issues
      if (this.state.error?.message?.includes('MetaMask') || 
          this.state.error?.message?.includes('ethereum')) {
        return this.props.children;
      }

      // You can render any custom fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
            <h1 className="text-2xl font-bold text-red-600 mb-4">⚠️ Something went wrong</h1>
            <p className="text-gray-700 mb-4">
              An error occurred while loading the application.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
