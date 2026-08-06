import { useLayoutEffect, useRef, useState } from 'react'
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google'

/**
 * The "Sign in with Google" button, sized to match the form's own submit button.
 *
 * Google Identity Services sizes its button from a `width` option in pixels and
 * writes that number as an inline style, so the button cannot inherit `w-full`
 * from its parent the way the form's controls do — left alone it renders
 * narrower than, and inset from, the submit button above it. Measuring the
 * wrapper and handing GSI the result is what keeps the two the same shape at
 * every viewport rather than only at the one a hardcoded number was picked for.
 *
 * GSI clamps `width` to [200, 400] and falls back to the button's intrinsic
 * size outside that range, so the measurement is clamped to agree with it. A
 * caller that needs the button to fill its container must therefore keep the
 * container's content box within 400px; wider than that, it centres instead.
 *
 * Radius is the one thing not settled here — see `.sf-google-button` in
 * index.css for why it cannot be.
 */
const GSI_MIN_WIDTH = 200
const GSI_MAX_WIDTH = 400

export interface GoogleAuthButtonProps {
  onSuccess: (response: CredentialResponse) => void
  /** GSI label variant — 'signin_with' renders "Sign in with Google". */
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin'
}

export function GoogleAuthButton({ onSuccess, text = 'signin_with' }: GoogleAuthButtonProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState<number>()

  useLayoutEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return

    const measure = () => {
      const measured = Math.round(wrapper.getBoundingClientRect().width)
      // Zero means layout has not run yet (jsdom never runs it at all). Holding
      // the previous value keeps GSI from re-rendering the button against a
      // width it would reject anyway.
      if (measured <= 0) return
      setWidth(Math.min(Math.max(measured, GSI_MIN_WIDTH), GSI_MAX_WIDTH))
    }

    // Before paint, so the measured width is already in place by the time the
    // GSI script resolves and draws — the button is never painted at its
    // intrinsic size first.
    measure()

    if (typeof ResizeObserver === 'undefined') return

    // Observing the wrapper alone is safe: it is `w-full`, so its width comes
    // from the card and never from the button rendered inside it.
    const observer = new ResizeObserver(measure)
    observer.observe(wrapper)

    return () => observer.disconnect()
  }, [])

  return (
    /*
      `sf-google-button` is the scope for the radius override in index.css —
      GSI's own stylesheet is unlayered and cannot be beaten by a utility class.

      Centred, not stretched: in a container wider than GSI's 400px ceiling the
      button cannot fill the row, and a 400px button pinned to the left edge of a
      512px one reads as a layout bug. At or below the ceiling the button already
      spans the full width, so the centring changes nothing there.
    */
    <div ref={wrapperRef} className="sf-google-button flex w-full justify-center">
      <GoogleLogin
        onSuccess={onSuccess}
        onError={() => {
          // Silent cancel — no error shown per requirement 8.6
        }}
        text={text}
        shape="rectangular"
        size="large"
        width={width}
      />
    </div>
  )
}
