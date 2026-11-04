'use client';

import {
  PostComment,
  withProvider,
} from '@tl_smp/frontend/components/new-launch/providers/high.order.provider';
import { Input } from '@tl_smp/react/form/input';
import { useSettings } from '@tl_smp/frontend/components/launches/helpers/use.values';
import { TumblrDto } from '@tl_smp/nestjs-libraries/dtos/posts/providers-settings/tumblr.dto';

const TumblrSettings = () => {
  const form = useSettings();

  return (
    <>
      <Input label="Title" {...form.register('title')} />
      <Input label="Link URL" {...form.register('link')} />
      <Input label="Source URL" {...form.register('sourceUrl')} />
      <Input label="Tags" {...form.register('tags')} />
    </>
  );
};

export default withProvider({
  comments: false,
  postComment: PostComment.POST,
  minimumCharacters: [],
  SettingsComponent: TumblrSettings,
  CustomPreviewComponent: undefined,
  dto: TumblrDto,
  maximumCharacters: 32768,
});
