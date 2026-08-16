/**
 * Masks the local part of an email for display, keeping the domain visible
 * so staff can still recognise which account it is: `va***@live.co.za`.
 * The asterisk count is fixed rather than proportional to the local part's
 * length, so the mask itself doesn't leak how long the real value is.
 */
export function maskEmail(email: string | null | undefined): string {
  if (!email) return ''

  const atIndex = email.indexOf('@')
  if (atIndex <= 0) return email

  const local = email.slice(0, atIndex)
  const domain = email.slice(atIndex)
  const visible = local.slice(0, Math.min(2, local.length))

  return `${visible}***${domain}`
}
