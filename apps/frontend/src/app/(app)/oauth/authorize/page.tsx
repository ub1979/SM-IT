import { OAuthAuthorize } from '@tl_smp/frontend/components/oauth/authorize.component';

export const dynamic = 'force-dynamic';

export default async function OAuthAuthorizePage() {
  return <OAuthAuthorize />;
}
