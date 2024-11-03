import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { prisma } from "@/lib/prisma"

export async function DashboardStats() {
  const stats = await Promise.all([
    prisma.post.count(),
    prisma.podcast.count(),
    prisma.user.count(),
    prisma.newsletter.count({ where: { active: true } }),
  ])

  const metrics = [
    { name: "Total Posts", value: stats[0] },
    { name: "Total Podcasts", value: stats[1] },
    { name: "Total Users", value: stats[2] },
    { name: "Newsletter Subscribers", value: stats[3] },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <Card key={metric.name}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {metric.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}