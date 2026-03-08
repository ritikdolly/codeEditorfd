import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/Table";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Search } from "lucide-react";
import { Input } from "../../components/ui/Input";

const MOCK_STUDENTS = [
  { id: 1, name: "Alice Johnson", email: "alice@example.com", status: "Submitted", score: "8/10", time: "42m 15s" },
  { id: 2, name: "Bob Smith", email: "bob@example.com", status: "Coding...", score: "-", time: "45m 00s" },
  { id: 3, name: "Charlie Davis", email: "charlie@example.com", status: "Submitted", score: "10/10", time: "30m 10s" },
  { id: 4, name: "Dana White", email: "dana@example.com", status: "Disconnected", score: "-", time: "15m 00s" },
];

export const TeacherMonitor = () => {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Live Test Monitor</h2>
        <p className="text-gray-500 dark:text-gray-400">
          Midterm Lab Exam - Data Structures
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm text-gray-500 font-medium">Total Joined</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45 / 50</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm text-gray-500 font-medium">Submitted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">22</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm text-gray-500 font-medium">Active (Coding)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">21</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm text-gray-500 font-medium">Disconnected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">2</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b dark:border-gray-800 pb-4">
          <CardTitle>Student Roster</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input className="pl-9 h-9" placeholder="Search students..." />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Time Elapsed</TableHead>
                <TableHead className="text-right">Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_STUDENTS.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell>{student.email}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      student.status === "Submitted" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                      student.status === "Coding..." ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                      "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    }`}>
                      {student.status}
                    </span>
                  </TableCell>
                  <TableCell>{student.time}</TableCell>
                  <TableCell className="text-right font-medium">{student.score}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
