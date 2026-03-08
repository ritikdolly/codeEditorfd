import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../../components/ui/Card";
import { Input, Textarea, Select } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { PlusCircle, Trash2, Save } from "lucide-react";
import toast from "react-hot-toast";

export const CreateQuestion = () => {
  const navigate = useNavigate();
  const [testCases, setTestCases] = useState([{ input: "", output: "", isHidden: false }]);

  const addTestCase = () => {
    setTestCases([...testCases, { input: "", output: "", isHidden: false }]);
  };

  const removeTestCase = (index) => {
    setTestCases(testCases.filter((_, i) => i !== index));
  };

  const updateTestCase = (index, field, value) => {
    const updated = [...testCases];
    updated[index][field] = value;
    setTestCases(updated);
  };

  const handleSave = (e) => {
    e.preventDefault();
    toast.success("Question saved successfully!");
    navigate("/teacher");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Create Question</h2>
        <p className="text-gray-500 dark:text-gray-400">
          Add a new programming problem to the question bank.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Problem Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input label="Question Title" placeholder="e.g. Two Sum" required />
            <Textarea 
              label="Problem Description" 
              placeholder="Describe the problem, input format, output format, and constraints..." 
              required 
              rows={5}
            />
            <div className="grid grid-cols-2 gap-4">
              <Select 
                label="Difficulty" 
                options={[
                  { label: "Easy", value: "easy" },
                  { label: "Medium", value: "medium" },
                  { label: "Hard", value: "hard" }
                ]} 
              />
              <Input label="Marks" type="number" defaultValue={10} min={1} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Textarea label="Input Format" placeholder="e.g. The first line contains N..." />
              <Textarea label="Output Format" placeholder="e.g. Print a single integer..." />
            </div>
            <Textarea label="Constraints" placeholder="e.g. 1 <= N <= 10^5" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle>Test Cases</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addTestCase}>
              <PlusCircle size={16} className="mr-2" />
              Add Test Case
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {testCases.map((tc, idx) => (
              <div key={idx} className="relative p-4 border rounded-lg bg-gray-50 dark:bg-gray-900 dark:border-gray-800">
                <div className="absolute top-2 right-2">
                  <button 
                    type="button" 
                    onClick={() => removeTestCase(idx)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <Textarea 
                    label="Input" 
                    value={tc.input}
                    onChange={(e) => updateTestCase(idx, "input", e.target.value)}
                    required 
                    rows={2}
                  />
                  <Textarea 
                    label="Expected Output" 
                    value={tc.output}
                    onChange={(e) => updateTestCase(idx, "output", e.target.value)}
                    required 
                    rows={2}
                  />
                </div>
                <label className="flex items-center space-x-2 text-sm">
                  <input 
                    type="checkbox" 
                    checked={tc.isHidden}
                    onChange={(e) => updateTestCase(idx, "isHidden", e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Hidden Test Case (Used for evaluation, invisible to students)</span>
                </label>
              </div>
            ))}
          </CardContent>
          <CardFooter className="flex justify-end border-t dark:border-gray-800 pt-6">
            <Button type="button" variant="outline" className="mr-3" onClick={() => navigate("/teacher")}>
              Cancel
            </Button>
            <Button type="submit">
              <Save size={16} className="mr-2" />
              Save Question
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};
