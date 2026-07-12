import { useStorefrontConfig } from '@/shared/config/storefrontConfig.context'

export function AnnouncementBanner() {
  const { header } = useStorefrontConfig()
  const ann = header?.announcement

  if (!ann?.enabled || !ann.text) return null

  return (
    <div
      role="banner"
      style={{
        backgroundColor: ann.backgroundColor || 'var(--sf-panel)',
        color: ann.textColor || 'var(--sf-text)',
      }}
      className="w-full py-2 px-4 text-center text-sm"
    >
      {ann.text}
    </div>
  )
}
