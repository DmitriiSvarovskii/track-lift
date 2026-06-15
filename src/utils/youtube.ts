export const getYouTubeEmbedUrl = (url?: string) => {
  if (!url) {
    return '';
  }

  try {
    const parsedUrl = new URL(url);
    const host = parsedUrl.hostname.replace(/^www\./, '');
    let videoId = '';

    if (host === 'youtu.be') {
      videoId = parsedUrl.pathname.slice(1);
    }

    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com') {
      if (parsedUrl.pathname === '/watch') {
        videoId = parsedUrl.searchParams.get('v') ?? '';
      } else if (parsedUrl.pathname.startsWith('/shorts/') || parsedUrl.pathname.startsWith('/embed/')) {
        videoId = parsedUrl.pathname.split('/')[2] ?? '';
      }
    }

    const cleanId = videoId.match(/^[a-zA-Z0-9_-]{6,}$/)?.[0] ?? '';
    return cleanId ? `https://www.youtube-nocookie.com/embed/${cleanId}` : '';
  } catch {
    return '';
  }
};
