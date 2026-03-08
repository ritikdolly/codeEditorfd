import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { LogOut, Link2, MonitorPlay } from "lucide-react";

export const StudentDashboard = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [testLink, setTestLink] = useState(id || "");

  const handleJoin = (e) => {
    e.preventDefault();
    if (!testLink) return;
    
    // Extract ID if it's a full URL
    const parts = testLink.split("/");
    const testId = parts[parts.length - 1];
    
    navigate(`/student/test/${testId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6 dark:border-gray-800 dark:bg-gray-900 shadow-sm">
        <div className="flex items-center gap-2 font-bold text-xl text-blue-600 dark:text-blue-500">
          <MonitorPlay size={24} />
          <span>CodeArena Student</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">{user?.name}</span>
          <Button variant="ghost" size="sm" onClick={logout} className="text-gray-500 hover:text-red-600">
            <LogOut size={16} />
          </Button>
        </div>
      </header>
      
      <main className="max-w-4xl mx-auto p-6 mt-10">
        <h2 className="text-3xl font-bold tracking-tight mb-2">Welcome, {user?.name?.split(" ")[0] || "Student"}!</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-10">
          Ready to test your algorithmic skills? Enter a test code or paste an invitation link to begin.
        </p>

        <Card className="max-w-md mx-auto shadow-lg border-t-4 border-t-green-500">
          <CardHeader>
            <CardTitle>Join a CodeArena Test</CardTitle>
            <CardDescription>
              Your teacher should have provided you with a test link or code.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleJoin} className="space-y-4">
              <Input 
                label="Invitation Link or Test Code" 
                placeholder="e.g. 9xh2kja or https://..." 
                value={testLink}
                onChange={(e) => setTestLink(e.target.value)}
                autoFocus
                required 
              />
              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white transition-all h-12">
                <Link2 className="mr-2" size={18} />
                Join Test Room
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};
