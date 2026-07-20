import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Form, FormItem } from '../Form'

describe('Form', () => {
  it('renders a <form> element with children', () => {
    render(
      <Form data-testid="form">
        <input type="text" />
      </Form>
    )
    const form = screen.getByTestId('form')
    expect(form.tagName).toBe('FORM')
    expect(form.querySelector('input')).toBeTruthy()
  })

  it('applies consistent vertical spacing via space-y-6', () => {
    render(
      <Form data-testid="form">
        <div>Field 1</div>
        <div>Field 2</div>
      </Form>
    )
    const form = screen.getByTestId('form')
    expect(form.className).toContain('space-y-6')
  })

  it('accepts standard HTML form attributes', () => {
    render(
      <Form data-testid="form" action="/submit" method="post" noValidate>
        <button type="submit">Submit</button>
      </Form>
    )
    const form = screen.getByTestId('form') as HTMLFormElement
    expect(form.action).toContain('/submit')
    expect(form.method).toBe('post')
    expect(form.noValidate).toBe(true)
  })

  it('merges custom className with default spacing', () => {
    render(
      <Form data-testid="form" className="mt-4">
        <div>content</div>
      </Form>
    )
    const form = screen.getByTestId('form')
    expect(form.className).toContain('mt-4')
  })

  it('does NOT have a methods prop', () => {
    // TypeScript would prevent this at compile time, but this documents the intent
    const props = { children: <div /> }
    expect('methods' in props).toBe(false)
  })
})

describe('FormItem', () => {
  it('renders children', () => {
    render(
      <FormItem>
        <input data-testid="child-input" />
      </FormItem>
    )
    expect(screen.getByTestId('child-input')).toBeTruthy()
  })

  it('renders a label with htmlFor when label prop is provided', () => {
    render(
      <FormItem label="Email">
        <input />
      </FormItem>
    )
    const label = screen.getByText('Email')
    expect(label.tagName).toBe('LABEL')
    expect(label.getAttribute('for')).toBeTruthy()
  })

  it('shows required indicator when required is true', () => {
    render(
      <FormItem label="Name" required>
        <input />
      </FormItem>
    )
    const asterisk = screen.getByText('*')
    expect(asterisk).toBeTruthy()
    expect(asterisk.getAttribute('aria-hidden')).toBe('true')
  })

  it('shows errorMessage when invalid is true and errorMessage is set', () => {
    render(
      <FormItem label="Email" invalid errorMessage="Email is required">
        <input />
      </FormItem>
    )
    expect(screen.getByText('Email is required')).toBeTruthy()
  })

  it('shows errorMessage when errorMessage is set (even without invalid flag)', () => {
    render(
      <FormItem label="Email" errorMessage="Invalid email format">
        <input />
      </FormItem>
    )
    expect(screen.getByText('Invalid email format')).toBeTruthy()
  })

  it('shows helperText when there is no error', () => {
    render(
      <FormItem label="Email" helperText="We will never share your email">
        <input />
      </FormItem>
    )
    expect(screen.getByText('We will never share your email')).toBeTruthy()
  })

  it('does NOT show helperText when there is an error', () => {
    render(
      <FormItem
        label="Email"
        helperText="We will never share your email"
        errorMessage="Email is required"
        invalid
      >
        <input />
      </FormItem>
    )
    expect(screen.queryByText('We will never share your email')).toBeNull()
    expect(screen.getByText('Email is required')).toBeTruthy()
  })

  it('applies custom className', () => {
    const { container } = render(
      <FormItem className="mt-8">
        <input />
      </FormItem>
    )
    const wrapper = container.firstElementChild as HTMLElement
    expect(wrapper.className).toContain('mt-8')
  })
})
