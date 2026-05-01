'use client';

import { useEffect, useState } from 'react';

type DeviceClass = 'mobile' | 'desktop';

/**
 * Hook to detect the current device class based on window width.
 * Returns 'mobile' if width is less than 768px, otherwise 'desktop'.
 * Adaptive UI strategy: This is used to render entirely different layouts.
 */
export function useDevice(): DeviceClass {
  const [device, setDevice] = useState<DeviceClass>('desktop');

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    
    const update = (e: MediaQueryListEvent | MediaQueryList) => {
      setDevice(e.matches ? 'mobile' : 'desktop');
    };

    // Initial check
    update(mq);

    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  return device;
}
