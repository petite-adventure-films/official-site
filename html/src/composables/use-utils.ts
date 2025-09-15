export const useGetYouTubeId = (input: string): string | null => {
  if (
    input &&
    (input.includes('/') ||
      input.includes('youtube.com') ||
      input.includes('youtu.be'))
  ) {
    const regex =
      // eslint-disable-next-line no-useless-escape
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const match = input.match(regex);
    return match && match[1] ? match[1] : null;
  } else {
    if (input && input.length === 11) {
      return input;
    }
  }
  return null;
};
