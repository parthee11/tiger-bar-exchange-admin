import { useState } from "react"
import { Sidebar } from "../components/sidebar"
import { Menu, X } from "lucide-react"
import { Button } from "../components/ui/button"

export function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  
  return (
    <div className="flex min-h-screen">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>
      
      {/* Sidebar */}
      <div className={`
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
        fixed inset-y-0 z-40 lg:static lg:translate-x-0 transition-transform duration-200 ease-in-out
      `}>
        <Sidebar />
      </div>
      
      {/* Main content */}
      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        {children}
      </main>
      
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}