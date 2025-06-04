import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Search, Award, Gift } from "lucide-react"

const users = [
  { id: 1, name: "John Doe", email: "john.doe@example.com", visits: 25, points: 450, tier: "Gold" },
  { id: 2, name: "Jane Smith", email: "jane.smith@example.com", visits: 18, points: 320, tier: "Silver" },
  { id: 3, name: "Mike Johnson", email: "mike.j@example.com", visits: 10, points: 180, tier: "Bronze" },
  { id: 4, name: "Sarah Williams", email: "sarah.w@example.com", visits: 32, points: 580, tier: "Platinum" },
  { id: 5, name: "David Brown", email: "david.b@example.com", visits: 15, points: 270, tier: "Silver" },
]

export function Loyalty() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Loyalty Settings</h1>
        <p className="text-muted-foreground">
          View users, assign manual rewards if needed
        </p>
      </div>
      
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search users..."
            className="w-full rounded-md border border-input bg-background py-2 pl-8 pr-3 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 h-10"
          />
        </div>
        <Button variant="outline">Search</Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Loyalty Program Users</CardTitle>
          <CardDescription>
            Manage user rewards and loyalty tiers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50 text-sm">
                  <th className="p-3 text-left font-medium">Name</th>
                  <th className="p-3 text-left font-medium">Email</th>
                  <th className="p-3 text-left font-medium">Visits</th>
                  <th className="p-3 text-left font-medium">Points</th>
                  <th className="p-3 text-left font-medium">Tier</th>
                  <th className="p-3 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b">
                    <td className="p-3 font-medium">{user.name}</td>
                    <td className="p-3">{user.email}</td>
                    <td className="p-3">{user.visits}</td>
                    <td className="p-3">{user.points}</td>
                    <td className="p-3">
                      <div className="flex items-center">
                        <Award className={`h-4 w-4 mr-1 ${
                          user.tier === "Platinum" ? "text-purple-500" :
                          user.tier === "Gold" ? "text-yellow-500" :
                          user.tier === "Silver" ? "text-gray-400" :
                          "text-amber-700"
                        }`} />
                        {user.tier}
                      </div>
                    </td>
                    <td className="p-3">
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <Gift className="h-3 w-3" /> Reward
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}