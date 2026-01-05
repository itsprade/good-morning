'use client';

import { useEffect, useState } from 'react';

interface OnboardingLoaderProps {
  userName: string;
  greeting: string;
  onComplete: () => void;
}

type SyncStage = 'greeting' | 'calendar' | 'gmail' | 'complete';

const STAGE_MESSAGES = {
  greeting: '',
  calendar: 'Going through your Google Calendar...',
  gmail: 'Going through your Gmail...',
  complete: 'Setting up your dashboard...',
};

export function OnboardingLoader({ userName, greeting, onComplete }: OnboardingLoaderProps) {
  const [stage, setStage] = useState<SyncStage>('greeting');

  useEffect(() => {
    // Start sync process after greeting
    const startSyncTimer = setTimeout(() => {
      setStage('calendar');
    }, 1000);

    return () => clearTimeout(startSyncTimer);
  }, []);

  // Update stage based on sync status
  useEffect(() => {
    if (stage === 'calendar') {
      const calendarTimer = setTimeout(() => {
        setStage('gmail');
      }, 3000);
      return () => clearTimeout(calendarTimer);
    }

    if (stage === 'gmail') {
      const gmailTimer = setTimeout(() => {
        setStage('complete');
      }, 3000);
      return () => clearTimeout(gmailTimer);
    }

    if (stage === 'complete') {
      const completeTimer = setTimeout(() => {
        onComplete();
      }, 1000);
      return () => clearTimeout(completeTimer);
    }
  }, [stage, onComplete]);

  const currentMessage = STAGE_MESSAGES[stage];

  return (
    <div className="fixed inset-0 z-50 bg-white">
      {/* Orange Sunrise Gradient at Bottom */}
      <div className="absolute inset-0 overflow-hidden">
        <svg
          className="absolute left-1/2 -translate-x-1/2"
          style={{ bottom: '-168px', minWidth: '100vw' }}
          width="1440"
          height="630"
          viewBox="0 0 1440 630"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <filter id="filter0_f_onboarding" x="-278" y="0" width="1996" height="1996" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
              <feFlood floodOpacity="0" result="BackgroundImageFix"/>
              <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
              <feGaussianBlur stdDeviation="80" result="effect1_foregroundBlur_110_12"/>
            </filter>
            <filter id="filter1_f_onboarding" x="-278" y="171" width="1996" height="1996" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
              <feFlood floodOpacity="0" result="BackgroundImageFix"/>
              <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
              <feGaussianBlur stdDeviation="80" result="effect1_foregroundBlur_110_12"/>
            </filter>
          </defs>
          <g filter="url(#filter0_f_onboarding)">
            <circle cx="720" cy="998" r="838" fill="#FF9900"/>
          </g>
          <g filter="url(#filter1_f_onboarding)">
            <circle cx="720" cy="1169" r="838" fill="#FFC266"/>
          </g>
        </svg>
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-center">
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900">
            {greeting}
          </h1>
          <p className="text-2xl sm:text-3xl text-gray-500 mt-3">
            {userName}
          </p>

          {/* Loading message */}
          {currentMessage && (
            <div className="mt-12 flex flex-col items-center gap-4">
              {/* Loading spinner */}
              <div className="w-8 h-8 border-3 border-gray-300 border-t-orange-500 rounded-full animate-spin"></div>

              {/* Status message */}
              <p className="text-lg text-gray-600 animate-pulse">
                {currentMessage}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
