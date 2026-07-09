import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import * as Sentry from "@sentry/react";
import App from './App.tsx';
import './index.css';

Sentry.init({
  dsn: "https://5acbc58e83998114720d0496c591006f@o4511511789436928.ingest.us.sentry.io/4511511799201792",
  // Setting this option to true will send default PII data to Sentry.
  // For example, automatic IP address collection on events
  sendDefaultPii: true
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
