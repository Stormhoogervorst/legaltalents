import sanitizeHtmlLib from "sanitize-html";

/**
 * Server-side HTML sanitizer voor opgeslagen rich-text content (blogs en
 * vacature-omschrijvingen). Gebruikt `sanitize-html` (op basis van
 * htmlparser2) en heeft géén jsdom-dependency, zodat het zonder problemen
 * in serverless/Edge-vriendelijke Node-runtimes draait.
 *
 * De allowlist dekt de volledige Tiptap-output (StarterKit + Link) plus de
 * tags die de bestaande prose-/vacature-CSS opmaakt, zodat reeds opgeslagen
 * artikelen er identiek uit blijven zien.
 */
const SANITIZE_OPTIONS: sanitizeHtmlLib.IOptions = {
  allowedTags: [
    "p",
    "br",
    "hr",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "strong",
    "b",
    "em",
    "i",
    "u",
    "s",
    "strike",
    "sub",
    "sup",
    "ul",
    "ol",
    "li",
    "blockquote",
    "code",
    "pre",
    "a",
    "span",
    "div",
    "img",
    "figure",
    "figcaption",
    "table",
    "thead",
    "tbody",
    "tr",
    "th",
    "td",
  ],
  allowedAttributes: {
    a: ["href", "name", "target", "rel"],
    img: ["src", "alt", "title", "width", "height"],
    "*": ["class"],
  },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  // Externe links die in een nieuw tabblad openen krijgen automatisch
  // rel="noopener noreferrer" om tabnabbing te voorkomen.
  transformTags: {
    a: (tagName, attribs) => {
      if (attribs.target === "_blank") {
        attribs.rel = "noopener noreferrer";
      }
      return { tagName, attribs };
    },
  },
};

export function sanitizeHtml(dirty: string): string {
  return sanitizeHtmlLib(dirty, SANITIZE_OPTIONS);
}
