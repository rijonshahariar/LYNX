import React from 'react';

const Nav = ({ isDark, toggleTheme, language, setLanguage, onRun, isRunning, setCode, code, timer, availableLanguages }) => {
  const { seconds, isTimerRunning, toggleTimer, resetTimer, handleAnalyzeCode, fileInputRef, handleFileChange, handleChooseFile } = timer;

  return (
    <nav className={`${isDark ? 'bg-gray-800' : 'bg-white'} border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} px-4 py-3`}>
      <div className="container mx-auto">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          {/* Logo Section */}
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold whitespace-nowrap">
              <span className={isDark ? 'text-white' : 'text-gray-900'}>LY</span>
              <span className="text-green-500">NX</span>
            </span>
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              AI Enhanced Code Editor
            </span>
          </div>

          {/* Timer Section */}
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-2">
              <div className={`font-mono text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'} whitespace-nowrap`}>
                {seconds}
              </div>
              <button
                onClick={toggleTimer}
                className={`p-2 rounded-md hover:bg-opacity-80 ${isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-white text-gray-900 border border-gray-300 hover:bg-gray-50'}`}
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
                className={`p-2 rounded-md hover:bg-opacity-80 ${isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-white text-gray-900 border border-gray-300 hover:bg-gray-50'}`}
                title="Reset Timer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>

          {/* Controls Section */}
          <div className="flex items-center space-x-2 overflow-x-auto whitespace-nowrap pb-2 lg:pb-0">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".py,.js,.cpp,.c,.h,.java"
              className="hidden"
            />
            
            <button
              onClick={handleChooseFile}
              className={`px-3 py-1.5 rounded-md text-sm font-medium ${isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-white text-gray-900 border border-gray-300 hover:bg-gray-50'}`}
            >
              Choose File
            </button>

            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-900 border border-gray-300'
              }`}
            >
              {availableLanguages.map(lang => (
                <option key={lang.id} value={lang.id}>
                  {lang.name}
                </option>
              ))}
            </select>

            <button
              onClick={handleAnalyzeCode}
              className={`px-3 py-1.5 rounded-md text-sm font-medium ${isDark ? 'bg-purple-600 text-white hover:bg-purple-700' : 'bg-purple-500 text-white hover:bg-purple-600'}`}
            >
              Analyze
            </button>

            <button
              onClick={onRun}
              disabled={isRunning}
              className={`px-4 py-1.5 rounded-md text-sm font-medium text-white min-w-[80px] ${isRunning ? 'bg-green-700 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
            >
              {isRunning ? 'Running...' : 'Run'}
            </button>

            <button
              onClick={toggleTheme}
              className={`p-1.5 rounded-md hover:bg-opacity-80 ${isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-white text-gray-900 border border-gray-300 hover:bg-gray-50'}`}
            >
              {isDark ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Nav; 