/**
 * primitives/ — surface-agnostic UI atoms.
 *
 * Rules:
 *  - Use only --c-* CSS variables (never --sf-*, --admin-*, or hardcoded colours).
 *  - No business logic, no API calls, no routing.
 *  - All props are structural (variant, size, state) — never tenant-specific.
 *
 * To compose a form field with label/icon/error for a specific surface,
 * wrap these primitives in components/shared/ (admin) or tenants/{id}/components/ (storefront).
 */
export { Button } from './button';
export type { ButtonProps } from './button';

export { Card } from './card';

export { Input } from './input';
export type { InputProps } from './input';

export { Container } from './container';
export type { ContainerProps } from './container';

export { Divider } from './divider';
export type { DividerProps } from './divider';

export { IconBox } from './icon-box';
