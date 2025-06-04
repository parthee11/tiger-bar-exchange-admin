import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { UserPlus, Key, LogOut, RefreshCw, Shield } from "lucide-react"

const adminUsers = [
  { id: 1, name: "Admin User", email: "admin@tigerbar.com", role: "Super Admin", lastLogin: "2023-05-26 18:45" },
  { id: 2, name: "Manager", email: "manager@tigerbar.com", role: "Manager", lastLogin: "2023-05-26 10:30" },
  { id: 3, name: "Staff", email: "staff@tigerbar.com", role: "Staff", lastLogin: "2023-05-25 21:15" },
]

export function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Admin login/logout, token refresh, roles
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Authentication</CardTitle>
            <CardDescription>
              Manage your account and security settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-md">
              <div className="flex items-center gap-3">
                <Key className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">API Token</p>
                  <p className="text-sm text-muted-foreground">Last refreshed 2 days ago</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <RefreshCw className="h-3 w-3" /> Refresh
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-md">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">Enabled</p>
                </div>
              </div>
              <Button variant="outline" size="sm">Configure</Button>
            </div>
            
            <Button variant="destructive" className="w-full flex items-center gap-2 mt-4">
              <LogOut className="h-4 w-4" /> Logout
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Admin Users</CardTitle>
              <CardDescription>
                Manage admin access and roles
              </CardDescription>
            </div>
            <Button size="sm" className="flex items-center gap-1">
              <UserPlus className="h-4 w-4" /> Add User
            </Button>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50 text-sm">
                    <th className="p-3 text-left font-medium">Name</th>
                    <th className="p-3 text-left font-medium">Email</th>
                    <th className="p-3 text-left font-medium">Role</th>
                    <th className="p-3 text-left font-medium">Last Login</th>
                  </tr>
                </thead>
                <tbody>
                  {adminUsers.map((user) => (
                    <tr key={user.id} className="border-b">
                      <td className="p-3 font-medium">{user.name}</td>
                      <td className="p-3">{user.email}</td>
                      <td className="p-3">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          user.role === "Super Admin" 
                            ? "bg-purple-100 text-purple-800" 
                            : user.role === "Manager"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="p-3">{user.lastLogin}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}