import React from 'react';
import { createRoot } from 'react-dom/client';
import LandingPage from './LandingPage';

const rootElement = document.getElementById('app');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<LandingPage />);
} else {
  console.error('Failed to find the app element');
}