'use client';

import React, { ReactNode, useCallback, useEffect, useState } from 'react';
import { Logo } from '@tl_smp/frontend/components/new-layout/logo';
import { inter } from '@tl_smp/frontend/fonts/inter/inter.font';
const ModeComponent = dynamic(
  () => import('@tl_smp/frontend/components/layout/mode.component'),
  {
    ssr: false,
  }
);

import clsx from 'clsx';
import dynamic from 'next/dynamic';
import { useFetch } from '@tl_smp/helpers/utils/custom.fetch';
import { useVariables } from '@tl_smp/react/helpers/variable.context';
import { usePathname, useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { CheckPayment } from '@tl_smp/frontend/components/layout/check.payment';
import { ToolTip } from '@tl_smp/frontend/components/layout/top.tip';
import { ShowMediaBoxModal } from '@tl_smp/frontend/components/media/media.component';
import { ShowLinkedinCompany } from '@tl_smp/frontend/components/launches/helpers/linkedin.component';
import { MediaSettingsLayout } from '@tl_smp/frontend/components/launches/helpers/media.settings.component';
import { Toaster } from '@tl_smp/react/toaster/toaster';
import { ShowPostSelector } from '@tl_smp/frontend/components/post-url-selector/post.url.selector';
import { NewSubscription } from '@tl_smp/frontend/components/layout/new.subscription';
import { ContinueProvider } from '@tl_smp/frontend/components/layout/continue.provider';
import { ContextWrapper } from '@tl_smp/frontend/components/layout/user.context';
import { CopilotKit } from '@copilotkit/react-core';
import { MantineWrapper } from '@tl_smp/react/helpers/mantine.wrapper';
import { Impersonate } from '@tl_smp/frontend/components/layout/impersonate';
import { AnnouncementBanner } from '@tl_smp/frontend/components/layout/announcement.banner';
import { Title } from '@tl_smp/frontend/components/layout/title';
import { TopMenu } from '@tl_smp/frontend/components/layout/top.menu';
import NotificationComponent from '@tl_smp/frontend/components/notifications/notification.component';
import { OrganizationSelector } from '@tl_smp/frontend/components/layout/organization.selector';
import { InvoicesComponent } from '@tl_smp/frontend/components/layout/invoices.component';
import { StreakComponent } from '@tl_smp/frontend/components/layout/streak.component';
import { PreConditionComponent } from '@tl_smp/frontend/components/layout/pre-condition.component';
import { FirstBillingComponent } from '@tl_smp/frontend/components/billing/first.billing.component';
import { setSentryUser } from '@tl_smp/react/sentry/initialize.sentry.client';
import { setUserTimezone } from '@tl_smp/frontend/components/layout/set.timezone';

export const LayoutComponent = ({ children }: { children: ReactNode }) => {
  const fetch = useFetch();

  const { backendUrl, billingEnabled, isGeneral } = useVariables();

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);
  const load = useCallback(async (path: string) => {
    const response = await fetch(path);
    if (!response.ok) throw new Error('Unable to load your workspace');
    return response.json();
  }, []);
  const {
    data: user,
    error,
    mutate,
  } = useSWR('/user/self', load, {
    // set before anything renders a date in the user's timezone
    onSuccess: (data) => setUserTimezone(data?.timezoneName),
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateIfStale: false,
    refreshWhenOffline: false,
    refreshWhenHidden: false,
  });

  useEffect(() => {
    setSentryUser(
      user ? { id: user.id, email: user.email, orgId: user.orgId } : null
    );
  }, [user]);

  useEffect(() => {
    if (!menuOpen) return;
    const sidebar = document.getElementById('left-menu');
    const focusable = () =>
      Array.from(
        sidebar?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled])'
        ) || []
      );
    focusable()[0]?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        const items = focusable();
        const first = items[0];
        const last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
      if (event.key === 'Escape') {
        setMenuOpen(false);
        document
          .querySelector<HTMLButtonElement>('[aria-controls="left-menu"]')
          ?.focus();
      }
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [menuOpen]);

  if (error)
    return (
      <div className="app-loading" role="alert">
        <img src="/logo.svg" width="56" height="56" alt="" />
        <h1>We couldn’t open your studio</h1>
        <p>Check that the local services are running, then try again.</p>
        <button className="studio-primary" onClick={() => mutate()}>
          Try again
        </button>
      </div>
    );

  if (!user)
    return (
      <div className="app-loading" role="status">
        <img src="/logo.svg" width="56" height="56" alt="" />
        <p>Opening your studio…</p>
      </div>
    );

  return (
    <ContextWrapper user={user}>
      <CopilotKit
        credentials="include"
        runtimeUrl={backendUrl + '/copilot/chat'}
        useSingleEndpoint={true}
        showDevConsole={false}
        enableInspector={false}
      >
        <MantineWrapper>
          <ToolTip />
          <Toaster />
          <CheckPayment check={searchParams.get('check') || ''} mutate={mutate}>
            <ShowMediaBoxModal />
            <ShowLinkedinCompany />
            <MediaSettingsLayout />
            <ShowPostSelector />
            <PreConditionComponent />
            <NewSubscription />
            <ContinueProvider />
            <div
              className={clsx(
                'app-shell flex flex-col min-h-screen text-newTextColor',
                inter.className
              )}
            >
              <div>{user?.admin ? <Impersonate /> : <div />}</div>
              {user.tier === 'FREE' && isGeneral && billingEnabled ? (
                <FirstBillingComponent />
              ) : (
                <>
                  <a className="skip-link" href="#main-content">
                    Skip to content
                  </a>
                  <AnnouncementBanner />
                  <div className="app-frame flex-1 flex">
                    {menuOpen && (
                      <div
                        className="hidden mobile:block fixed inset-0 bg-newBackdrop opacity-60 z-[490]"
                        onClick={() => setMenuOpen(false)}
                      />
                    )}
                    <div
                      className={clsx(
                        'app-sidebar flex flex-col bg-newBgColorInner mobile:fixed mobile:top-0 mobile:bottom-0 mobile:start-0 mobile:z-[491] mobile:overflow-y-auto',
                        !menuOpen && 'mobile:hidden'
                      )}
                      onClick={(event) => {
                        if ((event.target as HTMLElement).closest('a'))
                          setMenuOpen(false);
                      }}
                    >
                      <div
                        id="left-menu"
                        className={clsx(
                          'app-sidebar-inner flex flex-1',
                          user?.admin && 'pt-[52px] max-h-[1000px]:w-[500px]'
                        )}
                      >
                        <div className="app-sidebar-content flex flex-col flex-1">
                          <div className="flex items-center justify-between">
                            <Logo />
                            <button
                              className="app-menu-close app-icon-button"
                              aria-label="Close menu"
                              onClick={() => setMenuOpen(false)}
                            >
                              ✕
                            </button>
                          </div>
                          <nav
                            aria-label="Main navigation"
                            className="app-navigation"
                          >
                            <TopMenu />
                          </nav>
                          <div className="app-sidebar-footer">
                            Plan. Create. Publish.
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="app-workspace flex-1 min-w-0 bg-newBgLineColor overflow-hidden flex flex-col gap-[1px] blurMe">
                      {/* relative: the notifications popup spans this bar on phones */}
                      <div className="app-topbar relative flex bg-newBgColorInner px-[28px] mobile:px-[16px] gap-[12px] items-center">
                        <button
                          className="hidden mobile:flex items-center justify-center w-[36px] h-[36px] -ms-[6px] rounded-[8px] text-textItemBlur hover:text-newTextColor hover:bg-boxFocused"
                          onClick={() => setMenuOpen(true)}
                          aria-label="Open menu"
                          aria-expanded={menuOpen}
                          aria-controls="left-menu"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="22"
                            height="22"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path
                              d="M3 6H21M3 12H21M3 18H21"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                            />
                          </svg>
                        </button>
                        <div className="flex flex-1 min-w-0 flex-col gap-[3px]">
                          <span className="app-eyebrow mobile:hidden">
                            WORKSPACE
                          </span>
                          <Title />
                        </div>
                        <div className="flex gap-[20px] mobile:gap-[14px] mobile:items-center text-textItemBlur">
                          <StreakComponent />
                          <div className="w-[1px] h-[20px] bg-blockSeparator mobile:hidden" />
                          <OrganizationSelector />
                          <InvoicesComponent />
                          <div className="hover:text-newTextColor">
                            <ModeComponent />
                          </div>
                          <NotificationComponent />
                        </div>
                      </div>
                      <main
                        id="main-content"
                        tabIndex={-1}
                        className="app-main flex flex-1 min-w-0 gap-[1px] mobile:flex-col"
                      >
                        {children}
                      </main>
                    </div>
                  </div>
                </>
              )}
            </div>
          </CheckPayment>
        </MantineWrapper>
      </CopilotKit>
    </ContextWrapper>
  );
};
