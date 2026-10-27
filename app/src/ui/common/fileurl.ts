/** URL for showing a local file (image/font/sound) inside the renderer. */
export function fileUrl(path: string, bust?: number | string): string {
  return 'swfile://local/' + encodeURIComponent(path) + (bust !== undefined ? '?v=' + bust : '');
}
