# Create, schedule and publish content

Linking an account authorizes SM-IT to publish. It does not upload a video or create a post by itself. Start in **Calendar > Create Post**.

## Publish a YouTube video

1. **Choose the destination.** Select your YouTube channel by name at the top of the editor. For a YouTube-only upload, leave other accounts unselected.
2. **Attach the video.** Choose **Photos & videos**, then **Upload**. Pick an MP4 file from your computer. Wait for uploading and processing to finish, then choose the uploaded video to attach it. You can also drag a video file into the editor. The current YouTube connector needs exactly **one MP4 video**; the local uploader has a **1 GB per-session limit**. Uploading into the media library only stores the file in SM-IT; it has not been sent to YouTube yet.
3. **Write the description.** Use the large editor labelled **YouTube video description**. This text is sent to YouTube as the description under the video. Add a summary, links and hashtags here if wanted. You do not need to repeat the title in this box.
4. **Set the title and visibility.** Choose **YouTube title & visibility**. Enter a **Video title** (required, 2–100 characters in this connector). Choose **Visibility**, answer **Is this video made for kids?**, and optionally add video tags. Choose **Back to content** to return to the description editor.
5. **Choose a thumbnail if needed.** After attaching a video, use its media settings or **Thumbnails & alt text** to choose a thumbnail. YouTube eligibility determines whether a custom thumbnail can be used. A legacy YouTube-specific thumbnail, if present, overrides the media thumbnail until removed.
6. **Review before sending.** Check the selected channel, title, description, video, visibility and audience setting. A preview is an approximation, not proof that YouTube has accepted the upload.
7. **Choose when to publish.** Set the date and time and choose **Schedule post**. To start immediately, open the arrow beside the scheduling button and choose **Publish now**. **Save draft** keeps the work in SM-IT and does not send it to YouTube.
8. **Check the result.** Return to Calendar to check the post's status and any publishing error. When successful, check the resulting video in YouTube Studio. Keep the backend, publishing worker and local services running until the scheduled job completes. SM-IT starts the upload at the chosen time; YouTube processing can make the video available later.

### Visibility

- **Private:** restricted viewing on YouTube. This is a useful setting for a first upload test; do not expect a public video on the channel.
- **Unlisted:** anyone with the video link can watch it.
- **Public:** the video is publicly viewable and may appear on the channel and in search.

Google's API-project approval, upload audits, quotas and channel eligibility can still restrict the result. A successful connection does not remove those restrictions. See [YouTube video metadata](https://developers.google.com/youtube/v3/docs/videos) and [upload restrictions](https://developers.google.com/youtube/v3/docs/videos/insert).

## Is a post the same across social platforms?

SM-IT provides one composer, but each platform receives its own publishing request. You can reuse text and media, customize them per channel, and set the options that only that platform supports.

| Destination | What the large text editor becomes | Separate details to review |
| --- | --- | --- |
| YouTube | Video description | One MP4 video, title, visibility, audience, optional thumbnail/tags |
| Instagram | Photo/video caption | Supported media and Instagram publishing options |
| TikTok | Caption/post text used by its publishing flow | Video/photo format and TikTok options |
| X, LinkedIn, Facebook | Post text | Platform length limits, supported attachments and channel options |
| Pinterest | Pin description | Board, media, title/link settings |
| WordPress, DEV.to, Hashnode | Article body | Title, publication and publishing options |

A YouTube description will not automatically make a good Instagram caption or short X post. Selecting all channels does not make one video compatible with every platform.

## Shared content and channel-specific content

- **Shared content** is the starting text and media for selected channels that have not been customized. Editing it updates those channels' inherited content.
- **A channel tab** lets you inspect that channel and its settings. If its editor says it uses shared content, choose **Customize this channel** to make an independent copy before editing. Selecting media using the help panel while on an inherited channel also creates its custom version.
- **Customizing** copies the shared text/media at that moment. Later shared changes do not overwrite the custom version, and custom edits do not change the shared version or another channel.
- **Use shared content again** discards that channel's custom text/media after confirmation and restores inheritance. It does not reset platform-specific settings such as a YouTube title.
- **Channel settings** are separate from the shared text/media. A YouTube title or visibility does not become a Facebook or Instagram setting.

## What happens when you press a button?

- **Photos & videos / Upload:** stores media in the local media library and lets you attach it. It does not publish it.
- **Save draft:** saves an editable draft in SM-IT.
- **Schedule post:** queues the selected channel versions for their scheduled times. A separate time may be configured for an individual channel.
- **Publish now:** starts publishing the chosen channel(s). For a multi-channel post, review any prompt about which channels will be sent.

One channel can publish successfully while another fails. Inspect the result for each channel before retrying so you do not duplicate a successful upload.

## If something fails

- **No publish action available:** select a destination channel, and wait for any media upload to finish.
- **Missing YouTube title:** open **YouTube title & visibility** and fill in Video title.
- **Wrong media:** attach one MP4 video for the current YouTube connector. Extra images or multiple video attachments can cause validation to fail.
- **Description is wrong on one channel:** inspect that channel's custom version. It may no longer inherit shared changes.
- **Video is private or not available immediately:** check Visibility, API upload restrictions, the job's status and YouTube processing in Studio.
- **Scheduled job does not run:** check that the local services, backend and publishing worker are running and that the displayed date/time is correct.
