'use client';

import { useEffect, useState } from 'react';

interface SunriseLoaderProps {
  userName: string;
  greeting: string;
  onComplete: () => void;
}

export function SunriseLoader({ userName, greeting, onComplete }: SunriseLoaderProps) {
  const [stage, setStage] = useState<'initial' | 'sunrise' | 'hold' | 'fade'>('initial');

  useEffect(() => {
    // Stage 1: Show greeting and hold for 100ms
    const holdTimer = setTimeout(() => {
      setStage('sunrise');
    }, 100);

    // Stage 2: Gradient rises for 2 seconds
    const riseCompleteTimer = setTimeout(() => {
      setStage('hold');
    }, 2100);

    // Stage 3: Hold for 80ms before fading
    const beforeFadeTimer = setTimeout(() => {
      setStage('fade');
    }, 2180);

    // Stage 4: Fade out text only (0.5 seconds)
    const fadeTimer = setTimeout(() => {
      onComplete();
    }, 2680);

    return () => {
      clearTimeout(holdTimer);
      clearTimeout(riseCompleteTimer);
      clearTimeout(beforeFadeTimer);
      clearTimeout(fadeTimer);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50">
      {/* Background */}
      <div className="absolute inset-0 bg-white" />

      {/* Sunrise Gradient - SVG-based circles rising from bottom (stays visible during transition) */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 transition-transform duration-[2000ms] ease-out"
          style={{
            transform: stage === 'initial' ? 'translateY(100%)' : 'translateY(0)',
          }}
        >
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
              <filter id="filter0_f_110_12" x="-278" y="0" width="1996" height="1996" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
                <feGaussianBlur stdDeviation="80" result="effect1_foregroundBlur_110_12"/>
              </filter>
              <filter id="filter1_f_110_12" x="-278" y="171" width="1996" height="1996" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
                <feGaussianBlur stdDeviation="80" result="effect1_foregroundBlur_110_12"/>
              </filter>
            </defs>
            <g filter="url(#filter0_f_110_12)">
              <circle cx="720" cy="998" r="838" fill="#FF9900"/>
            </g>
            <g filter="url(#filter1_f_110_12)">
              <circle cx="720" cy="1169" r="838" fill="#FFC266"/>
            </g>
          </svg>
        </div>
      </div>

      {/* Good Morning Text - fades out but gradient stays */}
      <div
        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${
          stage === 'fade' ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <div className="text-center">
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900">
            {greeting}
          </h1>
          <p className="text-2xl sm:text-3xl text-gray-500 mt-3">
            {userName}
          </p>
        </div>
      </div>
    </div>
  );
}
