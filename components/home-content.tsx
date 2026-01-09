'use client';

import { useState, useEffect } from 'react';
import { SunriseLoader } from './sunrise-loader';

interface HomeContentProps {
  userName: string;
  greeting: string;
  children: React.ReactNode;
}

export function HomeContent({ userName, greeting, children }: HomeContentProps) {
  const [showLoader, setShowLoader] = useState(true);
  const [animateContent, setAnimateContent] = useState(false);

  // Reset loader on every page load
  useEffect(() => {
    setShowLoader(true);
    setAnimateContent(false);
  }, []);

  const handleLoaderComplete = () => {
    setShowLoader(false);
    // Trigger content animation immediately
    requestAnimationFrame(() => {
      setAnimateContent(true);
    });
  };

  return (
    <>
      {showLoader && (
        <SunriseLoader
          userName={userName}
          greeting={greeting}
          onComplete={handleLoaderComplete}
        />
      )}
      <div
        className={`transition-all duration-500 ease-out will-change-transform ${
          showLoader
            ? 'opacity-0 translate-y-[200px]'
            : animateContent
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-[200px]'
        }`}
      >
        {children}
      </div>
    </>
  );
}
