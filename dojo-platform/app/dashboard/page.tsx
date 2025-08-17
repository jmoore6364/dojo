'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    // In a real app, you'd fetch user data from API
    // For now, we'll mock it
    setUser({
      name: 'John Doe',
      role: 'student',
      email: 'john@dojo.com'
    })
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/login')
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Dojo Platform Dashboard
            </h1>
            <Button 
              onClick={handleLogout}
              variant="outline"
              data-testid="logout-button"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2" data-testid="welcome-message">
            Welcome back, {user.name}!
          </h2>
          <p className="text-gray-600">
            Role: {user.role} | Email: {user.email}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Classes Today</CardTitle>
              <CardDescription>Your scheduled classes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">3</div>
              <p className="text-sm text-gray-600 mt-2">
                Next: Karate Basics at 6:00 PM
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Attendance Rate</CardTitle>
              <CardDescription>Last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">92%</div>
              <p className="text-sm text-gray-600 mt-2">
                Great job keeping up!
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Current Rank</CardTitle>
              <CardDescription>Your progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">Yellow Belt</div>
              <p className="text-sm text-gray-600 mt-2">
                Next grading: March 2024
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" variant="outline">
                View Class Schedule
              </Button>
              <Button className="w-full" variant="outline">
                Mark Attendance
              </Button>
              <Button className="w-full" variant="outline">
                View Learning Materials
              </Button>
              <Button className="w-full" variant="outline">
                Order Equipment
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Announcements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="border-l-4 border-blue-500 pl-3">
                  <p className="font-semibold">Tournament Registration Open</p>
                  <p className="text-sm text-gray-600">Sign up by March 15th</p>
                </div>
                <div className="border-l-4 border-green-500 pl-3">
                  <p className="font-semibold">New Class Added</p>
                  <p className="text-sm text-gray-600">Advanced sparring on Thursdays</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}