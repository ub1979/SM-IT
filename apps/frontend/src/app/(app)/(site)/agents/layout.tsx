import { Metadata } from 'next';
import { Agent } from '@tl_smp/frontend/components/agents/agent';
export const metadata: Metadata = {
  title: 'SM-IT - Agent',
  description: 'agents',
};
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Agent>{children}</Agent>;
}
