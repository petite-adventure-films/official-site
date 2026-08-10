export function getYouTubeId(value: string): string | null {
  if (/^[\w-]{11}$/.test(value)) return value;

  const match = value.match(
    /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:embed\/|shorts\/|watch\?(?:.*&)?v=))([\w-]{11})/i,
  );
  return match?.[1] ?? null;
}
