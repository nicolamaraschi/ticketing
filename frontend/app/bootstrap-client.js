'use client';

// Importa il JavaScript di Bootstrap lato client
import { useEffect } from 'react';

export default function BootstrapClient() {
  useEffect(() => {
    // Importa Bootstrap JS solo lato client
    require('bootstrap/dist/js/bootstrap.bundle.min.js');
  }, []);

  return null;
}