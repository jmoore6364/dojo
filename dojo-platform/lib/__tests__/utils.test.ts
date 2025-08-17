import { cn } from '../utils'

describe('cn utility function', () => {
  it('combines multiple class names', () => {
    const result = cn('class1', 'class2', 'class3')
    expect(result).toBe('class1 class2 class3')
  })

  it('handles conditional classes', () => {
    const result = cn(
      'base-class',
      true && 'true-class',
      false && 'false-class',
      undefined,
      null
    )
    expect(result).toBe('base-class true-class')
  })

  it('merges Tailwind classes correctly', () => {
    // Should remove conflicting classes and keep the last one
    const result = cn('p-2', 'p-4')
    expect(result).toBe('p-4')
  })

  it('handles arrays of classes', () => {
    const result = cn(['class1', 'class2'], 'class3')
    expect(result).toBe('class1 class2 class3')
  })

  it('handles objects with conditional classes', () => {
    const result = cn({
      'active': true,
      'disabled': false,
      'hover:bg-blue-500': true,
    })
    expect(result).toBe('active hover:bg-blue-500')
  })

  it('removes duplicate classes', () => {
    const result = cn('btn', 'btn', 'primary', 'primary')
    expect(result).toBe('btn primary')
  })

  it('handles empty inputs', () => {
    const result = cn()
    expect(result).toBe('')
  })

  it('handles undefined and null values', () => {
    const result = cn('class1', undefined, null, 'class2')
    expect(result).toBe('class1 class2')
  })

  it('merges color classes correctly', () => {
    const result = cn('text-red-500', 'text-blue-500')
    expect(result).toBe('text-blue-500')
  })

  it('merges size classes correctly', () => {
    const result = cn('text-sm', 'text-lg')
    expect(result).toBe('text-lg')
  })

  it('preserves non-conflicting classes', () => {
    const result = cn('text-red-500', 'bg-blue-500', 'p-4', 'm-2')
    expect(result).toBe('text-red-500 bg-blue-500 p-4 m-2')
  })

  it('handles complex nested conditions', () => {
    const isActive = true
    const isDisabled = false
    const size = 'large'
    
    const result = cn(
      'btn',
      isActive && 'btn-active',
      isDisabled && 'btn-disabled',
      {
        'btn-sm': size === 'small',
        'btn-lg': size === 'large',
      }
    )
    
    expect(result).toBe('btn btn-active btn-lg')
  })

  it('handles Tailwind arbitrary values', () => {
    const result = cn('w-[100px]', 'h-[200px]', 'top-[10%]')
    expect(result).toBe('w-[100px] h-[200px] top-[10%]')
  })

  it('merges responsive classes correctly', () => {
    const result = cn('md:p-2', 'md:p-4', 'lg:p-6')
    expect(result).toBe('md:p-4 lg:p-6')
  })

  it('handles hover and focus states', () => {
    const result = cn(
      'hover:bg-red-500',
      'hover:bg-blue-500',
      'focus:ring-2',
      'focus:ring-blue-400'
    )
    expect(result).toBe('hover:bg-blue-500 focus:ring-2 focus:ring-blue-400')
  })
})