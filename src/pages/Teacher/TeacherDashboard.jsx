import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { PlusCircle, BookOpen, Clock, Users, ChevronRight } from "lucide-react";

export const TeacherDashboard = () => {
  const activeTests = [
    { id: "t1", name: "Data Structures Midterm", students: 45, duration: "120m", status: "Active" },
    { id: "t2", name: "React Basics Assessment", students: 120, duration: "60m", status: "Scheduled" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Teacher Dashboard</h2>
        <p className="text-gray-500 dark:text-gray-400">
          Manage your questions, tests, and monitor student performance.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none">
          <CardHeader>
            <CardTitle className="text-white">Need to assess students?</CardTitle>
            <CardDescription className="text-blue-100">
              Create a new coding test and share the link or QR code.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/teacher/tests/create">
              <Button className="bg-white text-blue-600 hover:bg-gray-100">
                <PlusCircle className="mr-2" size={18} />
                Create New Test
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-none">
          <CardHeader>
            <CardTitle className="text-white">Grow your Question Bank</CardTitle>
            <CardDescription className="text-indigo-100">
              Add new algorithmic challenges for your tests.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/teacher/questions">
              <Button className="bg-white text-indigo-600 hover:bg-gray-100">
                <BookOpen className="mr-2" size={18} />
                Add Question
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Your Active & Scheduled Tests</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {activeTests.map((test) => (
            <Card key={test.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-0.5 rounded-full dark:bg-green-900/30 dark:text-green-400">
                    {test.status}
                  </div>
                </div>
                <CardTitle className="text-lg mt-2">{test.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center"><Users className="mr-1" size={14}/> {test.students}</span>
                  <span className="flex items-center"><Clock className="mr-1" size={14}/> {test.duration}</span>
                </div>
                <Button variant="ghost" className="w-full mt-4 justify-between h-8 text-sm">
                  Monitor Test <ChevronRight size={16} />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
