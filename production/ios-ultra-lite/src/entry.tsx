import React from 'react';
import { createRoot } from 'react-dom/client';

import HomeStandalone from '/opt/gorilla-react-home/home-standalone';
import { GorillaAccountProvider } from '/opt/gorilla/components/gorilla-account-provider';

const root = document.getElementById('gorilla-react-root');

if (!root) {
  throw new Error('gorilla-react-root not found');
}

createRoot(root).render(
  <GorillaAccountProvider>
    <HomeStandalone />
  </GorillaAccountProvider>
);
