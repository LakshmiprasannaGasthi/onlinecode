// Updated App.js

import React, { useState, useEffect, useRef } from "react";
import { CssBaseline, ThemeProvider, createTheme, Button, Switch, AppBar, Toolbar, Typography } from "@mui/material";
import Confetti from "react-confetti";
import prettier from "prettier/standalone";
import babelParser from "prettier/parser-babel";

const App = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [code, setCode] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const iframeRef = useRef(null);

  const darkTheme = createTheme({
    palette: {
      mode: isDarkMode ? "dark" : "light",
    },
  });

  // Load code from localStorage on mount
  useEffect(() => {
    const savedCode = localStorage.getItem("savedCode");
    if (savedCode) {
      setCode(savedCode);
      sendCodeToEditor(savedCode);
    }
  }, []);

  // Save code to localStorage on change
  useEffect(() => {
    localStorage.setItem("savedCode", code);
  }, [code]);

  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleRunCode = () => {
    iframeRef.current.contentWindow.postMessage({ eventType: "triggerRun" }, "*");
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 5000);
  };

  const handleFormatCode = () => {
    const formattedCode = formatCode(code);
    setCode(formattedCode);
    sendCodeToEditor(formattedCode);
  };

  const formatCode = (code) => {
    try {
      return prettier.format(code, {
        parser: "babel",
        plugins: [babelParser],
      });
    } catch (err) {
      console.error("Error formatting code", err);
      return code;
    }
  };

  const sendCodeToEditor = (code) => {
    iframeRef.current.contentWindow.postMessage({
      eventType: "populateCode",
      language: "javascript",
      files: [
        {
          name: "main.js",
          content: code,
        },
      ],
    }, "*");
  };

  const handleCodeChange = (event) => {
    if (event.data && event.data.language && event.data.code) {
      setCode(event.data.code);
    }
  };

  useEffect(() => {
    window.addEventListener("message", handleCodeChange);
    return () => window.removeEventListener("message", handleCodeChange);
  }, []);

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" style={{ flexGrow: 1 }}>
            Code Editor
          </Typography>
          <Switch checked={isDarkMode} onChange={handleThemeToggle} />
        </Toolbar>
      </AppBar>

      <div style={{ padding: 16 }}>
        <div style={{ marginBottom: 16 }}>
          <Button variant="contained" color="primary" onClick={handleRunCode}>
            Run
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleFormatCode}
            style={{ marginLeft: 8 }}
          >
            Format Code
          </Button>
        </div>

        <iframe
          ref={iframeRef}
          id="oc-editor"
          frameBorder="0"
          height="450px"
          src={`https://onecompiler.com/embed/javascript?theme=${isDarkMode ? "dark" : "light"}&codeChangeEvent=true&listenToEvents=true`}
          width="100%"
        ></iframe>

        {showConfetti && <Confetti />}
      </div>
    </ThemeProvider>
  );
};

export default App;
