/**
 * Copies text to clipboard using the modern Navigator Clipboard API,
 * with an automatic graceful fallback to document.execCommand('copy').
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) return false;

  // Modern Async Clipboard API
  if (navigator?.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn('Navigator clipboard API failed, attempting fallback...', err);
    }
  }

  // Graceful fallback for non-secure contexts or legacy browsers
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    textArea.setAttribute('readonly', '');
    document.body.appendChild(textArea);
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (fallbackError) {
    console.error('Clipboard fallback also failed:', fallbackError);
    return false;
  }
}
