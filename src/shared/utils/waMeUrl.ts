// Click-to-chat links are built from `config.contact.whatsapp`, which operators
// enter in whatever human format they like ("+27 82 123 4567", "082-123-4567").
// wa.me accepts digits only, so every consumer must normalise before linking.
//
// This is the single construction site for that URL — the cross-spec contract
// with `whatsapp-click-to-chat` is that `contact.whatsapp` and `waMeUrl` each
// land exactly once. Do not re-implement `replace(/\D/g, '')` at a call site.

/**
 * Builds a `wa.me` click-to-chat URL from a stored contact number.
 *
 * Strips every non-digit character; a leading `+` is therefore dropped, which is
 * what wa.me expects (it reads the remaining string as an international number
 * including country code).
 */
export function waMeUrl(value: string): string {
  return `https://wa.me/${value.replace(/\D/g, '')}`
}
