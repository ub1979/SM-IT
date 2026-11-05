'use client';

import { FC } from 'react';
import {
  PostComment,
  withProvider,
} from '@tl_smp/frontend/components/new-launch/providers/high.order.provider';
import { YoutubeSettingsDto } from '@tl_smp/nestjs-libraries/dtos/posts/providers-settings/youtube.settings.dto';
import { useSettings } from '@tl_smp/frontend/components/launches/helpers/use.values';
import { Input } from '@tl_smp/react/form/input';
import { MediumTags } from '@tl_smp/frontend/components/new-launch/providers/medium/medium.tags';
import { useWatch } from 'react-hook-form';
import { useT } from '@tl_smp/react/translation/get.transation.service.client';
import { Select } from '@tl_smp/react/form/select';
import { YoutubePreview } from '@tl_smp/frontend/components/new-launch/providers/youtube/youtube.preview';
const type = [
  {
    label: 'Public',
    value: 'public',
  },
  {
    label: 'Private',
    value: 'private',
  },
  {
    label: 'Unlisted',
    value: 'unlisted',
  },
];

const madeForKids = [
  {
    label: 'No, it is not made for kids',
    value: 'no',
  },
  {
    label: 'Yes, it is made for kids',
    value: 'yes',
  },
];
const YoutubeSettings: FC = () => {
  const t = useT();
  const { register, control, setValue } = useSettings();
  // the thumbnail is set from the media settings now, older posts may still
  // carry one here, and it wins over the media thumbnail
  const visibility = useWatch({ control, name: 'type' }) || 'public';
  const thumbnail = useWatch({ control, name: 'thumbnail' });
  return (
    <div className="flex flex-col gap-[8px]">
      <div className="mb-[8px] text-[13px] leading-[1.6] text-textItemBlur">
        These settings apply to the YouTube upload. Write its description in the
        large text editor; enter its title below.
      </div>
      <Input
        label="Video title (required)"
        aria-label="YouTube video title"
        {...register('title')}
        maxLength={100}
        placeholder="Enter the title viewers will see on YouTube"
      />
      <Select
        label="Visibility"
        aria-label="YouTube visibility"
        {...register('type', {
          value: 'public',
        })}
      >
        {type.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </Select>
      <p className="text-[12px] text-textItemBlur mb-[8px]">
        {visibility === 'private'
          ? 'Private: restricted viewing on YouTube; it will not appear publicly on your channel.'
          : visibility === 'unlisted'
          ? 'Unlisted: anyone with the video link can watch it.'
          : 'Public: anyone can watch it, and it can appear on your channel and in search.'}
      </p>
      <Select
        label="Is this video made for kids?"
        aria-label="Is this video made for kids?"
        {...register('selfDeclaredMadeForKids', {
          value: 'no',
        })}
      >
        {madeForKids.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </Select>
      <p className="text-[12px] text-textItemBlur mb-[8px]">
        Choose the audience setting that accurately describes the video.
      </p>
      <MediumTags label="Video tags (optional)" {...register('tags')} />
      <p className="text-[12px] text-textItemBlur">
        Add keywords, pressing Enter after each tag. Tags are separate from the
        description.
      </p>
      {!!thumbnail?.path && (
        <div className="mt-[20px] flex items-center gap-[10px] text-[12px]">
          <div className="flex-1">
            {t(
              'youtube_thumbnail_overrides_media',
              'This post has a YouTube-specific thumbnail, which overrides the thumbnail set in the media settings.'
            )}
          </div>
          <div
            onClick={() =>
              setValue('thumbnail', undefined, { shouldDirty: true })
            }
            className="cursor-pointer text-[#FF3F3F] font-[600]"
          >
            {t('remove', 'Remove')}
          </div>
        </div>
      )}
    </div>
  );
};
export default withProvider({
  postComment: PostComment.COMMENT,
  comments: false,
  minimumCharacters: [],
  SettingsComponent: YoutubeSettings,
  CustomPreviewComponent: YoutubePreview,
  dto: YoutubeSettingsDto,
  maximumCharacters: 5000,
});
