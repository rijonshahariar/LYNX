import React, { useRef, useState, useEffect } from 'react';
import ComplexityModal from './ComplexityModal';
import { analyzeCode } from '../services/codeAnalysis';

const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const Toolbar = ({ language, setLanguage, onRun, isRunning, isDark, setCode, code }) => {
  const fileInputRef = useRef(null);
  const [seconds, setSeconds] = useState(() => {
    const savedTime = localStorage.getItem('codeTimer');
    return savedTime ? parseInt(savedTime) : 0;
  });
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    localStorage.setItem('codeTimer', seconds.toString());
  }, [seconds]);

  useEffect(() => {
    let interval = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setSeconds(seconds => {
          const newSeconds = seconds + 1;
          return newSeconds;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Automatically detect language from file extension
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

      // Read file contents
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

  const toggleTimer = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  const resetTimer = () => {
    setSeconds(0);
    setIsTimerRunning(false);
    localStorage.setItem('codeTimer', '0');
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

  return (
    <>
      <div className={`border-b border-t p-3 flex items-center justify-between gap-3
        ${isDark ? ' border-gray-700' : ' border-gray-300'}`}
      >
        <div className="flex items-center gap-3">
          <div className={`font-mono text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {formatTime(seconds)}
          </div>
          <button
            onClick={toggleTimer}
            className={`p-2 rounded-md hover:bg-opacity-80
              ${isDark
                ? 'bg-gray-700 text-white hover:bg-gray-600'
                : 'bg-white text-gray-900 border border-gray-300 hover:bg-gray-50'}`}
            title={isTimerRunning ? 'Pause Timer' : 'Resume Timer'}
          >
            {isTimerRunning ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            )}
          </button>
          <button
            onClick={resetTimer}
            className={`p-2 rounded-md hover:bg-opacity-80
              ${isDark
                ? 'bg-gray-700 text-white hover:bg-gray-600'
                : 'bg-white text-gray-900 border border-gray-300 hover:bg-gray-50'}`}
            title="Reset Timer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".py,.js,.cpp,.c,.h,.java"
            className="hidden"
          />
          
          <button
            onClick={handleChooseFile}
            className={`px-4 py-2 rounded-md text-base font-medium
              ${isDark
                ? 'bg-gray-700 text-white hover:bg-gray-600'
                : 'bg-white text-gray-900 border border-gray-300 hover:bg-gray-50'}`}
          >
            Choose File
          </button>

          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className={`px-4 py-2 rounded-md text-base font-medium
              ${isDark 
                ? 'bg-gray-700 text-white' 
                : 'bg-white text-gray-900 border border-gray-300'}`}
          >
            <option value="python">Python</option>
            <option value="javascript">JavaScript</option>
            <option value="cpp">C++</option>
            <option value="java">Java</option>
          </select>

          <button
            onClick={handleAnalyzeCode}
            className={`px-4 py-2 rounded-md text-base font-medium
              ${isDark
                ? 'bg-purple-600 text-white hover:bg-purple-700'
                : 'bg-purple-500 text-white hover:bg-purple-600'}`}
          >
            Analyze
          </button>

          <button
            onClick={onRun}
            disabled={isRunning}
            className={`px-6 py-2 rounded-md text-base font-medium text-white min-w-[100px]
              ${isRunning
                ? 'bg-green-700 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700'}`}
          >
            {isRunning ? 'Running...' : 'Run'}
          </button>
        </div>
      </div>

      <ComplexityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        analysis={analysis}
        isDark={isDark}
      />
    </>
  );
};

export default Toolbar; 