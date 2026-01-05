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
  const [syncComplete, setSyncComplete] = useState(false);

  useEffect(() => {
    if (needsInitialSync && !syncComplete) {
      // Trigger initial sync
      fetch('/api/initial-sync', { method: 'POST' })
        .then((res) => res.json())
        .then((data) => {
          console.log('Initial sync completed:', data);
          setSyncComplete(true);
          // Wait a moment then hide onboarding and reload
          setTimeout(() => {
            setShowOnboarding(false);
            window.location.reload();
          }, 2000);
        })
        .catch((error) => {
          console.error('Initial sync failed:', error);
          // Still hide onboarding even if sync fails
          setTimeout(() => {
            setShowOnboarding(false);
          }, 3000);
        });
    }
  }, [needsInitialSync, syncComplete]);

  if (showOnboarding) {
    return (
      <OnboardingLoader
        userName={userName}
        greeting={greeting}
      />
    );
  }

  return <>{children}</>;
}
