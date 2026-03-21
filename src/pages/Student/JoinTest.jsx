import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

export default function JoinTest() {
  const { shareLink } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);
  const [testDetails, setTestDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!shareLink) return;
    api.get(`/student/tests/${shareLink}`)
       .then(res => setTestDetails(res.data))
       .catch(err => {
           toast.error("Invalid test link or test not found or you are not login");
           navigate('/');
       })
       .finally(() => setLoading(false));
  }, [shareLink, navigate]);

  const handleStartExam = () => {
      // Directs the student to the active exam interface
      navigate(`/student/test/${testDetails.id}`);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="flex flex-col items-center justify-center pt-20 px-4">
        {loading ? (
          <div className="text-gray-500 text-lg">Verifying test details...</div>
        ) : testDetails ? (
          <div className="bg-white p-8 max-w-lg w-full shadow-lg rounded-xl text-center border border-gray-100">
            <h1 className="text-3xl font-extrabold text-slate-800 mb-2">
              {testDetails.name}
            </h1>
            <p className="text-gray-500 mb-6 font-medium tracking-wide">
              Hosted on CodeArena
            </p>
            <div className="bg-slate-50 rounded-lg p-6 mb-8 text-left border border-slate-100">
              <div className="mb-4">
                <span className="block text-sm font-semibold text-gray-500 uppercase tracking-wider">
                  Duration
                </span>
                <span className="text-lg font-medium text-slate-800">
                  {testDetails.duration} Minutes
                </span>
              </div>
              <div className="mb-4">
                <span className="block text-sm font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </span>
                <span
                  className={`inline-flex px-2 py-1 rounded text-sm font-semibold mt-1 ${testDetails.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                >
                  {testDetails.status}
                </span>
              </div>
              <div>
                <span className="block text-sm font-semibold text-gray-500 uppercase tracking-wider">
                  Candidate
                </span>
                <span className="text-lg font-medium text-slate-800">
                  {user?.name} ({user?.email})
                </span>
              </div>
            </div>
            <button
              disabled={testDetails.status !== "ACTIVE"}
              onClick={handleStartExam}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-lg shadow-md transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {testDetails.status === "ACTIVE"
                ? "Join & Start Exam"
                : "Waiting for Teacher to Start..."}
            </button>
            {testDetails.status !== "ACTIVE" && (
              <p className="text-sm text-gray-500 mt-4 italic">
                Please wait for your instructor to begin the test.
              </p>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
