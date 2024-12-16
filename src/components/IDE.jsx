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

const IDE = () => {
  const fileInputRef = useRef(null);
  
  // Helper function for language name
  const getLanguageName = (id) => {
    switch (id) {
      case '54': return 'cpp';
      case '92': return 'python';
      case '93': return 'javascript';
      case '91': return 'java';
      default: return 'python';
    }
  };

  const [code, setCode] = useState(() => {
    const savedCode = localStorage.getItem('savedCode');
    const savedLanguage = localStorage.getItem('selectedLanguage') || '92'; // default to Python
    return savedCode || boilerplateCode[getLanguageName(savedLanguage)];
  });

  const [language, setLanguage] = useState(() => {
    const savedLanguage = localStorage.getItem('selectedLanguage');
    return savedLanguage || '92'; // default to Python
  });

  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState(null);
  const [isDark, setIsDark] = useState(true);
  
  // Timer states
  const [seconds, setSeconds] = useState(() => {
    const saved = localStorage.getItem('codeTimer');
    return saved ? parseInt(saved) : 0;
  });
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const intervalRef = useRef(null);

  const [availableLanguages, setAvailableLanguages] = useState([]);

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

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const extension = file.name.split('.').pop().toLowerCase();
      switch (extension) {
        case 'py':
          setLanguage('python');
          break;
        case 'js':
          setLanguage('javascript');
          break;
        case 'cpp':
        case 'c':
        case 'h':
          setLanguage('cpp');
          break;
        case 'java':
          setLanguage('java');
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

  const handleLanguageChange = (newLanguage) => {
    if (code && code !== boilerplateCode[newLanguage]) {
      const confirmChange = window.confirm(
        'Changing language will reset your code. Continue?'
      );
      if (!confirmChange) return;
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
      
      {/* Mobile View Controls */}
      <div className="lg:hidden flex justify-end px-4 py-2 gap-2">
        <button
          onClick={() => document.getElementById('left-panel').scrollIntoView({ behavior: 'smooth' })}
          className={`px-3 py-1 rounded-md text-sm font-medium ${
            isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-900 border border-gray-300'
          }`}
        >
          Editor
        </button>
        <button
          onClick={() => document.getElementById('right-panel').scrollIntoView({ behavior: 'smooth' })}
          className={`px-3 py-1 rounded-md text-sm font-medium ${
            isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-900 border border-gray-300'
          }`}
        >
          Input/Output
        </button>
      </div>

      {/* Main Container */}
      <div id="ide-container" className="flex-1 flex flex-col lg:flex-row overflow-hidden mt-2 lg:mt-4">
        {/* Code Editor Panel */}
        <div 
          id="left-panel" 
          className="w-full lg:w-1/2 h-[calc(100vh-12rem)] lg:h-auto snap-start"
        >
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
    </div>
  );
};

export default IDE;