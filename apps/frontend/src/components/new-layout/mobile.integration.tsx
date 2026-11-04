'use client';

import { FC, useCallback, useEffect, useState } from 'react';
import { AddProviderComponent } from '@tl_smp/frontend/components/launches/add.provider.component';
import { useFetch } from '@tl_smp/helpers/utils/custom.fetch';

export const MobileIntegration: FC = () => {
  const [integrations, setIntegrations] = useState(null as any);
  const fetch = useFetch();

  const loadIntegrations = useCallback(async () => {
    setIntegrations(await (await fetch('/integrations')).json());
  }, []);

  useEffect(() => {
    loadIntegrations();
  }, []);

  if (!integrations) {
    return null;
  }

  return (
    <AddProviderComponent
      isMobile={true}
      invite={false}
      update={() => {}}
      {...integrations}
    />
  );
};
