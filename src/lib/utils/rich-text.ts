import sanitizeHtml from 'sanitize-html';

/** The marker distinguishes formatted content from literal text containing angle brackets. */
export const RICH_TEXT_PREFIX = '<!--leget-rich-text:v1-->';
const tags = ['p', 'br', 'strong', 'em', 'u', 's', 'ul', 'ol', 'li', 'blockquote'];
const options: sanitizeHtml.IOptions = {
	allowedTags: tags,
	allowedAttributes: { ol: ['start'] },
	transformTags: {
		b: 'strong',
		i: 'em',
		strike: 's',
		div: 'p',
		ol: (_tag, attrs): sanitizeHtml.Tag => ({
			tagName: 'ol',
			attribs: /^\d{1,6}$/.test(attrs.start ?? '') ? { start: String(Number(attrs.start)) } : {}
		})
	}
};

export function escapeText(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

export function sanitizeRichText(html: string): string {
	return sanitizeHtml(html, options);
}

export function isRichText(value: string): boolean {
	return value.startsWith(RICH_TEXT_PREFIX);
}

/** Used by the editor only. Legacy HTML is opt-in at the original HTML fields. */
export function editorContent(value: string, legacyHtml = false): string {
	if (isRichText(value)) return sanitizeRichText(value.slice(RICH_TEXT_PREFIX.length));
	if (legacyHtml) return sanitizeRichText(value);
	return `<p>${escapeText(value).replace(/\r\n?|\n/g, '<br>')}</p>`;
}

export function serializeRichText(html: string): string {
	const clean = sanitizeRichText(html);
	// Empty content must remain an empty string for existing fallbacks/visibility checks.
	if (
		!sanitizeHtml(clean, { allowedTags: [], allowedAttributes: {} })
			.replace(/&nbsp;/g, ' ')
			.trim()
	)
		return '';
	return RICH_TEXT_PREFIX + clean;
}

/** Safe in any existing phrasing container (headings, paragraphs, buttons and links).
 * List semantics use ARIA because native block tags would break those containers on SSR.
 * Every emitted attribute is owned here; author styles, links, handlers and media are removed.
 */
export function renderRichText(value: string, legacyHtml = false): string {
	if (!isRichText(value) && !legacyHtml) return escapeText(value);
	const html = editorContent(value, legacyHtml);
	const block =
		(name: string, role?: string): sanitizeHtml.Transformer =>
		(_tag, attrs) => ({
			tagName: 'span',
			attribs: {
				class: `rt-${name}`,
				...(role ? { role } : {}),
				...(name === 'ol' && /^\d{1,6}$/.test(attrs.start ?? '')
					? { style: `counter-reset: rt-item ${Number(attrs.start) - 1}` }
					: {})
			}
		});
	return `<span class="rich-text">${sanitizeHtml(html, {
		allowedTags: ['span', 'br', 'strong', 'em', 'u', 's'],
		allowedAttributes: { span: ['class', 'role', 'style'] },
		transformTags: {
			p: block('paragraph'),
			ul: block('ul', 'list'),
			ol: block('ol', 'list'),
			li: block('li', 'listitem'),
			blockquote: block('quote')
		}
	})}</span>`;
}

/** Attribute labels and non-rich consumers must never expose stored markup. */
export function richTextToPlainText(value: string): string {
	if (!value.includes(RICH_TEXT_PREFIX)) return value;
	const html = sanitizeRichText(value.split(RICH_TEXT_PREFIX).join('')).replace(
		/<br\s*\/?\s*>|<\/(?:p|li|blockquote)>/g,
		'\n'
	);
	const escaped = sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} });
	return escaped
		.replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
		.replace(/&#x([\da-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&apos;/g, "'")
		.replace(/&nbsp;/g, ' ')
		.replace(/&amp;/g, '&')
		.trimEnd();
}
