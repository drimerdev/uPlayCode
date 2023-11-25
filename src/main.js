const { app, BrowserWindow, Menu, dialog, ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');
const url = require('url');

let mainWindow;
let aboutWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      devTools: true,
      nodeIntegration: false, // Disable node integration
      contextIsolation: true, // Enable context isolation
      preload: path.join(__dirname, 'preload.js'), // Use the preload script
    },
  });

  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, './index.html'),
      protocol: 'file:',
      slashes: true,
    })
  );


  mainWindow.on('closed', function () {
    mainWindow = null;
  });

  createMenu();
}

function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New File',
          click: createNewFile,
        },
        {
          label: 'Open File',
          click: openFile,
        },
        {
          label: 'Save',
          click: saveFile,
        },
        { type: 'separator' },
        {
          label: 'About',
          click: showAboutWindow,
        },
        { role: 'quit' },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        {
          label: 'Select All',
          click: '',
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function createNewFile() {
  mainWindow.webContents.send('new-file');
}

function openFile() {
  const files = dialog.showOpenDialogSync({
    properties: ['openFile'],
    filters: [{ name: 'Text Files', extensions: ['txt', 'js', 'html', 'css', 'ts', 'json','php','htm', 'sass','md'] }],
  });

  if (files && files.length > 0) {
    const filePath = files[0];
    const content = fs.readFileSync(filePath, 'utf-8');
    mainWindow.webContents.send('open-file', { filePath, content });
  }
}

function saveFile() {
  const filePath = dialog.showSaveDialogSync({
    title: 'Save File',
    filters: [{ name: 'Text Files', extensions: ['txt', 'js', 'html', 'css', 'ts', 'json','php','htm', 'sass'] }],
  });

  if (filePath) {
    mainWindow.webContents.send('save-file', filePath);
  }
}

function showAboutWindow() {
  aboutWindow = new BrowserWindow({
    width: 300,
    height: 200,
    title: 'About',
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  aboutWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, './src/about.html'),
      protocol: 'file:',
      slashes: true,
    })
  );

  aboutWindow.on('closed', function () {
    aboutWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
  if (mainWindow === null) createWindow();
});

ipcMain.on('save-file', (event, { filePath, content }) => {
  fs.writeFileSync(filePath, content, 'utf-8');
});
