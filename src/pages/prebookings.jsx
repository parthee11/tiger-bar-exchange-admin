import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Calendar, Filter } from "lucide-react"
import { Button } from "../components/ui/button"

const prebookings = [
  { id: "PB-001", customer: "Corporate Event Inc.", outlet: "Downtown", date: "2023-06-15", time: "19:00", guests: 25, status: "Pending" },
  { id: "PB-002", customer: "Birthday Party", outlet: "Uptown", date: "2023-06-18", time: "20:30", guests: 12, status: "Confirmed" },
  { id: "PB-003", customer: "Team Outing", outlet: "Riverside", date: "2023-06-20", time: "18:00", guests: 15, status: "Confirmed" },
  { id: "PB-004", customer: "Anniversary", outlet: "Downtown", date: "2023-06-25", time: "19:30", guests: 2, status: "Pending" },
  { id: "PB-005", customer: "Graduation Party", outlet: "Uptown", date: "2023-06-30", time: "21:00", guests: 20, status: "Confirmed" },
]

export function Prebookings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Prebookings</h1>
        <p className="text-muted-foreground">
          View pending/active prebookings
        </p>
      </div>
      
      <Card>
        <CardHeader className="flex flex-row items-center">
          <div>
            <CardTitle>Upcoming Prebookings</CardTitle>
            <CardDescription>
              Manage reservations and special events
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" className="ml-auto flex items-center gap-1">
            <Filter className="h-4 w-4" /> Filter
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50 text-sm">
                  <th className="p-3 text-left font-medium">Booking ID</th>
                  <th className="p-3 text-left font-medium">Customer</th>
                  <th className="p-3 text-left font-medium">Outlet</th>
                  <th className="p-3 text-left font-medium">Date</th>
                  <th className="p-3 text-left font-medium">Time</th>
                  <th className="p-3 text-left font-medium">Guests</th>
                  <th className="p-3 text-left font-medium">Status</th>
                  <th className="p-3 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {prebookings.map((booking) => (
                  <tr key={booking.id} className="border-b">
                    <td className="p-3 font-medium">{booking.id}</td>
                    <td className="p-3">{booking.customer}</td>
                    <td className="p-3">{booking.outlet}</td>
                    <td className="p-3">{booking.date}</td>
                    <td className="p-3">{booking.time}</td>
                    <td className="p-3">{booking.guests}</td>
                    <td className="p-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        booking.status === "Confirmed" 
                          ? "bg-green-100 text-green-800" 
                          : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <Button variant="outline" size="sm">
                        {booking.status === "Pending" ? "Confirm" : "View"}
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