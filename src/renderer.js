// src/renderer.js
const { ipcRenderer } = require('electron');
const path = require('path');

// Load Monaco Editor
require('monaco-editor/min/vs/loader.js');

self.module = undefined; // Hack to avoid Monaco error
globalThis.MonacoEnvironment = {
  getWorkerUrl: function (_moduleId, label) {
    if (label === 'json') {
      return './dist/json.worker.js';
    }
    if (label === 'css' || label === 'scss' || label === 'less') {
      return './dist/css.worker.js';
    }
    if (label === 'html' || label === 'handlebars' || label === 'razor') {
      return './dist/html.worker.js';
    }
    if (label === 'typescript' || label === 'javascript') {
      return './dist/ts.worker.js';
    }
    return './dist/editor.worker.js';
  },
};

// Load Monaco Editor after setting up MonacoEnvironment
require('monaco-editor');

let currentFilePath = null;
let editor;

document.addEventListener('DOMContentLoaded', () => {
  editor = monaco.editor.create(document.getElementById('editor'), {
    value: 'console.log("Hello, JavaScript!");',
    language: 'javascript',
    theme: 'vs-dark',
  });

  ipcRenderer.on('new-file', () => {
    currentFilePath = null;
    editor.setValue('');
  });

  ipcRenderer.on('open-file', (_event, { filePath, content }) => {
    currentFilePath = filePath;
    editor.setValue(content);
  });

  ipcRenderer.on('save-file', (_event, filePath) => {
    const content = editor.getValue();
    ipcRenderer.send('save-file', { filePath, content });
    currentFilePath = filePath;
  });
});
