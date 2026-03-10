import React, { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import { studentService } from "../../services/api";

const DEFAULT_CODE = `import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Your solution here\n        \n    }\n}`;

const LiveTestEditorComponent = ({ testId, questionId, code, onChange, setCodeMap, isAttemptInProgress }) => {
    const isFirstLoad = useRef(true);
    const [isFetchingLocal, setIsFetchingLocal] = useState(true);

    // Fetch initial draft
    useEffect(() => {
        const fetchDraft = async () => {
            if (!code || code === DEFAULT_CODE || code === "") {
                try {
                    const res = await studentService.getDraft(testId, questionId);
                    if (res?.code && res.code.trim() !== '') {
                        setCodeMap(prev => ({ ...prev, [questionId]: res.code }));
                    } else if (!code) {
                        setCodeMap(prev => ({ ...prev, [questionId]: DEFAULT_CODE }));
                    }
                } catch (err) {
                    console.error("Could not load draft", err);
                    if (!code) setCodeMap(prev => ({ ...prev, [questionId]: DEFAULT_CODE }));
                }
            }
            setIsFetchingLocal(false);
        };
        fetchDraft();
    }, [testId, questionId]);

    // Autosave periodic draft
    useEffect(() => {
        if (!isAttemptInProgress) return;
        if (isFetchingLocal) return; // don't autosave while getting initial

        if (isFirstLoad.current) {
            isFirstLoad.current = false;
            return;
        }

        const interval = setInterval(() => {
            if (code && code.trim() !== '') {
                studentService.saveDraft(testId, questionId, code)
                .catch(err => console.error("Draft save failed", err));
            }
        }, 30000); // 30 seconds

        return () => clearInterval(interval);
    }, [code, testId, questionId, isAttemptInProgress, isFetchingLocal]);

    return (
        <Editor
            height="100%"
            defaultLanguage="java"
            value={code}
            onChange={(val) => onChange(val || "")}
            theme="vs-dark"
            options={{
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbersMinChars: 3,
                padding: { top: 12 },
            }}
        />
    );
};

export default LiveTestEditorComponent;
