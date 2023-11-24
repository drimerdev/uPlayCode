const { app, BrowserWindow, dialog, Menu, ipcMain, shell } = require('electron');
const fs = require('fs');

let mainWindow;
let aboutWindow;

function createWindow() {
  // Create the main browser window
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  });

  // Load your HTML file or URL into the main window
  mainWindow.loadFile('index.html');

  // Event triggered when the main window is closed
  mainWindow.on('closed', function () {
    mainWindow = null;
  });

  const menuTemplate = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Create File',
          click: createFile
        },
        {
          label: 'Open File',
          click: openFile
        },
        {
          label: 'Save',
          click: saveFile
        },
        {
          label: 'Exit',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectall' }
      ]
    },
    {
      label: 'Run',
      submenu: [
        {
          label: 'Run Command',
          click: runCommand
        }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About',
          click: showAboutWindow
        }
      ]
    }
    // Add other menu items or submenus as needed
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
}

function createFile() {
  // Show a dialog to get the file name and location
  dialog.showSaveDialog(mainWindow, {
    title: 'Create File',
    defaultPath: app.getPath('documents'),
    filters: [
      { name: 'Text Files', extensions: ['txt', 'js', 'ts', 'html', 'css', 'json'] },
      // Add more file types as needed
    ]
  }).then(result => {
    // result.filePath will contain the path to the selected file
    if (!result.canceled && result.filePath) {
      // Create the file
      fs.writeFileSync(result.filePath, '', 'utf-8');
      // Send the file path to the renderer process
      mainWindow.webContents.send('file-created', { path: result.filePath });
    }
  }).catch(err => {
    console.error(err);
  });
}

function openFile() {
  // Show a dialog to get the file path to open
  dialog.showOpenDialog(mainWindow, {
    title: 'Open File',
    filters: [
      { name: 'Text Files', extensions: ['txt', 'js', 'ts', 'html', 'css', 'json'] },
      // Add more file types as needed
    ],
    properties: ['openFile']
  }).then(result => {
    // result.filePaths will contain the paths to the selected file(s)
    if (!result.canceled && result.filePaths.length > 0) {
      // Read the content of the file
      const content = fs.readFileSync(result.filePaths[0], 'utf-8');
      // Send the content and file path to the renderer process
      mainWindow.webContents.send('file-opened', { path: result.filePaths[0], content });
    }
  }).catch(err => {
    console.error(err);
  });
}

function saveFile() {
  // Send a message to the renderer process to request the current file content and path
  mainWindow.webContents.send('request-save');
}

function runCommand() {
  // You can replace this command with the actual command you want to run
  // In this example, it opens the system default web browser
  shell.openExternal('https://www.example.com');
}

function showAboutWindow() {
  // Create the about window without a menu bar
  aboutWindow = new BrowserWindow({
    width: 400,
    height: 300,
    title: 'About My App',
    webPreferences: {
      nodeIntegration: true
    },
    parent: mainWindow, // To make the about window modal to the main window
    modal: true,
    show: false,
    autoHideMenuBar: true, // Hide the menu bar
    maximizable: false,
    minimizable: false,
  });

  // Load the about window content
  aboutWindow.loadFile('about.html');

  // Event triggered when the about window is closed
  aboutWindow.on('closed', function () {
    aboutWindow = null;
  });

  // Show the about window when it's ready
  aboutWindow.once('ready-to-show', () => {
    aboutWindow.show();
  });
}

// Event triggered when Electron has finished initializing
app.whenReady().then(createWindow);

// Event triggered when all windows are closed
app.on('window-all-closed', function () {
  // On macOS, close the app only if there are no windows open
  if (process.platform !== 'darwin') app.quit();
});

// Event triggered when the app is activated (e.g., clicked on the dock on macOS)
app.on('activate', function () {
  // Create a new window if none are open when the app is activated
  if (mainWindow === null) createWindow();
});

// Listen for save event from renderer process
ipcMain.on('save-file', (event, { path, content }) => {
  // Save the file content
  fs.writeFileSync(path, content, 'utf-8');
});
