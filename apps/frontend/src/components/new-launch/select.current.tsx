'use client';

import { FC, RefObject, useCallback, useEffect, useRef, useState } from 'react';
import {
  SelectedIntegrations,
  useLaunchStore,
} from '@tl_smp/frontend/components/new-launch/store';
import clsx from 'clsx';
import SafeImage from '@tl_smp/react/helpers/safe.image';
import { useShallow } from 'zustand/react/shallow';
import { GlobalIcon } from '@tl_smp/frontend/components/ui/icons';
import { useT } from '@tl_smp/react/translation/get.transation.service.client';
import { Integrations } from '@tl_smp/frontend/components/launches/calendar.context';
import { useExistingData } from '@tl_smp/frontend/components/launches/helpers/use.existing.data';
import {
  useDecisionModal,
  useModals,
} from '@tl_smp/frontend/components/layout/new-modal';

export function useHasScroll(ref: RefObject<HTMLElement | null>): boolean {
  const [hasHorizontalScroll, setHasHorizontalScroll] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const checkScroll = () => {
      const el = ref.current;
      if (el) {
        setHasHorizontalScroll(el.scrollWidth > el.clientWidth);
      }
    };

    checkScroll(); // initial check

    const resizeObserver = new ResizeObserver(checkScroll);
    resizeObserver.observe(ref.current);

    const mutationObserver = new MutationObserver(checkScroll);
    mutationObserver.observe(ref.current, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [ref]);

  return hasHorizontalScroll;
}

export const SelectCurrent: FC = () => {
  const modals = useDecisionModal();
  const existingData = useExistingData();
  const {
    selectedIntegrations,
    current,
    setCurrent,
    locked,
    setHide,
    addOrRemoveSelectedIntegration,
  } = useLaunchStore(
    useShallow((state) => ({
      selectedIntegrations: state.selectedIntegrations,
      addOrRemoveSelectedIntegration: state.addOrRemoveSelectedIntegration,
      current: state.current,
      setCurrent: state.setCurrent,
      locked: state.locked,
      setHide: state.setHide,
    }))
  );

  const contentRef = useRef<HTMLDivElement>(null);
  const hasScroll = useHasScroll(contentRef);

  const removeSocial = useCallback(
    (sIntegration: Integrations) => async (e: any) => {
      e.stopPropagation();
      e.preventDefault();
      const open = await modals.open({
        title: 'Remove channel from this post',
        description:
          'Remove this channel from the current post? The connected account will stay linked.',
      });

      if (!open) {
        return;
      }

      addOrRemoveSelectedIntegration(sIntegration, {});
    },
    []
  );

  return (
    <>
      <div className="select-none left-0 absolute w-full z-[100] px-[20px] mobile:static mobile:px-0">
        <div
          ref={contentRef}
          className={clsx(
            'flex gap-[6px] mobile:gap-[4px] w-full overflow-x-auto scrollbar scrollbar-thumb-tableBorder scrollbar-track-secondary mobile:scrollbar-none',
            locked && 'opacity-50 pointer-events-none'
          )}
        >
          {/* an existing post opens on its channels, without the global mode */}
          {!existingData.integration && (
            <button
              type="button"
              aria-pressed={current === 'global'}
              aria-label="Edit shared content"
              onClick={() => {
                setHide(true);
                setCurrent('global');
              }}
              className={clsx(
                'cursor-pointer flex gap-[8px] rounded-[12px] px-[12px] shrink-0 h-[40px] mobile:min-w-[44px] mobile:h-[44px] mobile:shrink-0 justify-center items-center bg-newBgLineColor mobile:bg-newSettings',
                current !== 'global'
                  ? 'text-[#A3A3A3]'
                  : 'border mobile:border-[1.5px] border-[#8b7cff] text-[#8b7cff]'
              )}
            >
              <div>
                <GlobalIcon className="mobile:w-[24px] mobile:h-[24px]" />
              </div>
              <span className="text-[13px] font-medium">Shared content</span>
            </button>
          )}
          {selectedIntegrations.map(({ integration }) => (
            <div
              role="button"
              tabIndex={0}
              aria-label={`Edit ${integration.identifier} channel: ${integration.name}`}
              aria-pressed={current === integration.id}
              onKeyDown={(event) => {
                if (event.target !== event.currentTarget) return;
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  setHide(true);
                  setCurrent(integration.id);
                }
              }}
              onClick={() => {
                setHide(true);
                setCurrent(integration.id);
              }}
              key={integration.id}
              className={clsx(
                'border mobile:border-[1.5px] cursor-pointer relative flex gap-[8px] px-[8px] shrink-0 min-w-[40px] h-[40px] mobile:min-w-[44px] mobile:h-[44px] mobile:shrink-0 rounded-[12px] items-center bg-newBgLineColor mobile:bg-newSettings justify-center',
                current === integration.id
                  ? 'border-[#8b7cff] text-[#8b7cff]'
                  : 'border-transparent'
              )}
            >
              {/* an existing post keeps its channels, each with its own content */}
              {!existingData.integration && (
                <>
                  <button
                    type="button"
                    aria-label={`Remove ${integration.name} from this post`}
                    onClick={removeSocial(integration)}
                    className="absolute justify-center items-center flex mobile:hidden w-[8px] h-[8px] -top-[1px] -start-[3px] bg-red-500 rounded-full text-white text-[8px]"
                  >
                    ×
                  </button>
                  <IsGlobal id={integration.id} />
                </>
              )}
              <div
                {...{
                  'data-tooltip-id': 'tooltip',
                  'data-tooltip-content': integration.name,
                }}
                className={clsx(
                  'relative w-full h-full rounded-full flex justify-center items-center filter transition-all duration-500'
                )}
              >
                <SafeImage
                  src={integration.picture || '/no-picture.jpg'}
                  className="rounded-full min-w-[26px]"
                  alt={integration.identifier}
                  width={26}
                  height={26}
                  onError={(e) => {
                    e.currentTarget.src = '/no-picture.jpg';
                    e.currentTarget.srcset = '/no-picture.jpg';
                  }}
                />
                {integration.identifier === 'youtube' ? (
                  <img
                    src="/icons/platforms/youtube.svg"
                    className="absolute z-10 bottom-[2px] end-[2px] min-w-[12px]"
                    width={12}
                  />
                ) : (
                  <SafeImage
                    src={`/icons/platforms/${integration.identifier}.png`}
                    className="min-w-[12px] min-h-[12px] rounded-[3px] absolute z-10 bottom-[6px] end-[6px]"
                    alt={integration.identifier}
                    width={12}
                    height={12}
                  />
                )}
              </div>
              <span className="max-w-[110px] truncate text-[13px] font-medium">
                {integration.name}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div
        className={clsx(hasScroll ? 'h-[55px]' : 'h-[40px]', 'mobile:hidden')}
      />
    </>
  );
};

export const IsGlobal: FC<{ id: string }> = ({ id }) => {
  const t = useT();
  const { isInternal } = useLaunchStore(
    useShallow((state) => ({
      isInternal: !!state.internal.find((p) => p.integration.id === id),
    }))
  );

  if (!isInternal) {
    return null;
  }

  return (
    <div
      data-tooltip-id="tooltip"
      data-tooltip-content={t(
        'no_longer_global_mode',
        'Custom content for this channel'
      )}
      className="w-[8px] h-[8px] bg-[#8b7cff] -top-[1px] -end-[3px] absolute rounded-full"
    />
  );
};
