'use client';

import { useEffect, useState } from 'react';
import { OnboardingLoader } from './onboarding-loader';

interface OnboardingWrapperProps {
  userName: string;
  greeting: string;
  needsInitialSync: boolean;
  children: React.ReactNode;
}

export function OnboardingWrapper({ userName, greeting, needsInitialSync, children }: OnboardingWrapperProps) {
  const [showOnboarding, setShowOnboarding] = useState(needsInitialSync);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (needsInitialSync && !isSyncing) {
      setIsSyncing(true);
      // Trigger initial sync
      fetch('/api/initial-sync', { method: 'POST' })
        .then((res) => res.json())
        .then((data) => {
          console.log('Initial sync completed:', data);
        })
        .catch((error) => {
          console.error('Initial sync failed:', error);
        });
    }
  }, [needsInitialSync, isSyncing]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    // Refresh the page to load the synced data
    window.location.reload();
  };

  if (showOnboarding) {
    return (
      <OnboardingLoader
        userName={userName}
        greeting={greeting}
        onComplete={handleOnboardingComplete}
      />
    );
  }

  return <>{children}</>;
}
