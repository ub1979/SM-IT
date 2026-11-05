import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import dayjs from 'dayjs';
vi.mock('@tl_smp/frontend/components/layout/set.timezone', () => ({
  newDayjs: (...args: any[]) => dayjs(...args),
}));
import { useLaunchStore } from '../../apps/frontend/src/components/new-launch/store';

beforeEach(() => {
  useLaunchStore.getState().reset();
  useLaunchStore.setState({
    selectedIntegrations: [
      {
        integration: {
          id: 'youtube-test',
          identifier: 'youtube',
          name: 'Test channel',
        },
        settings: {},
      },
      {
        integration: {
          id: 'other-test',
          identifier: 'facebook',
          name: 'Other channel',
        },
        settings: {},
      },
    ] as any,
    global: [
      {
        id: 'main-post',
        content: 'Shared description',
        media: [{ id: 'shared-video', path: '/fixture-shared.mp4' }],
        delay: 0,
      },
    ],
  });
});
afterEach(() => useLaunchStore.getState().reset());

describe('Independent versions of a multi-channel post', () => {
  it('keeps a customized YouTube description independent of later shared edits', () => {
    useLaunchStore.getState().addRemoveInternal('youtube-test');
    useLaunchStore
      .getState()
      .setInternalValueText('youtube-test', 0, 'YouTube-only description');
    useLaunchStore.getState().setGlobalValueText(0, 'Updated shared caption');
    expect(
      useLaunchStore.getState().internal[0].integrationValue[0].content
    ).toBe('YouTube-only description');
    expect(useLaunchStore.getState().global[0].content).toBe(
      'Updated shared caption'
    );
    expect(
      useLaunchStore
        .getState()
        .internal.some((item) => item.integration.id === 'other-test')
    ).toBe(false);
  });
  it('keeps a channel’s custom media independent of the shared attachments', () => {
    useLaunchStore.getState().addRemoveInternal('youtube-test');
    useLaunchStore
      .getState()
      .setInternalValueMedia('youtube-test', 0, [
        { id: 'youtube-video', path: '/fixture-youtube.mp4' },
      ]);
    useLaunchStore
      .getState()
      .appendGlobalValueMedia(0, [
        { id: 'other-photo', path: '/fixture-other.jpg' },
      ]);
    expect(
      useLaunchStore
        .getState()
        .internal[0].integrationValue[0].media.map((media) => media.id)
    ).toEqual(['youtube-video']);
    expect(
      useLaunchStore.getState().global[0].media.map((media) => media.id)
    ).toEqual(['shared-video', 'other-photo']);
  });
  it('restores inheritance without resetting the YouTube-specific settings', () => {
    useLaunchStore.setState((state) => ({
      selectedIntegrations: state.selectedIntegrations.map((item) =>
        item.integration.id === 'youtube-test'
          ? {
              ...item,
              settings: { title: 'Separate video title', type: 'private' },
            }
          : item
      ),
    }));
    useLaunchStore.getState().addRemoveInternal('youtube-test');
    useLaunchStore.getState().setInternalValueText('youtube-test', 0, 'Custom');
    useLaunchStore.getState().addRemoveInternal('youtube-test');
    expect(useLaunchStore.getState().internal).toEqual([]);
    expect(useLaunchStore.getState().global[0].content).toBe(
      'Shared description'
    );
    expect(useLaunchStore.getState().selectedIntegrations[0].settings).toEqual({
      title: 'Separate video title',
      type: 'private',
    });
  });
});
