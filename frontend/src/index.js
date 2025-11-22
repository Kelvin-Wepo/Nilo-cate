import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import ErrorBoundary from './ErrorBoundary';
import * as serviceWorker from './serviceWorker';

// Suppress MetaMask injection errors globally
window.addEventListener('error', (event) => {
  if (event.message && (event.message.includes('MetaMask') || event.message.includes('ethereum'))) {
    console.log('MetaMask error suppressed:', event.message);
    event.preventDefault();
    event.stopPropagation();
    return false;
  }
});

// Suppress unhandled promise rejections from MetaMask
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && (
    event.reason.message?.includes('MetaMask') || 
    event.reason.message?.includes('ethereum') ||
    event.reason.toString().includes('MetaMask') ||
    event.reason.toString().includes('ethereum')
  )) {
    console.log('MetaMask promise rejection suppressed:', event.reason);
    event.preventDefault();
    return false;
  }
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

// Register service worker for PWA functionality
// Enable offline support for rangers in remote areas
serviceWorker.register();
