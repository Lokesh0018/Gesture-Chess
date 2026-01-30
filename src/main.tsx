import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

window.onerror = function (msg, url, lineNo, columnNo, error) {
  const errorDiv = document.createElement('div');
  errorDiv.style.position = 'fixed';
  errorDiv.style.top = '0';
  errorDiv.style.left = '0';
  errorDiv.style.background = 'red';
  errorDiv.style.color = 'white';
  errorDiv.style.zIndex = '99999';
  errorDiv.style.padding = '20px';
  errorDiv.innerText = `Error: ${msg}\nLine: ${lineNo}`;
  document.body.appendChild(errorDiv);
  return false;
};

createRoot(document.getElementById('root')!).render(
  <App />
)
