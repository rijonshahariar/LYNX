import React from 'react';
import AceEditor from 'react-ace';
import '../styles/scrollbar.css';

// Import themes
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/theme-github_dark';
import 'ace-builds/src-noconflict/theme-github';
import 'ace-builds/src-noconflict/theme-dracula';

// Import extensions
import 'ace-builds/src-noconflict/ext-language_tools';
import 'ace-builds/src-noconflict/ext-searchbox';

const InputOutput = ({ input, setInput, output, isError, isDark }) => {
  return (
    <div className="flex-1 flex flex-col gap-2 md:gap-4 overflow-hidden pr-4 pb-4">
      {/* Input Section */}
      <div className="flex-1 min-h-[30%] max-h-[40%]">
        <h2 className="text-lg font-semibold mb-2">Input</h2>
        <div className={`h-[calc(100%-2rem)] rounded-md overflow-hidden border ${
          isDark ? 'border-gray-700/50' : 'border-gray-200'
        } shadow-sm`}>
          <AceEditor
            mode="text"
            theme={isDark ? 'dracula' : 'github'}
            value={input}
            onChange={setInput}
            name="input-editor"
            width="100%"
            height="100%"
            fontSize={16}
            showPrintMargin={false}
            showGutter={true}
            highlightActiveLine={true}
            setOptions={{
              enableBasicAutocompletion: false,
              enableLiveAutocompletion: false,
              enableSnippets: false,
              showLineNumbers: true,
              tabSize: 2,
              useWorker: false,
            }}
            editorProps={{ $blockScrolling: true }}
            style={{
              fontFamily: 'Source Code Pro, monospace',
            }}
          />
        </div>
      </div>

      {/* Output Section */}
      <div className="flex-1 min-h-[60%]">
        <h2 className="text-lg font-semibold mb-2">Output</h2>
        <div className={`h-[calc(100%-2rem)] rounded-md overflow-hidden border ${
          isDark 
            ? `border-${isError ? 'red-500/50' : 'gray-700/50'}` 
            : `border-${isError ? 'red-500' : 'gray-200'}`
        } shadow-sm`}>
          <AceEditor
            mode="text"
            theme={isDark ? 'dracula' : 'github'}
            value={output}
            readOnly={true}
            name="output-editor"
            width="100%"
            height="100%"
            fontSize={16}
            showPrintMargin={false}
            showGutter={true}
            highlightActiveLine={false}
            setOptions={{
              enableBasicAutocompletion: false,
              enableLiveAutocompletion: false,
              enableSnippets: false,
              showLineNumbers: true,
              tabSize: 2,
              useWorker: false,
            }}
            editorProps={{ $blockScrolling: true }}
            style={{
              fontFamily: 'Source Code Pro, monospace',
            }}
            className={isError ? 'text-red-400' : ''}
          />
        </div>
      </div>
    </div>
  );
};

export default InputOutput; 