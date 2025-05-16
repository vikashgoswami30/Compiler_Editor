import React, { useState, useEffect } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";
import { cpp } from "@codemirror/lang-cpp";
import { oneDark } from "@codemirror/theme-one-dark";
import axios from "axios";

const languageOptions = {
  python: { id: 71, extension: python() },
  c: { id: 50, extension: cpp() },
  cpp: { id: 54, extension: cpp() },
};

const codeNeedsInput = (code, language) => {
  if (!code) return false;
  const lowerCode = code.toLowerCase();
  if (language === "python") {
    return lowerCode.includes("input(");
  } else if (language === "c") {
    return lowerCode.includes("scanf(");
  } else if (language === "cpp") {
    return lowerCode.includes("cin >>");
  }
  return false;
};

const Editor = () => {
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState(`print("Hello World")`);
  const [input, setInput] = useState("");
  const [inputs, setInputs] = useState([""]);
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [showInput, setShowInput] = useState(false);

  useEffect(() => {
    if (language === "python") {
      setCode(`print("Hello World")`);
    } else if (language === "c") {
      setCode(`#include <stdio.h>
int main() {
  printf("Hello World\\n");
  return 0;
}`);
    } else if (language === "cpp") {
      setCode(`#include <iostream>
using namespace std;
int main() {
  cout << "Hello World" << endl;
  return 0;
}`);
    }
    setInput("");
    setOutput("");
    setShowInput(false);
  }, [language]);

  useEffect(() => {
    setShowInput(codeNeedsInput(code, language));
  }, [code, language]);

  const runCode = async () => {
    setIsRunning(true);
    setOutput("Running...");
    try {
      const response = await axios.post(
        "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true",
        {
          source_code: code,
          language_id: languageOptions[language].id,
          stdin: showInput ? inputs.join("\n") : "",
        },
        {
          headers: {
            "X-RapidAPI-Key":
              "c737144cf6msh4b814a58c4f70c4p13c461jsn8eefa46c05bb",
            "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
            "Content-Type": "application/json",
          },
        }
      );

      const result = response.data;
      setOutput(
        result.stdout ||
          result.stderr ||
          result.compile_output ||
          result.message ||
          "No output"
      );
    } catch (err) {
      setOutput("Error running code.");
      console.error(err);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: 1000,
        margin: "2rem auto",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        boxShadow: "0 4px 12px rgb(0 0 0 / 0.1)",
        borderRadius: 12,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: "#282c34",
          color: "white",
          padding: "1rem 2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontWeight: "bold",
          fontSize: 22,
          letterSpacing: 1.2,
        }}
      >
        Mini Code Editor - LeetCode Style
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          disabled={isRunning}
          style={{
            fontSize: 16,
            borderRadius: 6,
            padding: "6px 12px",
            border: "1px solid #555",
            backgroundColor: "#282c34",
            color: "white",
            cursor: isRunning ? "not-allowed" : "pointer",
            appearance: "none",
            MozAppearance: "none",
            WebkitAppearance: "none",
          }}
        >
          <option value="python">Python</option>
          <option value="c">C</option>
          <option value="cpp">C++</option>
        </select>
      </div>

      {/* Main content flex container */}
      <div
        style={{
          display: "flex",
          height: "calc(100vh - 150px)",
          backgroundColor: "#1e1e1e",
        }}
      >
        {/* Code Editor */}
        <div style={{ flex: 2, borderRight: "1px solid #333" }}>
          <CodeMirror
            value={code}
            height="100%"
            extensions={[languageOptions[language].extension]}
            theme={oneDark}
            onChange={(value) => setCode(value)}
            editable={!isRunning}
            style={{ fontSize: 16 }}
          />
        </div>

        {/* Right panel for input/output */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            padding: 16,
            backgroundColor: "#282c34",
            color: "white",
          }}
        >
          {/* Input box: show only if needed */}
          {showInput && (
            <>
              <label
                htmlFor="inputArea"
                style={{ marginBottom: 8, fontWeight: "600", fontSize: 16 }}
              >
                Custom Input (stdin)
              </label>
              {showInput && (
                <>
                  <label style={{ marginBottom: 8 }}>
                    Custom Inputs (stdin)
                  </label>
                  {inputs.map((val, index) => (
                    <input
                      key={index}
                      type="text"
                      value={val}
                      onChange={(e) => {
                        const newInputs = [...inputs];
                        newInputs[index] = e.target.value;
                        setInputs(newInputs);
                      }}
                      placeholder={`Input ${index + 1}`}
                      style={{
                        marginBottom: 8,
                        width: "100%",
                        padding: 8,
                        borderRadius: 6,
                        fontFamily: "monospace",
                        backgroundColor: "black",
                        color: "white",
                      }}
                    />
                  ))}
                  <button
                    onClick={() => setInputs([...inputs, ""])}
                    style={{
                      backgroundColor: "#2196F3",
                      color: "white",
                      padding: "6px 12px",
                      borderRadius: 6,
                      border: "none",
                      marginBottom: 16,
                      cursor: "pointer",
                    }}
                  >
                    Add Input Field
                  </button>
                </>
              )}
            </>
          )}

          {/* Run button */}
          <button
            onClick={runCode}
            disabled={isRunning}
            style={{
              padding: "12px 0",
              borderRadius: 10,
              fontWeight: "bold",
              fontSize: 18,
              backgroundColor: isRunning ? "#555" : "#4caf50",
              border: "none",
              color: "white",
              cursor: isRunning ? "not-allowed" : "pointer",
              marginBottom: 16,
              transition: "background-color 0.3s ease",
            }}
          >
            {isRunning ? "Running..." : "Run ▶"}
          </button>

          {/* Output console */}
          <div
            style={{
              flex: 1,
              backgroundColor: "#000000cc",
              borderRadius: 10,
              padding: 16,
              fontFamily: "'Segoe UI Mono', monospace",
              fontSize: 14,
              overflowY: "auto",
              whiteSpace: "pre-wrap",
              color: output.toLowerCase().includes("error")
                ? "#ff6b6b"
                : "#00ff00",
              boxShadow: "0 0 8px #00ff0040",
              userSelect: "text",
            }}
          >
            {output || "Output will appear here..."}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Editor;
