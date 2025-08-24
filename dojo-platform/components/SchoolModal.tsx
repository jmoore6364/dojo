'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { X } from 'lucide-react'

const MARTIAL_ARTS = [
  'Karate',
  'Taekwondo',
  'Judo',
  'Brazilian Jiu-Jitsu',
  'Muay Thai',
  'Boxing',
  'Kickboxing',
  'Kung Fu',
  'Aikido',
  'Krav Maga',
  'Mixed Martial Arts (MMA)',
  'Capoeira',
  'Wing Chun',
  'Hapkido',
  'Wrestling',
  'Jeet Kune Do',
  'Kendo',
  'Sambo',
  'Ninjutsu',
  'Other'
]

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
]

interface School {
  id?: string
  name: string
  address: string
  city: string
  state: string
  zipCode: string
  phone: string
  email: string
  website?: string
  martialArts: string[]
  maxStudents: number
  currentStudents?: number
  isActive: boolean
  description?: string
}

interface SchoolModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (school: School) => void
  school?: School | null
  mode: 'create' | 'edit'
}

export default function SchoolModal({ isOpen, onClose, onSave, school, mode }: SchoolModalProps) {
  const [formData, setFormData] = useState<School>({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    email: '',
    website: '',
    martialArts: [],
    maxStudents: 100,
    isActive: true,
    description: ''
  })
  const [errors, setErrors] = useState<Partial<Record<keyof School, string>>>({})

  useEffect(() => {
    if (school && mode === 'edit') {
      setFormData(school)
    } else {
      setFormData({
        name: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        phone: '',
        email: '',
        website: '',
        martialArts: [],
        maxStudents: 100,
        isActive: true,
        description: ''
      })
    }
  }, [school, mode])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
    // Clear error for this field
    if (errors[name as keyof School]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleMartialArtToggle = (art: string) => {
    setFormData(prev => ({
      ...prev,
      martialArts: prev.martialArts.includes(art)
        ? prev.martialArts.filter(a => a !== art)
        : [...prev.martialArts, art]
    }))
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof School, string>> = {}

    if (!formData.name.trim()) newErrors.name = 'School name is required'
    if (!formData.address.trim()) newErrors.address = 'Address is required'
    if (!formData.city.trim()) newErrors.city = 'City is required'
    if (!formData.state) newErrors.state = 'State is required'
    if (!formData.zipCode.trim()) newErrors.zipCode = 'ZIP code is required'
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format'
    }
    if (formData.martialArts.length === 0) {
      newErrors.martialArts = 'Select at least one martial art'
    }
    if (formData.maxStudents < 1) {
      newErrors.maxStudents = 'Maximum students must be at least 1'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSave(formData)
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Add New School' : 'Edit School'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Add a new school location to your organization' 
              : 'Update the school information'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Basic Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">School Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Main Dojo"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
              </div>

              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="(555) 123-4567"
                  className={errors.phone ? 'border-red-500' : ''}
                />
                {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="school@dojo.com"
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
              </div>

              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="https://www.dojo.com"
                />
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Location</h3>
            
            <div>
              <Label htmlFor="address">Street Address *</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="123 Main Street"
                className={errors.address ? 'border-red-500' : ''}
              />
              {errors.address && <p className="text-sm text-red-500 mt-1">{errors.address}</p>}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="New York"
                  className={errors.city ? 'border-red-500' : ''}
                />
                {errors.city && <p className="text-sm text-red-500 mt-1">{errors.city}</p>}
              </div>

              <div>
                <Label htmlFor="state">State *</Label>
                <Select
                  value={formData.state}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, state: value }))}
                >
                  <SelectTrigger className={errors.state ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {US_STATES.map(state => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.state && <p className="text-sm text-red-500 mt-1">{errors.state}</p>}
              </div>

              <div>
                <Label htmlFor="zipCode">ZIP Code *</Label>
                <Input
                  id="zipCode"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  placeholder="10001"
                  className={errors.zipCode ? 'border-red-500' : ''}
                />
                {errors.zipCode && <p className="text-sm text-red-500 mt-1">{errors.zipCode}</p>}
              </div>
            </div>
          </div>

          {/* Martial Arts */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Martial Arts Offered *</h3>
            {errors.martialArts && <p className="text-sm text-red-500">{errors.martialArts}</p>}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {MARTIAL_ARTS.map(art => (
                <label key={art} className="flex items-center space-x-2 cursor-pointer">
                  <Checkbox
                    checked={formData.martialArts.includes(art)}
                    onCheckedChange={() => handleMartialArtToggle(art)}
                  />
                  <span className="text-sm">{art}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Additional Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="maxStudents">Maximum Students *</Label>
                <Input
                  id="maxStudents"
                  name="maxStudents"
                  type="number"
                  value={formData.maxStudents}
                  onChange={handleInputChange}
                  min="1"
                  className={errors.maxStudents ? 'border-red-500' : ''}
                />
                {errors.maxStudents && <p className="text-sm text-red-500 mt-1">{errors.maxStudents}</p>}
              </div>

              <div className="flex items-center space-x-2 mt-8">
                <Checkbox
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, isActive: checked as boolean }))
                  }
                />
                <Label htmlFor="isActive" className="cursor-pointer">
                  Active School
                </Label>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter a brief description of this school location..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {mode === 'create' ? 'Add School' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}