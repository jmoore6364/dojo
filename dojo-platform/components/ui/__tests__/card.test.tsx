import React from 'react'
import { render, screen } from '@testing-library/react'
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from '../card'

describe('Card Components', () => {
  describe('Card', () => {
    it('renders card container', () => {
      render(
        <Card data-testid="card">
          <div>Card content</div>
        </Card>
      )
      
      const card = screen.getByTestId('card')
      expect(card).toBeInTheDocument()
      expect(card).toHaveClass('rounded-xl', 'border', 'bg-card', 'shadow')
    })

    it('accepts custom className', () => {
      render(<Card className="custom-card" data-testid="card" />)
      const card = screen.getByTestId('card')
      expect(card).toHaveClass('custom-card')
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<Card ref={ref}>Content</Card>)
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })
  })

  describe('CardHeader', () => {
    it('renders header with proper spacing', () => {
      render(
        <CardHeader data-testid="header">
          <CardTitle>Title</CardTitle>
        </CardHeader>
      )
      
      const header = screen.getByTestId('header')
      expect(header).toHaveClass('flex', 'flex-col', 'space-y-1.5', 'p-6')
    })
  })

  describe('CardTitle', () => {
    it('renders title text', () => {
      render(<CardTitle>Test Title</CardTitle>)
      const title = screen.getByText('Test Title')
      expect(title).toBeInTheDocument()
      expect(title).toHaveClass('font-semibold', 'leading-none', 'tracking-tight')
    })

    it('renders as h3 element', () => {
      render(<CardTitle>Heading Title</CardTitle>)
      const heading = screen.getByText('Heading Title')
      expect(heading.tagName).toBe('H3')
    })
  })

  describe('CardDescription', () => {
    it('renders description text', () => {
      render(<CardDescription>Test description</CardDescription>)
      const description = screen.getByText('Test description')
      expect(description).toBeInTheDocument()
      expect(description).toHaveClass('text-sm', 'text-muted-foreground')
    })

    it('renders as p element', () => {
      render(<CardDescription>Paragraph description</CardDescription>)
      const paragraph = screen.getByText('Paragraph description')
      expect(paragraph.tagName).toBe('P')
    })
  })

  describe('CardContent', () => {
    it('renders content with proper padding', () => {
      render(
        <CardContent data-testid="content">
          <div>Main content</div>
        </CardContent>
      )
      
      const content = screen.getByTestId('content')
      expect(content).toHaveClass('p-6', 'pt-0')
    })
  })

  describe('CardFooter', () => {
    it('renders footer with flex layout', () => {
      render(
        <CardFooter data-testid="footer">
          <button>Action</button>
        </CardFooter>
      )
      
      const footer = screen.getByTestId('footer')
      expect(footer).toHaveClass('flex', 'items-center', 'p-6', 'pt-0')
    })
  })

  describe('Full Card Composition', () => {
    it('renders complete card with all components', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Complete Card</CardTitle>
            <CardDescription>This is a full card example</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Card body content goes here</p>
          </CardContent>
          <CardFooter>
            <button>Footer Action</button>
          </CardFooter>
        </Card>
      )
      
      expect(screen.getByText('Complete Card')).toBeInTheDocument()
      expect(screen.getByText('This is a full card example')).toBeInTheDocument()
      expect(screen.getByText('Card body content goes here')).toBeInTheDocument()
      expect(screen.getByText('Footer Action')).toBeInTheDocument()
    })
  })
})