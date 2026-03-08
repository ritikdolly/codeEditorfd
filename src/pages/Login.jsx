import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { Code, User, UserCircle, Settings } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  
  // Hardcoded for mock authentication
  const handleMockLogin = (role) => {
    if (!email && role !== 'ADMIN') {
      toast.error("Please enter a mock email first");
      return;
    }

    const mockId = crypto.randomUUID(); // Simulated Backend UUID
    login({ id: mockId, name: email.split('@')[0] || 'Admin User', email, role });

    if (role === 'ADMIN') navigate('/admin');
    if (role === 'TEACHER') navigate('/teacher');
    if (role === 'STUDENT') {
        const shareLink = prompt("Enter Test Share Link (leave blank for general dashboard):");
        if (shareLink) navigate(`/student/join/${shareLink}`);
        else navigate('/student');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center text-blue-600">
          <Code size={48} strokeWidth={1.5} />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Welcome to CodeArena
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Mock Login Interface (Security Disabled)
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Mock Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="test@example.com"
                />
              </div>
            </div>

            <div className="mt-6 border-t border-gray-200 pt-6">
              <p className="text-sm font-medium text-gray-700 mb-4">Select your role to Login:</p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => handleMockLogin('ADMIN')}
                  className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-slate-800 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900"
                >
                  <Settings size={18} /> Login as Admin
                </button>
                <button
                  onClick={() => handleMockLogin('TEACHER')}
                  className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <UserCircle size={18} /> Login as Teacher
                </button>
                <button
                  onClick={() => handleMockLogin('STUDENT')}
                  className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <User size={18} /> Join as Student
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
