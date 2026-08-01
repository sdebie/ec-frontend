import * as React from 'react'
import {Eye, EyeOff} from 'lucide-react'
import {InputField, type InputFieldProps} from './InputField'

/**
 * PasswordField — an InputField that owns its own show/hide toggle.
 *
 * The toggle lives here rather than in each form because every consumer had
 * reimplemented the same block: a `useState`, a `type={show ? 'text' : 'password'}`
 * swap, and an absolutely-positioned Eye/EyeOff button.
 *
 * `type` is deliberately not accepted — this component owns it.
 */
export interface PasswordFieldProps
    extends Omit<InputFieldProps, 'type' | 'rightIcon' | 'rightIconInteractive'> {
    /**
     * Spells the toggle's accessible name: "Show {toggleNoun}" / "Hide {toggleNoun}".
     * Not derived from `label`, because the two legitimately differ — a field
     * labeled "Confirm new password" wants a "Show confirm password" toggle.
     */
    toggleNoun?: string
}

export const PasswordField = React.forwardRef<HTMLInputElement, PasswordFieldProps>(
    ({toggleNoun = 'password', ...props}, ref) => {
        const [show, setShow] = React.useState(false)

        return (
            <InputField
                ref={ref}
                type={show ? 'text' : 'password'}
                rightIconInteractive
                rightIcon={
                    <button
                        type="button"
                        className="text-(--c-text-muted) hover:text-(--c-text)"
                        onClick={() => setShow((v) => !v)}
                        aria-label={show ? `Hide ${toggleNoun}` : `Show ${toggleNoun}`}
                    >
                        {show ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                    </button>
                }
                {...props}
            />
        )
    }
)
PasswordField.displayName = 'PasswordField'
