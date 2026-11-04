export const dynamic = 'force-dynamic';
import { Metadata } from 'next';
import { PlatformAnalytics } from '@tl_smp/frontend/components/platform-analytics/platform.analytics';
export const metadata: Metadata = {
  title: `SM-IT Analytics`,
  description: '',
};
export default async function Index() {
  return <PlatformAnalytics />;
}
