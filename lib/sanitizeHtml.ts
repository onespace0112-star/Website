const EVENT_HANDLER_ATTR = /\s+on[a-z][a-z0-9]*\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi
const JS_PROTOCOL = /\s(href|src|action)\s*=\s*(["'])\s*javascript:[\s\S]*?\2/gi
const VBSCRIPT_PROTOCOL = /\s(href|src|action)\s*=\s*(["'])\s*vbscript:[\s\S]*?\2/gi
const DATA_HTML_PROTOCOL = /\s(href|src|action)\s*=\s*(["'])\s*data:text\/html[\s\S]*?\2/gi
const SCRIPT_TAG = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi
const IFRAME_TAG = /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi
const OBJECT_TAG = /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi
const EMBED_TAG = /<embed\b[^>]*>/gi
const BASE_TAG = /<base\b[^>]*>/gi
const META_REFRESH_TAG = /<meta\b[^>]*http-equiv\s*=\s*["']?\s*refresh\s*["']?[^>]*>/gi
const CSS_EXPRESSION = /expression\s*\([\s\S]*?\)/gi

export function sanitizeHtml(input: string): string {
  if (!input) return ''

  return input
    .replace(SCRIPT_TAG, '')
    .replace(IFRAME_TAG, '')
    .replace(OBJECT_TAG, '')
    .replace(EMBED_TAG, '')
    .replace(BASE_TAG, '')
    .replace(META_REFRESH_TAG, '')
    .replace(EVENT_HANDLER_ATTR, '')
    .replace(JS_PROTOCOL, ' $1="#"')
    .replace(VBSCRIPT_PROTOCOL, ' $1="#"')
    .replace(DATA_HTML_PROTOCOL, ' $1="#"')
    .replace(CSS_EXPRESSION, '')
}

