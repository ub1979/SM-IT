import { FC } from 'react';
import { Web3ProviderInterface } from '@tl_smp/frontend/components/launches/web3/web3.provider.interface';
import { WrapcasterProvider } from '@tl_smp/frontend/components/launches/web3/providers/wrapcaster.provider';
import { TelegramProvider } from '@tl_smp/frontend/components/launches/web3/providers/telegram.provider';
import { MoltbookProvider } from '@tl_smp/frontend/components/launches/web3/providers/moltbook.provider';
export const web3List: {
  identifier: string;
  component: FC<Web3ProviderInterface>;
}[] = [
  {
    identifier: 'telegram',
    component: TelegramProvider,
  },
  {
    identifier: 'wrapcast',
    component: WrapcasterProvider,
  },
  {
    identifier: 'moltbook',
    component: MoltbookProvider,
  },
];
