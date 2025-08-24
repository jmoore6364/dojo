'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import SchoolModal from '@/components/SchoolModal'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  MapPin,
  Phone,
  Mail,
  Users,
  Activity,
  Building2,
  Filter
} from 'lucide-react'

interface School {
  id: string
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
  currentStudents: number
  isActive: boolean
  description?: string
  createdAt: string
}

// Mock data for demonstration
const mockSchools: School[] = [
  {
    id: '1',
    name: 'Main Dojo',
    address: '123 Main Street',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    phone: '(555) 123-4567',
    email: 'main@dojo.com',
    website: 'https://maindojo.com',
    martialArts: ['Karate', 'Taekwondo', 'Brazilian Jiu-Jitsu'],
    maxStudents: 200,
    currentStudents: 156,
    isActive: true,
    description: 'Our flagship location with state-of-the-art facilities',
    createdAt: '2020-01-15'
  },
  {
    id: '2',
    name: 'Downtown Branch',
    address: '456 Commerce Ave',
    city: 'Brooklyn',
    state: 'NY',
    zipCode: '11201',
    phone: '(555) 234-5678',
    email: 'downtown@dojo.com',
    martialArts: ['Boxing', 'Muay Thai', 'Mixed Martial Arts (MMA)'],
    maxStudents: 150,
    currentStudents: 89,
    isActive: true,
    description: 'Focus on combat sports and fitness',
    createdAt: '2021-06-20'
  },
  {
    id: '3',
    name: 'Kids Academy',
    address: '789 Park Lane',
    city: 'Queens',
    state: 'NY',
    zipCode: '11375',
    phone: '(555) 345-6789',
    email: 'kids@dojo.com',
    website: 'https://kidsdojo.com',
    martialArts: ['Karate', 'Judo', 'Aikido'],
    maxStudents: 100,
    currentStudents: 72,
    isActive: true,
    description: 'Specialized programs for children aged 4-16',
    createdAt: '2022-03-10'
  },
  {
    id: '4',
    name: 'Elite Training Center',
    address: '321 Sports Complex',
    city: 'Manhattan',
    state: 'NY',
    zipCode: '10016',
    phone: '(555) 456-7890',
    email: 'elite@dojo.com',
    martialArts: ['Brazilian Jiu-Jitsu', 'Wrestling', 'Sambo'],
    maxStudents: 80,
    currentStudents: 45,
    isActive: false,
    description: 'Competition-focused training for advanced practitioners',
    createdAt: '2019-11-05'
  }
]

export default function SchoolsPage() {
  const { user } = useAuth()
  const [schools, setSchools] = useState<School[]>(mockSchools)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [schoolToDelete, setSchoolToDelete] = useState<School | null>(null)

  // Filter schools based on search term
  const filteredSchools = schools.filter(school =>
    school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    school.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    school.martialArts.some(art => art.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  // Calculate statistics
  const totalSchools = schools.length
  const activeSchools = schools.filter(s => s.isActive).length
  const totalCapacity = schools.reduce((sum, s) => sum + s.maxStudents, 0)
  const totalStudents = schools.reduce((sum, s) => sum + s.currentStudents, 0)
  const utilizationRate = totalCapacity > 0 ? Math.round((totalStudents / totalCapacity) * 100) : 0

  const handleAddSchool = () => {
    setSelectedSchool(null)
    setModalMode('create')
    setIsModalOpen(true)
  }

  const handleEditSchool = (school: School) => {
    setSelectedSchool(school)
    setModalMode('edit')
    setIsModalOpen(true)
  }

  const handleDeleteSchool = (school: School) => {
    setSchoolToDelete(school)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (schoolToDelete) {
      // In a real app, make API call here
      setSchools(schools.filter(s => s.id !== schoolToDelete.id))
      setDeleteDialogOpen(false)
      setSchoolToDelete(null)
    }
  }

  const handleSaveSchool = async (schoolData: any) => {
    if (modalMode === 'create') {
      // In a real app, make API call here
      const newSchool = {
        ...schoolData,
        id: Date.now().toString(),
        currentStudents: 0,
        createdAt: new Date().toISOString()
      }
      setSchools([...schools, newSchool])
    } else {
      // Update existing school
      setSchools(schools.map(s => 
        s.id === selectedSchool?.id ? { ...s, ...schoolData } : s
      ))
    }
    setIsModalOpen(false)
  }

  return (
    <DashboardLayout title="Schools Management" allowedRoles={['super_admin', 'org_admin']}>
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Schools</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSchools}</div>
            <p className="text-xs text-muted-foreground">
              {activeSchools} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              Across all locations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Capacity</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCapacity}</div>
            <p className="text-xs text-muted-foreground">
              Maximum students
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilization Rate</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{utilizationRate}%</div>
            <p className="text-xs text-muted-foreground">
              Current capacity usage
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Schools Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Schools</CardTitle>
              <CardDescription>Manage your organization's school locations</CardDescription>
            </div>
            <Button onClick={handleAddSchool}>
              <Plus className="mr-2 h-4 w-4" />
              Add School
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filter */}
          <div className="flex items-center space-x-2 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search schools, cities, or martial arts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          {/* Schools Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>School Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Martial Arts</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSchools.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No schools found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSchools.map((school) => (
                    <TableRow key={school.id}>
                      <TableCell className="font-medium">
                        <div>
                          <p className="font-semibold">{school.name}</p>
                          {school.website && (
                            <a 
                              href={school.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:underline"
                            >
                              {school.website}
                            </a>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-start space-x-1">
                          <MapPin className="h-3 w-3 text-gray-400 mt-0.5" />
                          <div className="text-sm">
                            <p>{school.address}</p>
                            <p className="text-gray-500">
                              {school.city}, {school.state} {school.zipCode}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {school.martialArts.slice(0, 2).map((art) => (
                            <Badge key={art} variant="secondary" className="text-xs">
                              {art}
                            </Badge>
                          ))}
                          {school.martialArts.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{school.martialArts.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="font-medium">{school.currentStudents}/{school.maxStudents}</p>
                          <div className="w-20 h-2 bg-gray-200 rounded-full mt-1">
                            <div 
                              className="h-2 bg-indigo-600 rounded-full"
                              style={{ width: `${(school.currentStudents / school.maxStudents) * 100}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={school.isActive ? 'default' : 'secondary'}>
                          {school.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center space-x-1">
                            <Phone className="h-3 w-3 text-gray-400" />
                            <span>{school.phone}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Mail className="h-3 w-3 text-gray-400" />
                            <span className="text-xs">{school.email}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditSchool(school)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteSchool(school)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* School Modal */}
      <SchoolModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveSchool}
        school={selectedSchool}
        mode={modalMode}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the school "{schoolToDelete?.name}" and all associated data. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  )
}