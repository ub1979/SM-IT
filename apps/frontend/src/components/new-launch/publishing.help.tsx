'use client';

import { useShallow } from 'zustand/react/shallow';
import { useLaunchStore } from './store';
import { postTextLabel } from '@tl_smp/helpers/utils/post-editor-copy';
import { useModals } from '@tl_smp/frontend/components/layout/new-modal';
import {
  MediaBox,
  mediaLibrarySize,
} from '@tl_smp/frontend/components/media/media.component';

export function PublishingHelp({
  onOpenSettings,
}: {
  onOpenSettings: (id?: string) => void;
}) {
  const modals = useModals();
  const { current, selected, customized } = useLaunchStore(
    useShallow((state) => ({
      current: state.current,
      selected: state.selectedIntegrations,
      customized: state.internal.some(
        (item) => item.integration.id === state.current
      ),
    }))
  );
  const active = selected.find(
    (item) => item.integration.id === current
  )?.integration;
  const effective =
    active || (selected.length === 1 ? selected[0].integration : undefined);
  const youtube = selected.find(
    (item) => item.integration.identifier === 'youtube'
  )?.integration;
  const showYoutube =
    effective?.identifier === 'youtube' || (current === 'global' && !!youtube);

  function chooseMedia() {
    modals.openModal({
      title: 'Photos & videos',
      fullScreen: true,
      size: mediaLibrarySize(),
      height: mediaLibrarySize(),
      children: (close) => (
        <MediaBox
          closeModal={close}
          type={effective?.identifier === 'youtube' ? 'video' : undefined}
          setMedia={(media) => {
            const state = useLaunchStore.getState();
            if (current === 'global') {
              state.appendGlobalValueMedia(0, media);
            } else {
              if (
                !state.internal.some((item) => item.integration.id === current)
              )
                state.addRemoveInternal(current);
              useLaunchStore
                .getState()
                .appendInternalValueMedia(current, 0, media);
            }
          }}
        />
      ),
    });
  }

  return (
    <section
      aria-label="Publishing help"
      className="rounded-[12px] border border-tableBorder bg-btnSimple p-[14px] text-[13px] leading-[1.6] flex flex-col gap-[10px]"
    >
      <div>
        <h2 className="font-semibold text-[15px]">
          {current === 'global' && selected.length > 1
            ? 'Shared text & media'
            : postTextLabel(effective?.identifier)}
        </h2>
        <p className="text-textItemBlur">
          {!selected.length
            ? 'Select a channel above to start.'
            : showYoutube
            ? 'The large text box below becomes your YouTube video description. Add one MP4 video, then set its title and visibility separately.'
            : 'Write your content below and attach the photos or videos needed by the selected platform.'}
        </p>
        {active && !customized && (
          <p className="mt-[6px] text-textItemBlur">
            This channel is using the shared text and media. Choose Customize
            this channel in the editor to give it its own version.
          </p>
        )}
        {customized && (
          <p className="mt-[6px] text-textItemBlur">
            You are editing this channel’s own text and media. Changes here do
            not change the shared version.
          </p>
        )}
      </div>
      <div className="flex flex-wrap gap-[8px]">
        {!!selected.length && (
          <button
            type="button"
            onClick={chooseMedia}
            className="rounded-[8px] bg-[#6d5cf5] px-[12px] py-[7px] font-medium text-white"
          >
            Photos & videos
          </button>
        )}
        {showYoutube && (
          <button
            type="button"
            onClick={() => onOpenSettings(youtube?.id)}
            className="self-start rounded-[8px] border border-tableBorder px-[12px] py-[7px] font-medium hover:bg-newBgColorInner"
          >
            YouTube title & visibility
          </button>
        )}
      </div>
      <details>
        <summary className="cursor-pointer font-medium">
          {showYoutube
            ? 'How to publish a YouTube video'
            : 'How to create and publish a post'}
        </summary>
        <ol className="list-decimal ps-[20px] mt-[10px] flex flex-col gap-[8px]">
          <li>
            Select the account(s) you want to publish to. Leave other accounts
            unselected if this upload is only for YouTube.
          </li>
          <li>
            {showYoutube
              ? 'Use Photos & videos to open the media library, choose Upload and select an MP4 file. You can also drag the file into the editor. Wait for uploading and processing to finish, then attach the video. This installation accepts up to 1 GB per upload session.'
              : 'Write your post text and use Photos & videos to upload or select media.'}
          </li>
          {showYoutube && (
            <>
              <li>
                Write the video description in the large text editor. It can
                include your summary, links and hashtags. The title is a
                separate field.
              </li>
              <li>
                Open YouTube title & visibility. Enter a Video title, choose
                Public, Private or Unlisted, and answer the audience question.
                Add video tags or a thumbnail if needed.
              </li>
            </>
          )}
          <li>
            Review each selected channel’s preview and settings. To use
            different text or media on one channel, open its tab and choose
            Customize this channel.
          </li>
          <li>
            Choose a date and time, then Schedule post. Publish now starts
            publishing immediately; Save draft keeps it in SM-IT without sending
            it to the platform.
          </li>
          <li>
            Check the result in Calendar. A queued post or an uploaded file is
            not yet a published video. Keep the local app and publishing worker
            running until it finishes.
          </li>
        </ol>
        {showYoutube && (
          <p className="mt-[10px] text-textItemBlur">
            For a first test, choose Private. SM-IT uploads at the selected
            time; YouTube processing and API restrictions may delay availability
            or limit visibility. Custom thumbnails depend on the channel’s
            YouTube eligibility.
          </p>
        )}
      </details>
      <details>
        <summary className="cursor-pointer font-medium">
          Is the same post sent to every platform?
        </summary>
        <div className="mt-[10px] flex flex-col gap-[10px]">
          <p>
            Selected channels start with shared text and media. Each channel has
            its own publishing format and settings. Customizing a channel copies
            the shared version; later shared edits do not change that custom
            version.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className="p-[6px]">Platform</th>
                  <th className="p-[6px]">What the text becomes</th>
                  <th className="p-[6px]">What to check separately</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-[6px]">YouTube</td>
                  <td className="p-[6px]">Video description</td>
                  <td className="p-[6px]">
                    One video, title, visibility, audience
                  </td>
                </tr>
                <tr>
                  <td className="p-[6px]">Instagram / TikTok</td>
                  <td className="p-[6px]">Caption</td>
                  <td className="p-[6px]">Media format and platform options</td>
                </tr>
                <tr>
                  <td className="p-[6px]">X / LinkedIn / Facebook</td>
                  <td className="p-[6px]">Post text</td>
                  <td className="p-[6px]">
                    Length, media and channel settings
                  </td>
                </tr>
                <tr>
                  <td className="p-[6px]">WordPress / DEV.to / Hashnode</td>
                  <td className="p-[6px]">Article body</td>
                  <td className="p-[6px]">Title and publication settings</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Review every channel before publishing. One channel can succeed
            while another fails; check each result before retrying.
          </p>
        </div>
      </details>
    </section>
  );
}
