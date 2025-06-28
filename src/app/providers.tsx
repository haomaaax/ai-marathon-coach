'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n'; // Import your i18n configuration

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <I18nextProvider i18n={i18n}>
      <SessionProvider>{children}</SessionProvider>
    </I18nextProvider>
  );
}