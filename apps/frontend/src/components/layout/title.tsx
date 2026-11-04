'use client';

import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { useMenuItem } from '@tl_smp/frontend/components/layout/top.menu';
export const Title = () => {
  const path = usePathname();
  const { all: menuItems } = useMenuItem();
  const currentTitle = useMemo(() => {
    return menuItems.find((item) => path.indexOf(item.path) > -1)?.name;
  }, [path, menuItems]);

  return (
    <h1 className="truncate text-[24px] mobile:text-[20px] font-semibold tracking-[-0.7px]">
      {currentTitle}
    </h1>
  );
};
