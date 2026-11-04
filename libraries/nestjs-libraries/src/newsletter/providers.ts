import { BeehiivProvider } from '@tl_smp/nestjs-libraries/newsletter/providers/beehiiv.provider';
import { EmailEmptyProvider } from '@tl_smp/nestjs-libraries/newsletter/providers/email-empty.provider';
import { ListmonkProvider } from '@tl_smp/nestjs-libraries/newsletter/providers/listmonk.provider';

export const newsletterProviders = [
  new BeehiivProvider(),
  new ListmonkProvider(),
  new EmailEmptyProvider(),
];
