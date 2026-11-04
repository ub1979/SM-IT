import { MediaLayoutComponent } from '@tl_smp/frontend/components/new-layout/layout.media.component';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: `SM-IT Media`,
  description: '',
};

export default async function Page() {
  return <MediaLayoutComponent />
}
