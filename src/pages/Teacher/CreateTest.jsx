import React, { useState } from "react";
import QRCode from "react-qr-code";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card";
import { Input, Select } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { Link2, QrCode } from "lucide-react";

export const CreateTest = () => {
  const [showQRModal, setShowQRModal] = useState(false);
  const [testLink, setTestLink] = useState("");

  const handleCreateTest = (e) => {
    e.preventDefault();
    // Simulate test creation
    const mockTestId = Math.random().toString(36).substring(2, 9);
    const link = `http://localhost:5173/student/join/${mockTestId}`;
    setTestLink(link);
    setShowQRModal(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Create New Test</h2>
        <p className="text-gray-500 dark:text-gray-400">
          Set up a new assessment and share it with your students.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Test Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <form id="create-test" onSubmit={handleCreateTest} className="space-y-4">
              <Input label="Test Name" placeholder="e.g. Midterm Lab Exam" required />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Duration (minutes)" type="number" defaultValue={60} required />
                <Select 
                  label="Strict Mode" 
                  options={[
                    { label: "Enabled (Tab tracking ON)", value: "on" },
                    { label: "Disabled", value: "off" }
                  ]} 
                />
              </div>
              <div className="pt-4 border-t dark:border-gray-800">
                <h4 className="text-sm font-medium mb-3">Select Questions</h4>
                <div className="space-y-2 border rounded-md p-4 bg-gray-50 dark:bg-gray-900/50 dark:border-gray-800">
                  <label className="flex items-center space-x-3">
                    <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" />
                    <span className="text-sm">Two Sum (Easy)</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" />
                    <span className="text-sm">Reverse Linked List (Medium)</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" />
                    <span className="text-sm">Merge K Sorted Lists (Hard)</span>
                  </label>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Selected Questions:</span>
                <span className="font-semibold">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total Marks:</span>
                <span className="font-semibold">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Duration:</span>
                <span className="font-semibold">60m</span>
              </div>
              <Button type="submit" form="create-test" className="w-full mt-4">
                Publish Test
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Modal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        title="Test Published Successfully!"
      >
        <div className="flex flex-col items-center space-y-6 py-4">
          <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
            {testLink && <QRCode value={testLink} size={200} />}
          </div>
          
          <div className="text-center space-y-2 w-full">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Scan QR Code to Join</h3>
            <p className="text-sm text-gray-500">Or share the exact link with students:</p>
            
            <div className="flex items-center space-x-2 mt-2">
              <Input value={testLink} readOnly className="font-mono text-xs text-center" />
              <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(testLink)}>
                <Link2 size={16} />
              </Button>
            </div>
          </div>
          <Button className="w-full" onClick={() => setShowQRModal(false)}>
            Close
          </Button>
        </div>
      </Modal>
    </div>
  );
};
