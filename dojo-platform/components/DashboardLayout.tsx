'use client'

import Sidebar from './Sidebar'
import ProtectedRoute from './ProtectedRoute'

interface DashboardLayoutProps {
  children: React.ReactNode
  title?: string
  allowedRoles?: string[]
}

export default function DashboardLayout({ children, title, allowedRoles }: DashboardLayoutProps) {
  return (
    <ProtectedRoute allowedRoles={allowedRoles}>
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        
        {/* Main content */}
        <div className="lg:pl-64">
          {/* Header */}
          {title && (
            <header className="bg-white shadow-sm border-b">
              <div className="px-4 sm:px-6 lg:px-8 py-4">
                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              </div>
            </header>
          )}
          
          {/* Page content */}
          <main className="p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}