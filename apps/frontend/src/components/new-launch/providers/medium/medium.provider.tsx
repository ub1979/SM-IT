'use client';

import { FC } from 'react';
import {
  PostComment,
  withProvider,
} from '@tl_smp/frontend/components/new-launch/providers/high.order.provider';
import { useSettings } from '@tl_smp/frontend/components/launches/helpers/use.values';
import { Input } from '@tl_smp/react/form/input';
import { MediumPublications } from '@tl_smp/frontend/components/new-launch/providers/medium/medium.publications';
import { MediumTags } from '@tl_smp/frontend/components/new-launch/providers/medium/medium.tags';
import { MediumSettingsDto } from '@tl_smp/nestjs-libraries/dtos/posts/providers-settings/medium.settings.dto';
import { useIntegration } from '@tl_smp/frontend/components/launches/helpers/use.integration';
import { Canonical } from '@tl_smp/react/form/canonical';

const MediumSettings: FC = () => {
  const form = useSettings();
  const { date } = useIntegration();
  return (
    <>
      <Input label="Title" {...form.register('title')} />
      <Input label="Subtitle" {...form.register('subtitle')} />
      <Canonical
        date={date}
        label="Canonical Link"
        {...form.register('canonical')}
      />
      <div>
        <MediumPublications {...form.register('publication')} />
      </div>
      <div>
        <MediumTags label="Topics" {...form.register('tags')} />
      </div>
    </>
  );
};
export default withProvider({
  postComment: PostComment.POST,
  minimumCharacters: [],
  SettingsComponent: MediumSettings,
  CustomPreviewComponent: undefined, //MediumPreview,
  dto: MediumSettingsDto,
  maximumCharacters: 100000,
});
