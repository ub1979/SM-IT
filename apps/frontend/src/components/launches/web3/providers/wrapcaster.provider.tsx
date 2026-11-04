'use client';

import React, { FC, useState, useCallback } from 'react';
import { Web3ProviderInterface } from '@tl_smp/frontend/components/launches/web3/web3.provider.interface';
import { LoadingComponent } from '@tl_smp/frontend/components/layout/loading';
import { useModals } from '@tl_smp/frontend/components/layout/new-modal';
import { FarcasterApproval } from '@tl_smp/frontend/components/launches/web3/providers/farcaster.approval';
export const WrapcasterProvider: FC<Web3ProviderInterface> = (props) => {
  const [_, state] = props.nonce.split('||');
  const modal = useModals();
  const [hide, setHide] = useState(false);
  const auth = useCallback(
    (code: string) => {
      setHide(true);
      return props.onComplete(code, state);
    },
    [state]
  );
  return (
    <div className="justify-center items-center flex">
      {hide ? (
        <div className="justify-center items-center flex -mt-[90px]">
          <LoadingComponent width={100} height={100} />
        </div>
      ) : (
        <div className="w-[500px]">
          <FarcasterApproval
            login={auth}
            onFail={modal.closeCurrent}
            setupToken={props.setupToken}
          />
        </div>
      )}
    </div>
  );
};
