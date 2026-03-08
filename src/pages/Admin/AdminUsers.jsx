import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/Table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card";
import { Search, MoreHorizontal } from "lucide-react";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";

const MOCK_USERS = [
  { id: 1, name: "Admin Setup", email: "admin@codearena.com", role: "Admin", joined: "Oct 24, 2023", status: "Active" },
  { id: 2, name: "Prof. Alan Turing", email: "alan@university.edu", role: "Teacher", joined: "Jan 12, 2024", status: "Active" },
  { id: 3, name: "Ada Lovelace", email: "ada@student.edu", role: "Student", joined: "Jan 15, 2024", status: "Active" },
  { id: 4, name: "Grace Hopper", email: "grace@student.edu", role: "Student", joined: "Feb 02, 2024", status: "Suspended" },
];

export const AdminUsers = () => {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">User Management</h2>
          <p className="text-gray-500 dark:text-gray-400">
            View and manage all platform administrators, teachers, and students.
          </p>
        </div>
        <Button>Add New User</Button>
      </div>

      <Card className="mt-6">
        <CardHeader className="flex flex-row justify-between items-center border-b dark:border-gray-800 pb-4">
          <div className="flex gap-4">
            <div className="relative w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input className="pl-9 h-9" placeholder="Search users by name or email..." />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_USERS.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell className="capitalize">{user.role}</TableCell>
                  <TableCell className="text-gray-500">{user.joined}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.status === "Active" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                    }`}>
                      {user.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
