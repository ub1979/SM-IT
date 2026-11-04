'use client';

import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { useFetch } from '@tl_smp/helpers/utils/custom.fetch';
import { timer } from '@tl_smp/helpers/utils/timer';
import { useToaster } from '@tl_smp/react/toaster/toaster';
import { useT } from '@tl_smp/react/translation/get.transation.service.client';
import { Button } from '@tl_smp/react/form/button';
import copy from 'copy-to-clipboard';
import Loading from '@tl_smp/frontend/components/layout/loading';
export const FarcasterApproval: FC<{
  login: (code: string) => void;
  onFail: () => void;
  setupToken?: string;
}> = (props) => {
  const { login, onFail } = props;
  const fetch = useFetch();
  const toaster = useToaster();
  const t = useT();
  const activeSigner = useRef('');
  const [approvalUrl, setApprovalUrl] = useState('');
  const [qrCode, setQrCode] = useState('');

  async function* load(signerUuid: string) {
    while (true) {
      try {
        yield await (props.setupToken
          ? await fetch('/integrations/credentials/wrapcast/test-action', {
              method: 'POST',
              body: JSON.stringify({
                setupToken: props.setupToken,
                action: 'signer-status',
                signerUuid,
              }),
            })
          : await fetch(
              `/auth/farcaster/signer?signerUuid=${encodeURIComponent(
                signerUuid
              )}`
            )
        ).json();
      } catch (err) {
        // network blip, keep polling until approved or timed out
        yield {};
      }
    }
  }

  const poll = async (signerUuid: string) => {
    activeSigner.current = signerUuid;
    const startedAt = Date.now();
    const generator = load(signerUuid);
    for await (const data of generator) {
      if (activeSigner.current !== signerUuid) {
        return;
      }
      if (data.status === 'approved') {
        login(data.code);
        return;
      }
      if (data.status === 'revoked') {
        toaster.show(
          t(
            'farcaster_signer_revoked',
            'The Farcaster approval was revoked, please try again'
          ),
          'warning'
        );
        onFail();
        return;
      }
      if (Date.now() - startedAt > 10 * 60 * 1000) {
        toaster.show(
          t(
            'farcaster_approval_timeout',
            'Farcaster approval timed out, please try again'
          ),
          'warning'
        );
        onFail();
        return;
      }
      await timer(2000);
    }
  };

  const start = async () => {
    try {
      const data = await (
        await fetch(
          props.setupToken
            ? '/integrations/credentials/wrapcast/test-action'
            : '/auth/farcaster/signer',
          {
            method: 'POST',
            ...(props.setupToken
              ? {
                  body: JSON.stringify({
                    setupToken: props.setupToken,
                    action: 'create-signer',
                  }),
                }
              : {}),
          }
        )
      ).json();
      if (!data.approvalUrl) {
        toaster.show(
          data.error ||
            t(
              'farcaster_signer_failed',
              'Failed to start the Farcaster connection'
            ),
          'warning'
        );
        onFail();
        return;
      }
      setApprovalUrl(data.approvalUrl);
      setQrCode(data.qrCode);
      poll(data.signerUuid);
    } catch (err) {
      toaster.show(
        t(
          'farcaster_signer_failed',
          'Failed to start the Farcaster connection'
        ),
        'warning'
      );
      onFail();
    }
  };

  const copyLink = useCallback(() => {
    copy(approvalUrl);
    toaster.show(
      t('link_copied_to_clipboard', 'Link copied to clipboard'),
      'success'
    );
  }, [approvalUrl]);

  useEffect(() => {
    start();
    return () => {
      activeSigner.current = '';
    };
  }, []);

  if (!approvalUrl) {
    return (
      <div className="flex justify-center py-[20px]">
        <Loading width={40} height={40} />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-[12px] py-[20px] text-center">
      <img
        src={qrCode}
        alt=""
        className="w-[200px] h-[200px] rounded-[8px] bg-white"
      />
      <div className="max-w-[400px]">
        {t(
          'farcaster_scan_instructions',
          'Scan the QR code with your phone, or copy the link and open it on your phone, then approve SM-IT in the Farcaster app.'
        )}
      </div>
      <Button onClick={copyLink}>
        {t('farcaster_copy_link', 'Copy Farcaster link')}
      </Button>
      <div className="flex items-center gap-[8px] text-sm opacity-70">
        <Loading width={20} height={20} />
        {t('farcaster_waiting_for_approval', 'Waiting for your approval...')}
      </div>
    </div>
  );
};
