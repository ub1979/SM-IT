export const dynamic = 'force-dynamic';
import { LaunchesComponent } from '@tl_smp/frontend/components/launches/launches.component';
import { Metadata } from 'next';
export const metadata: Metadata = {
  title: `SM-IT Calendar`,
  description: '',
};
export default async function Index() {
  return <LaunchesComponent />;
}
