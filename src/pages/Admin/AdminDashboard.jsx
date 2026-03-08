import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Users, BookOpen, MonitorPlay, BarChart2 } from "lucide-react";

export const AdminDashboard = () => {
  const stats = [
    { title: "Total Teachers", value: "42", icon: Users, color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30" },
    { title: "Total Students", value: "1,248", icon: Users, color: "text-green-600", bg: "bg-green-100 dark:bg-green-900/30" },
    { title: "Total Tests", value: "156", icon: MonitorPlay, color: "text-purple-600", bg: "bg-purple-100 dark:bg-purple-900/30" },
    { title: "Question Bank", value: "892", icon: BookOpen, color: "text-orange-600", bg: "bg-orange-100 dark:bg-orange-900/30" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Overview</h2>
        <p className="text-gray-500 dark:text-gray-400">
          Welcome back, Admin. Here's what's happening today.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mt-4 lg:grid-cols-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-full ${stat.bg}`}>
                  <Icon size={16} className={stat.color} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2 mt-8">
        <Card className="min-h-[300px]">
          <CardHeader>
            <CardTitle>Recent Platform Activity</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-500 flex items-center justify-center h-48">
            <div className="flex flex-col items-center gap-2">
              <BarChart2 size={32} className="text-gray-300" />
              <p>Activity chart placeholder</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="min-h-[300px]">
          <CardHeader>
            <CardTitle>System Health</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-500 flex items-center justify-center h-48">
            <div className="flex flex-col items-center gap-2">
              <MonitorPlay size={32} className="text-gray-300" />
              <p>All services are operational</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
