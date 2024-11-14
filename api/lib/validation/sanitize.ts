import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

// Allowed HTML tags and attributes
const ALLOWED_TAGS = [
  'p', 'br', 'b', 'i', 'em', 'strong', 'a', 'ul', 'ol', 'li',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre'
];

const ALLOWED_ATTR = ['href', 'target', 'rel', 'class'];

// URL schemes that are allowed
const ALLOWED_SCHEMES = ['http:', 'https:', 'mailto:', 'tel:'];

// Sanitize HTML content
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|xxx):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    ALLOW_UNKNOWN_PROTOCOLS: false,
    RETURN_DOM_FRAGMENT: false,
    RETURN_DOM: false,
    SANITIZE_DOM: true,
    USE_PROFILES: { html: true }
  });
}

// Sanitize a complete content object
export function sanitizeContent(content: any): any {
  if (!content || typeof content !== 'object') return content;

  // Deep clone to avoid modifying the original
  const sanitized = Array.isArray(content) ? [...content] : { ...content };

  // Sanitize blocks
  if (Array.isArray(sanitized.blocks)) {
    sanitized.blocks = sanitized.blocks.map((block: any) => {
      if (!block || typeof block !== 'object') return block;

      // Handle different block types
      switch (block.type) {
        case 'text':
          if (typeof block.data?.text === 'string') {
            return {
              ...block,
              data: {
                ...block.data,
                text: sanitizeHtml(block.data.text)
              }
            };
          }
          break;

        case 'list':
          if (Array.isArray(block.data?.items)) {
            return {
              ...block,
              data: {
                ...block.data,
                items: block.data.items.map((item: string) => 
                  typeof item === 'string' ? sanitizeHtml(item) : item
                )
              }
            };
          }
          break;

        case 'quote':
          if (typeof block.data?.text === 'string') {
            return {
              ...block,
              data: {
                ...block.data,
                text: sanitizeHtml(block.data.text)
              }
            };
          }
          break;
      }

      return block;
    });
  }

  // Sanitize title and description
  if (typeof sanitized.title === 'string') {
    sanitized.title = sanitizeHtml(sanitized.title);
  }

  if (typeof sanitized.description === 'string') {
    sanitized.description = sanitizeHtml(sanitized.description);
  }

  return sanitized;
}

// Validate and sanitize URLs
export function sanitizeUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (!ALLOWED_SCHEMES.includes(parsed.protocol)) {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}