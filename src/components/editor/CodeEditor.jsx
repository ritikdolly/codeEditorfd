import React, { useState } from "react";
import { Editor } from "@monaco-editor/react";
import { Play, Send } from "lucide-react";
import { Button } from "../ui/Button";

const languageBoilerplates = {
  javascript: "function solution() {\n  // Write your code here\n}\n",
  python: "def solution():\n    # Write your code here\n    pass\n",
  java: "public class Solution {\n    public static void main(String[] args) {\n        // Write your code here\n    }\n}\n",
  cpp: "#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    return 0;\n}\n",
};

export const CodeEditor = ({ onRun, onSubmit }) => {
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState(languageBoilerplates["javascript"]);

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    setLanguage(lang);
    setCode(languageBoilerplates[lang] || "");
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#1e1e1e]">
      <div className="flex items-center justify-between p-2 pl-4 border-b border-gray-800 bg-[#252526]">
        <div className="flex items-center space-x-4">
          <select 
            className="bg-[#333333] border-none outline-none text-white text-sm rounded px-2 py-1 focus:ring-1 focus:ring-blue-500"
            value={language}
            onChange={handleLanguageChange}
          >
            <option value="javascript">JavaScript (Node.js)</option>
            <option value="python">Python 3.x</option>
            <option value="java">Java (OpenJDK)</option>
            <option value="cpp">C++ (GCC)</option>
          </select>
        </div>
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-gray-800" onClick={() => onRun(code, language)}>
            <Play size={16} className="mr-2 text-green-500" />
            Run Code
          </Button>
          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => onSubmit(code, language)}>
            <Send size={16} className="mr-2" />
            Submit
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden relative">
        <Editor
          height="100%"
          language={language}
          theme="vs-dark"
          value={code}
          onChange={(val) => setCode(val)}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            wordWrap: "on",
            padding: { top: 16 },
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            cursorBlinking: "smooth",
          }}
        />
      </div>
    </div>
  );
};
