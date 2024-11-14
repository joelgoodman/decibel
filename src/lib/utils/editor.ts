export function generateBlockId(): string {
  return 'block_' + Math.random().toString(36).substr(2, 9);
}

export function sanitizeHtml(html: string): string {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.innerText;
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}