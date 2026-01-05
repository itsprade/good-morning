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
    // Trigger content animation after loader completes
    setTimeout(() => {
      setAnimateContent(true);
    }, 50);
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
        className={`transition-all duration-700 ease-out ${
          showLoader
            ? 'opacity-0 translate-y-[400px]'
            : animateContent
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-[400px]'
        }`}
      >
        {children}
      </div>
    </>
  );
}
