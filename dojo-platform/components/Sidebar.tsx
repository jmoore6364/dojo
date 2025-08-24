'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import {
  LayoutDashboard,
  Users,
  Calendar,
  GraduationCap,
  Trophy,
  CreditCard,
  BarChart3,
  Settings,
  Building2,
  UserCheck,
  ClipboardList,
  Bell,
  FileText,
  LogOut,
  Menu,
  X
} from 'lucide-react'
import { useState } from 'react'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  roles?: string[]
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />
  },
  {
    label: 'Students',
    href: '/students',
    icon: <Users className="w-5 h-5" />,
    roles: ['super_admin', 'org_admin', 'school_admin', 'instructor']
  },
  {
    label: 'Classes',
    href: '/classes',
    icon: <Calendar className="w-5 h-5" />
  },
  {
    label: 'Attendance',
    href: '/attendance',
    icon: <UserCheck className="w-5 h-5" />,
    roles: ['super_admin', 'org_admin', 'school_admin', 'instructor']
  },
  {
    label: 'Belt Rankings',
    href: '/rankings',
    icon: <Trophy className="w-5 h-5" />
  },
  {
    label: 'Payments',
    href: '/payments',
    icon: <CreditCard className="w-5 h-5" />,
    roles: ['super_admin', 'org_admin', 'school_admin']
  },
  {
    label: 'Reports',
    href: '/reports',
    icon: <BarChart3 className="w-5 h-5" />,
    roles: ['super_admin', 'org_admin', 'school_admin']
  },
  {
    label: 'Schools',
    href: '/schools',
    icon: <Building2 className="w-5 h-5" />,
    roles: ['super_admin', 'org_admin']
  },
  {
    label: 'Instructors',
    href: '/instructors',
    icon: <GraduationCap className="w-5 h-5" />,
    roles: ['super_admin', 'org_admin', 'school_admin']
  },
  {
    label: 'Curriculum',
    href: '/curriculum',
    icon: <ClipboardList className="w-5 h-5" />,
    roles: ['super_admin', 'org_admin', 'school_admin', 'instructor']
  },
  {
    label: 'Documents',
    href: '/documents',
    icon: <FileText className="w-5 h-5" />
  },
  {
    label: 'Notifications',
    href: '/notifications',
    icon: <Bell className="w-5 h-5" />
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: <Settings className="w-5 h-5" />
  }
]

export default function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const filteredNavItems = navItems.filter(item => {
    if (!item.roles) return true
    return item.roles.includes(user?.role || '')
  })

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-md"
      >
        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-gray-900 transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 bg-gray-800">
            <h1 className="text-xl font-bold text-white">Dojo Platform</h1>
          </div>

          {/* User info */}
          <div className="px-4 py-4 bg-gray-800 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{user?.name || 'User'}</p>
                <p className="text-xs text-gray-400 capitalize">{user?.role?.replace('_', ' ')}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {filteredNavItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Logout button */}
          <div className="p-4 border-t border-gray-700">
            <button
              onClick={logout}
              className="flex items-center space-x-3 w-full px-3 py-2 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}