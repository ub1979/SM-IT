import { usePlausible } from 'next-plausible';
import { useCallback } from 'react';
import { useVariables } from '@tl_smp/react/helpers/variable.context';

export const useFireEvents = () => {
  const { billingEnabled } = useVariables();
  const plausible = usePlausible();

  return useCallback(
    (name: string, props?: any) => {
      if (!billingEnabled) {
        return;
      }

      plausible(name, { props });
    },
    [billingEnabled, plausible]
  );
};
