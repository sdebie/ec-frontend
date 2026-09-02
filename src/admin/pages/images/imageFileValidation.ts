const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp']

export function isImageFile(file: File): boolean {
    return ALLOWED_TYPES.includes(file.type) || ALLOWED_EXTENSIONS.some(ext => file.name.toLowerCase().endsWith(ext))
}
