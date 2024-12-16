import React from 'react';
import AceEditor from 'react-ace';
import '../styles/scrollbar.css';

// Import themes
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/theme-github_dark';
import 'ace-builds/src-noconflict/theme-github';
import 'ace-builds/src-noconflict/theme-dracula';
import 'ace-builds/src-noconflict/theme-solarized_dark';
import 'ace-builds/src-noconflict/theme-solarized_light';

// Import languages
import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/mode-java';
import 'ace-builds/src-noconflict/mode-c_cpp';

// Import snippets
import 'ace-builds/src-noconflict/snippets/python';
import 'ace-builds/src-noconflict/snippets/javascript';
import 'ace-builds/src-noconflict/snippets/java';
import 'ace-builds/src-noconflict/snippets/c_cpp';

// Import extensions
import 'ace-builds/src-noconflict/ext-language_tools';
import 'ace-builds/src-noconflict/ext-searchbox';

const CodeEditor = ({ code, setCode, language, isDark }) => {
  const getEditorMode = () => {
    switch (language) {
      case 'javascript':
        return 'javascript';
      case 'python':
        return 'python';
      case 'cpp':
        return 'c_cpp';
      case 'java':
        return 'java';
      default:
        return 'python';
    }
  };

  return (
    <div className={`h-full pl-4 rounded-md overflow-hidden border ${
      isDark 
        ? 'border-gray-700/50' 
        : 'border-gray-200 light-scrollbar'
    } shadow-sm`}>
      <AceEditor
        mode={getEditorMode()}
        theme={isDark ? 'dracula' : 'github'}
        value={code}
        onChange={setCode}
        name="code-editor"
        width="100%"
        height="100%"
        fontSize={16}
        showPrintMargin={false}
        showGutter={true}
        highlightActiveLine={true}
        setOptions={{
          enableBasicAutocompletion: true,
          enableLiveAutocompletion: true,
          enableSnippets: true,
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
  );
};

export default CodeEditor; 