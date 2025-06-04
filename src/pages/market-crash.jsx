import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Select, SelectOption } from "../components/ui/select"
import { AlertTriangle, Clock, History } from "lucide-react"

const crashLogs = [
  { id: 1, date: "2023-05-26 19:30:45", duration: "15 minutes", affectedItems: 12, priceDropAvg: "35%" },
  { id: 2, date: "2023-05-20 21:15:22", duration: "20 minutes", affectedItems: 15, priceDropAvg: "40%" },
  { id: 3, date: "2023-05-15 20:45:10", duration: "10 minutes", affectedItems: 8, priceDropAvg: "25%" },
  { id: 4, date: "2023-05-10 22:10:05", duration: "15 minutes", affectedItems: 10, priceDropAvg: "30%" },
]

export function MarketCrash() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Market Crash</h1>
        <p className="text-muted-foreground">
          Trigger crash, timer, view logs
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Trigger Market Crash</CardTitle>
            <CardDescription>
              Initiate a market crash to drop prices
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md border p-4 bg-amber-50">
              <div className="flex items-start gap-4">
                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-amber-800">Warning</h4>
                  <p className="text-sm text-amber-700 mt-1">
                    Triggering a market crash will significantly reduce prices across all items. 
                    This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="duration">
                Crash Duration (minutes)
              </label>
              <Select id="duration">
                <SelectOption value="10">10 minutes</SelectOption>
                <SelectOption value="15">15 minutes</SelectOption>
                <SelectOption value="20">20 minutes</SelectOption>
                <SelectOption value="30">30 minutes</SelectOption>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="intensity">
                Crash Intensity
              </label>
              <Select id="intensity">
                <SelectOption value="low">Low (20% drop)</SelectOption>
                <SelectOption value="medium">Medium (35% drop)</SelectOption>
                <SelectOption value="high">High (50% drop)</SelectOption>
              </Select>
            </div>
            
            <Button className="w-full" variant="destructive">
              Trigger Market Crash
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Current Status</CardTitle>
            <CardDescription>
              Market crash status and timer
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center space-y-3 py-8">
              <div className="rounded-full bg-green-100 p-3">
                <Clock className="h-6 w-6 text-green-700" />
              </div>
              <h3 className="text-xl font-medium text-center">No Active Crash</h3>
              <p className="text-sm text-muted-foreground text-center">
                The market is currently stable. Prices are at normal levels.
              </p>
              {/* Uncomment for active crash
              <div className="rounded-full bg-red-100 p-3">
                <Clock className="h-6 w-6 text-red-700" />
              </div>
              <h3 className="text-xl font-medium text-center">Market Crash Active</h3>
              <div className="text-3xl font-bold">12:45</div>
              <p className="text-sm text-muted-foreground text-center">
                Remaining until prices stabilize
              </p>
              */}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader className="flex flex-row items-center">
          <div>
            <CardTitle>Crash History</CardTitle>
            <CardDescription>
              Recent market crash events
            </CardDescription>
          </div>
          <History className="ml-auto h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50 text-sm">
                  <th className="p-3 text-left font-medium">Date & Time</th>
                  <th className="p-3 text-left font-medium">Duration</th>
                  <th className="p-3 text-left font-medium">Affected Items</th>
                  <th className="p-3 text-left font-medium">Avg. Price Drop</th>
                </tr>
              </thead>
              <tbody>
                {crashLogs.map((log) => (
                  <tr key={log.id} className="border-b">
                    <td className="p-3">{log.date}</td>
                    <td className="p-3">{log.duration}</td>
                    <td className="p-3">{log.affectedItems}</td>
                    <td className="p-3">{log.priceDropAvg}</td>
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