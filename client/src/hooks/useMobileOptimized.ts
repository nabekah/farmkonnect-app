import { useEffect, useState } from 'react';

/**
 * Mobile Optimization Hook
 * Provides utilities for responsive design and mobile-first development
 */

export interface MobileBreakpoint {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  width: number;
  height: number;
}

export function useMobileOptimized(): MobileBreakpoint {
  const [breakpoint, setBreakpoint] = useState<MobileBreakpoint>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      setBreakpoint({
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
        width,
        height,
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return breakpoint;
}

/**
 * Touch-optimized button sizing
 */
export function getTouchOptimizedSize(baseSize: string): string {
  const sizeMap: Record<string, string> = {
    sm: 'min-h-[32px] min-w-[32px]',
    md: 'min-h-[44px] min-w-[44px]',
    lg: 'min-h-[56px] min-w-[56px]',
  };
  return sizeMap[baseSize] || sizeMap.md;
}

/**
 * Mobile-friendly spacing
 */
export function getMobileSpacing(desktop: string, mobile: string): string {
  return `${mobile} md:${desktop}`;
}

/**
 * Touch-friendly list item height
 */
export const TOUCH_TARGET_HEIGHT = 'h-14 md:h-12';
export const TOUCH_TARGET_PADDING = 'p-3 md:p-2';

/**
 * Mobile-first grid columns
 */
export function getMobileGridCols(mobile: number, tablet: number, desktop: number): string {
  return `grid-cols-${mobile} md:grid-cols-${tablet} lg:grid-cols-${desktop}`;
}

/**
 * Optimize images for mobile
 */
export interface MobileImageConfig {
  src: string;
  alt: string;
  priority?: boolean;
  responsive?: boolean;
}

export function getMobileImageSizes(): string {
  return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
}

/**
 * Mobile-friendly form input
 */
export const MOBILE_INPUT_CLASS = 'text-base md:text-sm px-3 py-3 md:py-2 rounded-lg border';

/**
 * Safe area padding for notch devices
 */
export function getSafeAreaPadding(): string {
  return 'pt-safe pb-safe px-safe';
}

/**
 * Viewport height utility (fixes 100vh on mobile)
 */
export function useViewportHeight(): number {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const updateHeight = () => {
      setHeight(window.innerHeight);
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    window.addEventListener('orientationchange', updateHeight);

    return () => {
      window.removeEventListener('resize', updateHeight);
      window.removeEventListener('orientationchange', updateHeight);
    };
  }, []);

  return height;
}

/**
 * Detect if device supports touch
 */
export function useIsTouchDevice(): boolean {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const checkTouch = () => {
      return (
        window.matchMedia('(pointer:coarse)').matches ||
        window.matchMedia('(hover:none)').matches ||
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0
      );
    };

    setIsTouch(checkTouch());
  }, []);

  return isTouch;
}

/**
 * Optimize for landscape/portrait orientation
 */
export function useDeviceOrientation(): 'portrait' | 'landscape' {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  useEffect(() => {
    const updateOrientation = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
    };

    updateOrientation();
    window.addEventListener('orientationchange', updateOrientation);
    window.addEventListener('resize', updateOrientation);

    return () => {
      window.removeEventListener('orientationchange', updateOrientation);
      window.removeEventListener('resize', updateOrientation);
    };
  }, []);

  return orientation;
}

/**
 * Mobile-friendly modal/drawer
 */
export const MOBILE_MODAL_CLASS = 'fixed inset-0 z-50 md:relative md:z-auto';
export const MOBILE_DRAWER_CLASS = 'fixed bottom-0 left-0 right-0 z-50 rounded-t-lg md:relative md:rounded-none';

/**
 * Safe scroll area for mobile
 */
export const MOBILE_SCROLL_CLASS = 'overflow-y-auto overscroll-contain';

/**
 * Optimize for field workers (outdoor usage)
 */
export function getFieldWorkerOptimizations(): {
  highContrast: boolean;
  largeText: boolean;
  touchFriendly: boolean;
  offlineCapable: boolean;
} {
  return {
    highContrast: true,
    largeText: true,
    touchFriendly: true,
    offlineCapable: true,
  };
}

/**
 * Performance optimization for mobile
 */
export function useLazyLoad(threshold: number = 0.1) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [threshold]);

  return { ref, isVisible };
}

import React from 'react';
