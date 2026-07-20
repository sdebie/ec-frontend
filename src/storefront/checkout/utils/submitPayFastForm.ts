import type { HtmlFormField } from '../types'

export function submitPayFastForm(
  gatewayUrl: string,
  fields: HtmlFormField[]
): void {
  const form = document.createElement('form')
  form.method = 'POST'
  form.action = gatewayUrl
  form.style.display = 'none'

  for (const field of fields) {
    const input = document.createElement('input')
    input.type = 'hidden'
    input.name = field.name
    input.value = field.value
    form.appendChild(input)
  }

  document.body.appendChild(form)
  form.submit()
}
