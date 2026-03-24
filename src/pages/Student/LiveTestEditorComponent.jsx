import React, { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import { studentService } from "../../services/api";

const DEFAULT_CODE = `import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Your solution here\n        \n    }\n}`;

const LiveTestEditorComponent = ({ testId, questionId, code, onChange, setCodeMap, isAttemptInProgress }) => {
    const isFirstLoad = useRef(true);
    const [isFetchingLocal, setIsFetchingLocal] = useState(true);

    const editorRef = useRef(null);
    const monacoRef = useRef(null);

    // Fetch initial draft
    useEffect(() => {
        const fetchDraft = async () => {
            if (!code || code === DEFAULT_CODE || code === "") {
                try {
                    const questionRes = await studentService.getTestQuestions(testId);
                    const q = questionRes.find(item => item.id === questionId);
                    
                    let initialCode = DEFAULT_CODE;
                    if (q && q.templateCode) {
                        initialCode = q.templateCode;
                    } else if (q && (q.prefixCode || q.suffixCode)) {
                        initialCode = (q.prefixCode || "") + "\n/* START_EDITABLE */\n\n/* END_EDITABLE */\n" + (q.suffixCode || "");
                    }

                    const res = await studentService.getDraft(testId, questionId);
                    if (res?.code && res.code.trim() !== '') {
                        setCodeMap(prev => ({ ...prev, [questionId]: res.code }));
                    } else {
                        setCodeMap(prev => ({ ...prev, [questionId]: initialCode }));
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

    // Define custom theme to match the new UI
    const handleBeforeMount = (monaco) => {
        monaco.editor.defineTheme('codearena-dark', {
            base: 'vs-dark',
            inherit: true,
            rules: [],
            colors: {
                'editor.background': '#09090b', // Seamless background integration
                'editor.lineHighlightBackground': '#ffffff08',
                'editorLineNumber.foreground': '#4b5563',
                'editorCursor.foreground': '#2df07b', // Neon green cursor
                'editor.selectionBackground': '#2df07b30', // Neon green selection
                'editor.inactiveSelectionBackground': '#2df07b15',
                'scrollbarSlider.background': '#ffffff10',
                'scrollbarSlider.hoverBackground': '#ffffff20',
                'scrollbarSlider.activeBackground': '#2df07b50',
            }
        });
    };

    const handleEditorMount = (editor, monaco) => {
        editorRef.current = editor;
        monacoRef.current = monaco;

        // Restriction logic
        editor.onKeyDown((e) => {
            const model = editor.getModel();
            const fullText = model.getValue();
            
            const startIndex = fullText.indexOf("/* START_EDITABLE */");
            const endIndex = fullText.indexOf("/* END_EDITABLE */");
            
            if (startIndex !== -1 && endIndex !== -1) {
                const position = editor.getPosition();
                
                // Position of markers
                const startPos = model.getPositionAt(startIndex + "/* START_EDITABLE */".length);
                const endPos = model.getPositionAt(endIndex);
                
                // Allow navigation keys always
                const isNavKey = [
                    monaco.KeyCode.LeftArrow, monaco.KeyCode.RightArrow, 
                    monaco.KeyCode.UpArrow, monaco.KeyCode.DownArrow,
                    monaco.KeyCode.PageUp, monaco.KeyCode.PageDown,
                    monaco.KeyCode.Home, monaco.KeyCode.End
                ].includes(e.keyCode);

                if (isNavKey) return;

                // Check if cursor or selection is outside editable range
                const selection = editor.getSelection();
                
                const isOutside = (pos) => {
                    if (pos.lineNumber < startPos.lineNumber) return true;
                    if (pos.lineNumber === startPos.lineNumber && pos.column <= startPos.column) return true;
                    if (pos.lineNumber > endPos.lineNumber) return true;
                    if (pos.lineNumber === endPos.lineNumber && pos.column > endPos.column) return true;
                    return false;
                };

                if (isOutside(selection.getStartPosition()) || isOutside(selection.getEndPosition())) {
                    // Block edit keys
                    e.preventDefault();
                    e.stopPropagation();
                }
            }
        });

        // Prevention for backspace deleting markers if cursor is at the very start of editable section
        editor.onDidChangeModelContent((e) => {
            const model = editor.getModel();
            const fullText = model.getValue();
            if (!fullText.includes("/* START_EDITABLE */") || !fullText.includes("/* END_EDITABLE */")) {
                // If markers were deleted, try to restore or undo? 
                // For simplicity, we just won't let it happen via onKeyDown, 
                // but this is a secondary safeguard.
            }
        });
    };

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
            beforeMount={handleBeforeMount}
            onMount={handleEditorMount}
            theme="codearena-dark"
            options={{
                fontSize: 14,
                fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbersMinChars: 3,
                padding: { top: 16, bottom: 16 },
                formatOnPaste: true,
                smoothScrolling: true,
                cursorBlinking: "smooth",
                cursorSmoothCaretAnimation: "on"
            }}
        />
    );
};

export default LiveTestEditorComponent;