'use client'

import DashboardLayout from '@/components/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  UserCheck,
  Clock,
  Award,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Activity,
  BookOpen,
  Target,
  Zap,
  Trophy
} from 'lucide-react'

export default function DashboardPage() {
  const { user } = useAuth()

  // Role-based dashboard content
  const isAdmin = ['super_admin', 'org_admin', 'school_admin'].includes(user?.role || '')
  const isInstructor = user?.role === 'instructor'
  const isStudent = user?.role === 'student'

  return (
    <DashboardLayout title="Dashboard">
      {/* Welcome Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Welcome back, {user?.name || 'User'}!
        </h2>
        <p className="text-gray-600">
          Here's what's happening at your dojo today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {(isAdmin || isInstructor) && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">156</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600 inline-flex items-center">
                    <ArrowUp className="w-3 h-3 mr-1" />
                    12%
                  </span>{' '}
                  from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Classes Today</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8</div>
                <p className="text-xs text-muted-foreground">
                  Next: Beginners Karate at 4:00 PM
                </p>
              </CardContent>
            </Card>
          </>
        )}

        {isAdmin && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$12,450</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600 inline-flex items-center">
                    <ArrowUp className="w-3 h-3 mr-1" />
                    8%
                  </span>{' '}
                  from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">87%</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-red-600 inline-flex items-center">
                    <ArrowDown className="w-3 h-3 mr-1" />
                    3%
                  </span>{' '}
                  from last week
                </p>
              </CardContent>
            </Card>
          </>
        )}

        {isStudent && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Your Attendance</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">92%</div>
                <p className="text-xs text-muted-foreground">23 of 25 classes attended</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Rank</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Yellow Belt</div>
                <p className="text-xs text-muted-foreground">Next grading: March 15</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Training Hours</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">48</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Achievements</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">7</div>
                <p className="text-xs text-muted-foreground">2 new this month</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
            <CardDescription>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { time: '9:00 AM', class: 'Kids Karate', instructor: 'John Smith', students: 12, status: 'completed' },
                { time: '11:00 AM', class: 'Adult BJJ', instructor: 'Maria Garcia', students: 8, status: 'completed' },
                { time: '2:00 PM', class: 'Teen Taekwondo', instructor: 'Mike Johnson', students: 15, status: 'in-progress' },
                { time: '4:00 PM', class: 'Beginners Karate', instructor: 'John Smith', students: 10, status: 'upcoming' },
                { time: '6:00 PM', class: 'Advanced MMA', instructor: 'Carlos Silva', students: 6, status: 'upcoming' },
                { time: '7:30 PM', class: 'Women\'s Self Defense', instructor: 'Maria Garcia', students: 9, status: 'upcoming' },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="text-sm font-medium text-gray-600 w-20">{item.time}</div>
                    <div className={`w-2 h-2 rounded-full ${
                      item.status === 'completed' ? 'bg-green-500' :
                      item.status === 'in-progress' ? 'bg-blue-500' :
                      'bg-gray-300'
                    }`} />
                    <div>
                      <p className="font-medium text-gray-900">{item.class}</p>
                      <p className="text-sm text-gray-600">
                        {item.instructor} • {item.students} students
                      </p>
                    </div>
                  </div>
                  {item.status === 'in-progress' && (
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                      In Progress
                    </span>
                  )}
                  {item.status === 'upcoming' && (
                    <Button size="sm" variant="outline">View</Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {isAdmin && (
              <>
                <Button className="w-full justify-start" variant="outline">
                  <Users className="mr-2 h-4 w-4" />
                  Add New Student
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule Class
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <DollarSign className="mr-2 h-4 w-4" />
                  Process Payment
                </Button>
              </>
            )}
            {(isAdmin || isInstructor) && (
              <>
                <Button className="w-full justify-start" variant="outline">
                  <UserCheck className="mr-2 h-4 w-4" />
                  Take Attendance
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Award className="mr-2 h-4 w-4" />
                  Grade Student
                </Button>
              </>
            )}
            {isStudent && (
              <>
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="mr-2 h-4 w-4" />
                  View My Schedule
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Learning Materials
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Target className="mr-2 h-4 w-4" />
                  My Progress
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <DollarSign className="mr-2 h-4 w-4" />
                  Payment History
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { icon: <Users className="w-4 h-4" />, text: 'New student registration: Emma Wilson', time: '2 hours ago', color: 'text-blue-600' },
                { icon: <Award className="w-4 h-4" />, text: 'Belt promotion: Jake Martinez to Orange Belt', time: '5 hours ago', color: 'text-green-600' },
                { icon: <DollarSign className="w-4 h-4" />, text: 'Payment received from Sarah Johnson', time: '1 day ago', color: 'text-indigo-600' },
                { icon: <AlertCircle className="w-4 h-4" />, text: 'Class cancelled: Evening BJJ (Instructor sick)', time: '2 days ago', color: 'text-red-600' },
                { icon: <Calendar className="w-4 h-4" />, text: 'Tournament scheduled for April 20th', time: '3 days ago', color: 'text-purple-600' },
              ].map((item, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`p-2 rounded-full bg-gray-100 ${item.color}`}>
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{item.text}</p>
                    <p className="text-xs text-gray-500">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Announcements */}
        <Card>
          <CardHeader>
            <CardTitle>Announcements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                <div className="flex items-start">
                  <Zap className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                  <div>
                    <p className="font-semibold text-blue-900">Spring Tournament Registration Open</p>
                    <p className="text-sm text-blue-700 mt-1">
                      Register by March 31st for the annual spring tournament. All belt levels welcome!
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded">
                <div className="flex items-start">
                  <Activity className="w-5 h-5 text-green-600 mr-2 mt-0.5" />
                  <div>
                    <p className="font-semibold text-green-900">New Sparring Equipment Available</p>
                    <p className="text-sm text-green-700 mt-1">
                      Check out our new protective gear in the pro shop. 20% discount for members this week!
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
                  <div>
                    <p className="font-semibold text-yellow-900">Holiday Schedule Notice</p>
                    <p className="text-sm text-yellow-700 mt-1">
                      The dojo will be closed on March 17th for St. Patrick's Day. Regular schedule resumes March 18th.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Chart (for admins) */}
      {isAdmin && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Performance Overview</CardTitle>
            <CardDescription>Monthly trends and analytics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Chart visualization would go here</p>
                <p className="text-sm text-gray-400 mt-1">Integration with charting library pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  )
}