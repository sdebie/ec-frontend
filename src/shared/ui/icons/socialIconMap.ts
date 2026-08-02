import type React from 'react'
import { IconFacebook } from './IconFacebook'
import { IconInstagram } from './IconInstagram'
import { IconLinkedIn } from './IconLinkedIn'
import { IconXTwitter } from './IconXTwitter'
import { IconYouTube } from './IconYouTube'
import { IconTikTok } from './IconTikTok'

export const socialIconMap: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  facebook: IconFacebook,
  instagram: IconInstagram,
  linkedin: IconLinkedIn,
  x: IconXTwitter,
  twitter: IconXTwitter,
  youtube: IconYouTube,
  tiktok: IconTikTok,
}
