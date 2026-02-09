import { useState, useEffect } from 'react';

export interface MobileOptimization {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
  screenHeight: number;
  touchSupported: boolean;
}

export function useMobileOptimization(): MobileOptimization {
  const [optimization, setOptimization] = useState<MobileOptimization>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    screenWidth: typeof window !== 'undefined' ? window.innerWidth : 1024,
    screenHeight: typeof window !== 'undefined' ? window.innerHeight : 768,
    touchSupported: typeof window !== 'undefined' ? 'ontouchstart' in window : false
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const touchSupported = 'ontouchstart' in window;
      
      setOptimization({
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
        screenWidth: width,
        screenHeight: height,
        touchSupported
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return optimization;
}

export function useResponsiveColumns(maxColumns: number = 4): number {
  const { isMobile, isTablet } = useMobileOptimization();
  
  if (isMobile) return 1;
  if (isTablet) return 2;
  return maxColumns;
}

export function useResponsiveFontSize(): {
  heading: string;
  subheading: string;
  body: string;
  small: string;
} {
  const { isMobile } = useMobileOptimization();
  
  return {
    heading: isMobile ? 'text-xl' : 'text-3xl',
    subheading: isMobile ? 'text-sm' : 'text-lg',
    body: isMobile ? 'text-xs' : 'text-base',
    small: isMobile ? 'text-xs' : 'text-sm'
  };
}
