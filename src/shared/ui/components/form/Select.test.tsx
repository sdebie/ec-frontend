import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Select } from './Select'
import { SearchableSelect } from './SearchableSelect'
import { MultiSelect } from './MultiSelect'

const options = [
  { value: 'a', label: 'Option A' },
  { value: 'b', label: 'Option B' },
  { value: 'c', label: 'Option C' },
]

describe('Select', () => {
  it('renders placeholder when no value selected', () => {
    render(<Select options={options} placeholder="Pick one" />)
    expect(screen.getByText('Pick one')).toBeInTheDocument()
  })

  it('renders selected option label when value is set', () => {
    render(<Select options={options} value="b" />)
    expect(screen.getByText('Option B')).toBeInTheDocument()
  })

  it('opens dropdown on click and shows options with listbox role', () => {
    render(<Select options={options} />)
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    expect(screen.getAllByRole('option')).toHaveLength(3)
  })

  it('calls onChange with selected value', () => {
    const onChange = vi.fn()
    render(<Select options={options} onChange={onChange} />)
    fireEvent.click(screen.getByRole('button'))
    fireEvent.click(screen.getByText('Option C'))
    expect(onChange).toHaveBeenCalledWith('c')
  })

  it('renders label when provided', () => {
    render(<Select options={options} label="My Label" />)
    expect(screen.getByText('My Label')).toBeInTheDocument()
  })

  it('does not call onChange for disabled options', () => {
    const onChange = vi.fn()
    const disabledOptions = [
      { value: 'x', label: 'Disabled', disabled: true },
    ]
    render(<Select options={disabledOptions} onChange={onChange} />)
    fireEvent.click(screen.getByRole('button'))
    fireEvent.click(screen.getByText('Disabled'))
    expect(onChange).not.toHaveBeenCalled()
  })
})

describe('SearchableSelect', () => {
  it('renders placeholder when no value selected', () => {
    render(<SearchableSelect options={options} placeholder="Search..." />)
    expect(screen.getByText('Search...')).toBeInTheDocument()
  })

  it('renders selected option label when value is set', () => {
    render(<SearchableSelect options={options} value="a" />)
    expect(screen.getByText('Option A')).toBeInTheDocument()
  })

  it('opens dropdown on click and shows search input', () => {
    render(<SearchableSelect options={options} usePortal={false} />)
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    expect(
      screen.getByPlaceholderText('Search...')
    ).toBeInTheDocument()
  })

  it('filters options based on search query', () => {
    render(<SearchableSelect options={options} usePortal={false} />)
    fireEvent.click(screen.getByRole('button'))
    const searchInput = screen.getByPlaceholderText('Search...')
    fireEvent.change(searchInput, { target: { value: 'B' } })
    expect(screen.getAllByRole('option')).toHaveLength(1)
    expect(screen.getByText('Option B')).toBeInTheDocument()
  })

  it('calls onChange with selected value', () => {
    const onChange = vi.fn()
    render(
      <SearchableSelect
        options={options}
        onChange={onChange}
        usePortal={false}
      />
    )
    fireEvent.click(screen.getByRole('button'))
    fireEvent.click(screen.getByText('Option A'))
    expect(onChange).toHaveBeenCalledWith('a')
  })

  it('shows empty text when no options match', () => {
    render(
      <SearchableSelect
        options={options}
        emptyText="Nothing found"
        usePortal={false}
      />
    )
    fireEvent.click(screen.getByRole('button'))
    const searchInput = screen.getByPlaceholderText('Search...')
    fireEvent.change(searchInput, { target: { value: 'xyz' } })
    expect(screen.getByText('Nothing found')).toBeInTheDocument()
  })
})

describe('MultiSelect', () => {
  it('renders placeholder when no values selected', () => {
    render(<MultiSelect options={options} placeholder="Choose..." />)
    expect(screen.getByText('Choose...')).toBeInTheDocument()
  })

  it('renders selected option labels as tags', () => {
    render(<MultiSelect options={options} value={['a', 'c']} />)
    expect(screen.getByText('Option A')).toBeInTheDocument()
    expect(screen.getByText('Option C')).toBeInTheDocument()
  })

  it('calls onChange with updated string[] when selecting', () => {
    const onChange = vi.fn()
    render(<MultiSelect options={options} value={['a']} onChange={onChange} />)
    const trigger = screen.getByRole('button', { expanded: false })
    fireEvent.click(trigger)
    fireEvent.click(screen.getByText('Option B'))
    expect(onChange).toHaveBeenCalledWith(['a', 'b'])
  })

  it('calls onChange with updated string[] when deselecting', () => {
    const onChange = vi.fn()
    render(
      <MultiSelect options={options} value={['a', 'b']} onChange={onChange} />
    )
    const trigger = screen.getByRole('button', { expanded: false })
    fireEvent.click(trigger)
    // Click the option in the listbox (not the tag)
    const optionA = screen.getByRole('option', { name: 'Option A' })
    fireEvent.click(optionA)
    expect(onChange).toHaveBeenCalledWith(['b'])
  })

  it('removes a tag via onChange when deselecting from the list', () => {
    const onChange = vi.fn()
    render(
      <MultiSelect options={options} value={['a', 'b']} onChange={onChange} />
    )
    const trigger = screen.getByRole('button', { expanded: false })
    fireEvent.click(trigger)
    // Click Option B in the open list to deselect it
    const optionB = screen.getByRole('option', { name: 'Option B' })
    fireEvent.click(optionB)
    expect(onChange).toHaveBeenCalledWith(['a'])
  })

  it('shows error message when error prop is set', () => {
    render(
      <MultiSelect options={options} error="Required field" />
    )
    expect(screen.getByText('Required field')).toBeInTheDocument()
  })
})
