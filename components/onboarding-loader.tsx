'use client';

import { useEffect, useState } from 'react';

interface OnboardingLoaderProps {
  userName: string;
  greeting: string;
}

const STATUS_MESSAGES = [
  'Going through your Google Calendar...',
  'Analyzing your upcoming meetings...',
  'Going through your Gmail...',
  'Finding actionable emails...',
  'Creating task suggestions...',
  'Generating your daily summary...',
  'Setting up your dashboard...',
  'Almost ready...',
];

export function OnboardingLoader({ userName, greeting }: OnboardingLoaderProps) {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % STATUS_MESSAGES.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

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

      {/* Good Morning Text - Centered */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900">
            {greeting}
          </h1>
          <p className="text-2xl sm:text-3xl text-gray-500 mt-3">
            {userName}
          </p>
        </div>
      </div>

      {/* Loading Status - Bottom Center */}
      <div className="absolute bottom-24 left-0 right-0 flex flex-col items-center gap-4">
        {/* Loading spinner */}
        <div className="w-8 h-8 border-3 border-gray-300 border-t-orange-500 rounded-full animate-spin"></div>

        {/* Cycling status message */}
        <p className="text-lg text-gray-600 transition-opacity duration-300">
          {STATUS_MESSAGES[messageIndex]}
        </p>
      </div>
    </div>
  );
}
