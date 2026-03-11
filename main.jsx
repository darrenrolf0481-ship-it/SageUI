import React from 'react';
import ReactDOM from 'react-dom/client';
import PhiSentinel from './App.jsx';
import './index.css';

// Capacitor — wait for native layer before mounting
const mount = () => {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <PhiSentinel />
    </React.StrictMode>
  );
};

// On Android, deviceready fires after Capacitor is ready
document.addEventListener('deviceready', mount, false);
// Fallback for browser / web testing
if (!window.Capacitor) {
  mount();
}
