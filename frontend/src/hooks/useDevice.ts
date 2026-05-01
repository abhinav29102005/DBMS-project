'use client';

import { useEffect, useState } from 'react';

type DeviceClass = 'mobile' | 'desktop';

export function useDevice(): DeviceClass {
  const [device, setDevice] = useState<DeviceClass>('desktop');

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');

    const update = (e: MediaQueryListEvent | MediaQueryList) => {
      setDevice(e.matches ? 'mobile' : 'desktop');
    };

    update(mq);

    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  return device;
}
