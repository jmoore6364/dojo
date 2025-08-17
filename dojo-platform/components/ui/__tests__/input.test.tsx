import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from '../input'

describe('Input Component', () => {
  it('renders input element', () => {
    render(<Input placeholder="Enter text" />)
    const input = screen.getByPlaceholderText('Enter text')
    expect(input).toBeInTheDocument()
  })

  it('accepts and displays value', () => {
    render(<Input defaultValue="test value" />)
    const input = screen.getByDisplayValue('test value')
    expect(input).toBeInTheDocument()
  })

  it('handles user typing', async () => {
    const user = userEvent.setup()
    render(<Input placeholder="Type here" />)
    
    const input = screen.getByPlaceholderText('Type here') as HTMLInputElement
    await user.type(input, 'Hello World')
    
    expect(input.value).toBe('Hello World')
  })

  it('calls onChange handler', () => {
    const handleChange = jest.fn()
    render(<Input onChange={handleChange} />)
    
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'new value' } })
    
    expect(handleChange).toHaveBeenCalled()
    expect(handleChange.mock.calls[0][0].target.value).toBe('new value')
  })

  it('supports different input types', () => {
    const { rerender } = render(<Input type="text" />)
    let input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('type', 'text')

    rerender(<Input type="email" placeholder="email" />)
    input = screen.getByPlaceholderText('email')
    expect(input).toHaveAttribute('type', 'email')

    rerender(<Input type="password" placeholder="password" />)
    input = screen.getByPlaceholderText('password')
    expect(input).toHaveAttribute('type', 'password')

    rerender(<Input type="number" placeholder="number" />)
    input = screen.getByPlaceholderText('number')
    expect(input).toHaveAttribute('type', 'number')
  })

  it('can be disabled', () => {
    render(<Input disabled placeholder="Disabled input" />)
    const input = screen.getByPlaceholderText('Disabled input')
    
    expect(input).toBeDisabled()
    expect(input).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50')
  })

  it('applies correct styling classes', () => {
    render(<Input />)
    const input = screen.getByRole('textbox')
    
    expect(input).toHaveClass(
      'flex',
      'h-9',
      'w-full',
      'rounded-md',
      'border',
      'border-input',
      'bg-transparent',
      'px-3',
      'py-1',
      'text-sm',
      'shadow-sm'
    )
  })

  it('accepts custom className', () => {
    render(<Input className="custom-input" />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('custom-input')
  })

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLInputElement>()
    render(<Input ref={ref} defaultValue="ref test" />)
    
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
    expect(ref.current?.value).toBe('ref test')
  })

  it('handles file input type', () => {
    render(<Input type="file" data-testid="file-input" />)
    const input = screen.getByTestId('file-input')
    
    expect(input).toHaveAttribute('type', 'file')
    expect(input).toHaveClass('file:border-0', 'file:bg-transparent')
  })

  it('supports required attribute', () => {
    render(<Input required placeholder="Required field" />)
    const input = screen.getByPlaceholderText('Required field')
    expect(input).toBeRequired()
  })

  it('supports maxLength attribute', () => {
    render(<Input maxLength={10} placeholder="Max 10 chars" />)
    const input = screen.getByPlaceholderText('Max 10 chars')
    expect(input).toHaveAttribute('maxLength', '10')
  })

  it('supports autoComplete attribute', () => {
    render(<Input autoComplete="email" placeholder="Email" />)
    const input = screen.getByPlaceholderText('Email')
    expect(input).toHaveAttribute('autoComplete', 'email')
  })

  it('handles focus and blur events', () => {
    const handleFocus = jest.fn()
    const handleBlur = jest.fn()
    
    render(
      <Input
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder="Focus test"
      />
    )
    
    const input = screen.getByPlaceholderText('Focus test')
    
    fireEvent.focus(input)
    expect(handleFocus).toHaveBeenCalledTimes(1)
    
    fireEvent.blur(input)
    expect(handleBlur).toHaveBeenCalledTimes(1)
  })
})