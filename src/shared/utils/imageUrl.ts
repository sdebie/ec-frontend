// IMAGE_STORAGE_PATH (backend) = storage/ — served at /static/images/*.
// Images live at storage/images/01/foo.png → URL /static/images/images/01/foo.png.
// Thumbnails live at storage/thumbnails/images/01/foo.png → URL /static/images/thumbnails/images/01/foo.png.
// The image-list API and productImage.imageUrl both return paths relative to storage/,
// e.g. 'images/01/foo.png' — no stripping needed, just prepend the base.
const IMAGE_BASE = import.meta.env.VITE_IMAGE_BASE_URL ?? '/static/images/'
const THUMB_BASE = IMAGE_BASE.endsWith('/') ? `${IMAGE_BASE}thumbnails/` : `${IMAGE_BASE}/thumbnails/`

export function resolveImageUrl(path: string | null | undefined): string | null {
  if (!path) return null
  if (path.startsWith('http') || path.startsWith(IMAGE_BASE)) return path
  return `${IMAGE_BASE}${path.startsWith('/') ? path.slice(1) : path}`
}

export function thumbnailUrl(filename: string): string {
  return `${THUMB_BASE}${filename.startsWith('/') ? filename.slice(1) : filename}`
}
