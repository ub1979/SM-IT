export function postTextLabel(identifier?: string): string {
  if (identifier === 'youtube') return 'YouTube video description';
  if (identifier === 'pinterest') return 'Pin description';
  if (['devto', 'hashnode', 'medium', 'wordpress'].includes(identifier || ''))
    return 'Article body';
  if (
    ['instagram', 'instagram-standalone', 'tiktok', 'tiktok-business'].includes(
      identifier || ''
    )
  )
    return 'Caption';
  return 'Post text';
}

export function postTextPlaceholder(identifier?: string): string {
  if (identifier === 'youtube')
    return 'Describe your video here. This text appears below the video on YouTube.';
  if (identifier === 'pinterest') return 'Describe this Pin…';
  if (postTextLabel(identifier) === 'Article body')
    return 'Write your article here. Set its title in the channel settings.';
  if (postTextLabel(identifier) === 'Caption')
    return 'Write the caption for your photo or video…';
  return 'Write the text for your post…';
}
