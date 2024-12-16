import React, { useState, useRef, useEffect } from 'react';
import CodeEditor from './CodeEditor';
import InputOutput from './InputOutput';
import Toolbar from './Toolbar';
import Nav from './Nav';
import { makeSubmission } from '../services/judge0';
import { analyzeCode } from '../services/codeAnalysis';
import ComplexityModal from './ComplexityModal';
import Resizer from './Resizer';
import { boilerplateCode } from '../utils/boilerplateCode';
import { fetchLanguages } from '../services/languages';

const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const Footer = ({ isDark }) => (
  <footer className={`py-2 mt-4 text-center text-sm ${isDark ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-600'} border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
    <p>
      Developed by{' '}
      <a 
        href="https://github.com/rijonshahariar" 
        target="_blank" 
        rel="noopener noreferrer"
        className={`font-medium hover:underline ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'}`}
      >
        Shahariar Rijon
      </a>
    </p>
  </footer>
);

const IDE = () => {
  const fileInputRef = useRef(null);
  
  // Helper functions first
  const getFileExtension = (languageId) => {
    switch (languageId) {
      case '54': return 'cpp';
      case '92': return 'py';
      case '93': return 'js';
      case '91': return 'java';
      default: return 'py';
    }
  };

  const getLanguageName = (id) => {
    switch (id) {
      case '54': return 'cpp';
      case '92': return 'python';
      case '93': return 'javascript';
      case '91': return 'java';
      default: return 'python';
    }
  };

  // Initialize language state first
  const [language, setLanguage] = useState(() => {
    const savedLanguage = localStorage.getItem('selectedLanguage');
    return savedLanguage || '92'; // default to Python
  });

  // Initialize fileName state
  const [fileName, setFileName] = useState(() => {
    const savedFileName = localStorage.getItem('fileName');
    const savedLanguage = localStorage.getItem('selectedLanguage') || '92';
    const extension = getFileExtension(savedLanguage);
    return savedFileName || `main.${extension}`;
  });

  // Initialize other states
  const [code, setCode] = useState(() => {
    const savedCode = localStorage.getItem('savedCode');
    const savedLanguage = localStorage.getItem('selectedLanguage') || '92';
    return savedCode || boilerplateCode[getLanguageName(savedLanguage)];
  });

  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState(null);
  const [isDark, setIsDark] = useState(true);
  const [availableLanguages, setAvailableLanguages] = useState([]);
  
  // Timer states
  const [seconds, setSeconds] = useState(() => {
    const saved = localStorage.getItem('codeTimer');
    return saved ? parseInt(saved) : 0;
  });
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const intervalRef = useRef(null);

  // Effects
  useEffect(() => {
    localStorage.setItem('fileName', fileName);
  }, [fileName]);

  // Fetch languages on component mount
  useEffect(() => {
    const getLanguages = async () => {
      const languages = await fetchLanguages();
      setAvailableLanguages(languages);
      
      // If no language is selected, set default to Python (92)
      if (!language) {
        setLanguage('92');
        setCode(boilerplateCode['92']);
      }
    };
    getLanguages();
  }, []);

  // Timer effect
  useEffect(() => {
    if (isTimerRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => {
          const newValue = s + 1;
          localStorage.setItem('codeTimer', newValue.toString());
          return newValue;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isTimerRunning]);

  // Save language to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('selectedLanguage', language);
  }, [language]);

  // Save code and language to localStorage
  useEffect(() => {
    localStorage.setItem('selectedLanguage', language);
    localStorage.setItem('savedCode', code);
  }, [language, code]);

  // Update code when language changes
  useEffect(() => {
    // Only update code if it's empty or matches another language's boilerplate
    const isBoilerplate = Object.values(boilerplateCode).some(template => 
      code === template || code === ''
    );
    
    if (isBoilerplate) {
      setCode(boilerplateCode[language]);
    }
  }, [language]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const toggleTimer = () => {
    setIsTimerRunning(prev => !prev);
  };

  const resetTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setSeconds(0);
    setIsTimerRunning(false);
    localStorage.setItem('codeTimer', '0');
  };

  // Handle file upload
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const newFileName = file.name;
      setFileName(newFileName);
      localStorage.setItem('fileName', newFileName);
      
      const extension = file.name.split('.').pop().toLowerCase();
      switch (extension) {
        case 'py':
          setLanguage('92');  // Python
          break;
        case 'js':
          setLanguage('93');  // JavaScript
          break;
        case 'cpp':
        case 'c':
        case 'h':
          setLanguage('54');  // C++
          break;
        case 'java':
          setLanguage('91');  // Java
          break;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setCode(e.target.result);
      };
      reader.readAsText(file);
    }
  };

  const handleChooseFile = () => {
    fileInputRef.current.click();
  };

  const handleAnalyzeCode = async () => {
    if (!code.trim()) {
      alert('Please enter some code to analyze');
      return;
    }
    
    setIsModalOpen(true);
    setAnalysis(null);
    
    try {
      const result = await analyzeCode(code, language);
      setAnalysis(result);
    } catch (error) {
      setAnalysis({
        timeComplexity: 'Error analyzing code',
        spaceComplexity: 'Error analyzing code',
        explanation: error.message
      });
    }
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setError(null);
    setOutput('Running...');

    const handleCallback = (result) => {
      if (result.apiStatus === 'loading') {
        setOutput('Running...');
      } else if (result.apiStatus === 'error') {
        setError(result.message);
        setIsRunning(false);
      } else if (result.apiStatus === 'success') {
        const { data } = result;
        
        // Handle different status cases
        switch (data.status?.id) {
          case 3: // Accepted
            setOutput(atob(data.stdout) || 'No output');
            break;
          case 4: // Wrong Answer
            setOutput(atob(data.stdout) || 'No output');
            break;
          case 5: // Time Limit Exceeded
            setError('Time Limit Exceeded');
            break;
          case 6: // Compilation Error
            setError(`Compilation Error:\n${atob(data.compile_output)}`);
            break;
          case 7: // Runtime Error (SIGSEGV)
            setError(`Runtime Error:\n${atob(data.stderr)}`);
            break;
          case 8: // Runtime Error (SIGXFSZ)
            setError('Output Limit Exceeded');
            break;
          case 9: // Runtime Error (SIGFPE)
            setError('Runtime Error (Division by zero)');
            break;
          case 10: // Runtime Error (SIGABRT)
            setError('Runtime Error (Aborted)');
            break;
          case 11: // Runtime Error (NZEC)
            setError('Runtime Error (Non-zero exit code)');
            break;
          case 12: // Runtime Error (Other)
            setError(`Runtime Error:\n${atob(data.stderr)}`);
            break;
          default:
            setError('Unknown Error');
        }
        setIsRunning(false);
      }
    };

    try {
      await makeSubmission({
        code,
        language,
        stdin: input,
        callback: handleCallback
      });
    } catch (err) {
      setError('Failed to execute code. Please try again.');
      console.error('Error executing code:', err);
      setIsRunning(false);
    }
  };

  // Handle language change
  const handleLanguageChange = (newLanguage) => {
    if (code && code !== boilerplateCode[newLanguage]) {
      const confirmChange = window.confirm(
        'Changing language will reset your code. Continue?'
      );
      if (!confirmChange) return;
    }

    // Get current and new file extensions
    const currentExtension = fileName.split('.').pop().toLowerCase();
    const newExtension = getFileExtension(newLanguage);

    // If extensions don't match, reset to default filename
    if (currentExtension !== newExtension) {
      const newFileName = `main.${newExtension}`;
      setFileName(newFileName);
      localStorage.setItem('fileName', newFileName);
    }

    setLanguage(newLanguage);
    setCode(boilerplateCode[newLanguage]);
    localStorage.setItem('selectedLanguage', newLanguage);
  };

  const timerProps = {
    seconds: formatTime(seconds),
    isTimerRunning,
    toggleTimer,
    resetTimer,
    handleAnalyzeCode,
    fileInputRef,
    handleFileChange,
    handleChooseFile
  };

  return (
    <div className={`flex flex-col h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} ${isDark ? 'text-white' : 'text-gray-900'}`}>
      <Nav 
        isDark={isDark} 
        toggleTheme={toggleTheme}
        language={language}
        setLanguage={handleLanguageChange}
        onRun={handleRunCode}
        isRunning={isRunning}
        setCode={setCode}
        code={code}
        timer={timerProps}
        availableLanguages={availableLanguages}
      />
      
      {/* Main Container */}
      <div id="ide-container" className="flex-1 flex flex-col lg:flex-row overflow-hidden mt-2 lg:mt-4">
        {/* Code Editor Panel */}
        <div 
          id="left-panel" 
          className="w-full lg:w-1/2 flex flex-col h-[calc(100vh-12rem)] lg:h-auto snap-start"
        >
          {/* Editor Header with Upload Button */}
          <div className={`flex items-center justify-between p-2 ${isDark ? 'bg-gray-800' : 'bg-white'} border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {fileName}
            </div>
            <div className="flex items-center">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".py,.js,.cpp,.java"
              />
              <button
                onClick={handleChooseFile}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  isDark 
                    ? 'bg-gray-700 text-white hover:bg-gray-600' 
                    : 'bg-white text-gray-900 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                <svg 
                  className="w-4 h-4" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" 
                  />
                </svg>
                Upload File
              </button>
            </div>
          </div>

          <CodeEditor 
            code={code} 
            setCode={setCode} 
            language={language}
            isDark={isDark}
          />
        </div>

        <Resizer isDark={isDark} />

        {/* Input/Output Panel */}
        <div 
          id="right-panel" 
          className="w-full lg:w-1/2 flex flex-col h-[calc(100vh-12rem)] lg:h-auto snap-start"
        >
          <InputOutput 
            input={input}
            setInput={setInput}
            output={error || output}
            isError={!!error}
            isDark={isDark}
          />
        </div>
      </div>

      <ComplexityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        analysis={analysis}
        isDark={isDark}
      />

      {/* Add Footer */}
      {/* <Footer isDark={isDark} /> */}
    </div>
  );
};

export default IDE;