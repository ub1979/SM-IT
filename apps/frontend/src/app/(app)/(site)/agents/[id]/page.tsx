import { Metadata } from 'next';
import { Agent } from '@tl_smp/frontend/components/agents/agent';
import { AgentChat } from '@tl_smp/frontend/components/agents/agent.chat';
export const metadata: Metadata = {
  title: 'SM-IT - Agent',
  description: '',
};
export default async function Page() {
  return (
    <AgentChat />
  );
}
