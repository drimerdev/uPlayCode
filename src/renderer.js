const monaco = require('monaco-editor');
const { ipcRenderer } = require('electron');

let currentFilePath = null;

document.addEventListener('DOMContentLoaded', () => {
  const editor = monaco.editor.create(document.getElementById('editor'), {
    value: 'console.log("Hello, Electron!");',
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
