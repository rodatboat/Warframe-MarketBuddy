const electron = require('electron');
const { app, BrowserWindow, Menu, ipcMain } = electron;
const url = require('url');
const path = require('path');
require('v8-compile-cache');


// if (require('electron-squirrel-startup')) {
//   app.quit();
// }

process.env.NODE_ENV = 'production';

let mainWindow;
let addWindow;

// Create window template.
const createWindow = () => {

  // Window settings.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences:{
      nodeIntegration: true
    }
  });

  // Load html into window.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));


  // Quit other windows when app closes.
  mainWindow.on('closed', () => {
    app.quit();
  });

  //Opens debugger on app.
  //mainWindow.webContents.openDevTools();

  // Building and setting the custom menu.
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);

  // Setting Title
  mainWindow.setTitle("Shopping List");
  
  // Sets menu for entire app.
  //Menu.setApplicationMenu(mainMenu);

  // Sets menu for window.
  mainWindow.setMenu(mainMenu);
};

// Start the application when ready.
app.on('ready', createWindow);

// Handle create add window.
const createAddWindow = () => {
  // Window settings.
  addWindow = new BrowserWindow({
    width: 300,
    height: 200,
    webPreferences:{
      nodeIntegration: true
    }
  });

  // Load html into window.
  addWindow.loadFile(path.join(__dirname, 'addWindow.html'));

  // Setting Title
  addWindow.setTitle("Add Shopping Item");

  // Remove menu.
  addWindow.setMenu(null);

  // Garbage collection
  // addWindow.on('close',()=>{
  //   addWindow = null;
  // });
};

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});


app.on('activate', () => {

  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Catch item:add
ipcMain.handle('item:add', (e, item) => {
  //console.log(e);
  //console.log(item);
  mainWindow.webContents.send('item:add', item);
  addWindow.close();
});

// Create menu template.
const mainMenuTemplate = [{
  label:'File',
  submenu:[{
    label:'Add Item',
    click(){
      createAddWindow();
    }
  },
  {
    label:'Clear Items',
    click(){
      mainWindow.webContents.send('item:clear');
    }
  },
  {
    label:'Quit',
    accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
    click(){
      app.quit();
    }
  }]
}];

if(process.platform == 'darwin'){
  mainMenuTemplate.unshift({});
}

if(process.env.NODE_ENV !== 'production'){
  mainMenuTemplate.push({
    label: 'Developer Tools',
    submenu: [
      {
        label: 'Toggle DevTools',
        click(item, focusedWindow){
          focusedWindow.toggleDevTools();
        }
      },
      {
        role: 'reload'
      }
    ]
  });
}