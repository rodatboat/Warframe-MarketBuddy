const electron = require('electron');
const { app, BrowserWindow, Menu, ipcMain, shell } = electron;
const url = require('url');
const path = require('path');
const fetchData = require('./fetchData')
require('v8-compile-cache');


process.env.NODE_ENV = 'production';

let mainWindow;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 450,
    height: 850,
    minWidth: 450,
    minHeight: 650,
    maxWidth: 450,
    maxHeight: 850,
    frame: false,
    icon: path.join(__dirname, '/img/mrktbuddy.ico'),
    webPreferences:{
      worldSafeExecuteJavaScript: true,
      nodeIntegration: true
    }
  });
  console.log(path.join(__dirname, "/img/", 'marketbuddy blue icon.png'));

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  mainWindow.on('closed', () => {
    app.quit();
  });

  mainWindow.webContents.on('did-finish-load', function() {
    mainWindow.show();
});

  //const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);

  mainWindow.setTitle("Warframe MarketBuddy");

  //mainWindow.setMenu(mainMenu);

  // Opens debugger on app.
  mainWindow.webContents.openDevTools();
  
  // Remove menu.
  mainWindow.setMenu(null);
};

app.on('ready', createWindow);

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

// Catch item:search
ipcMain.handle('item:search', (e, item) => {
  //const item = item.
  fetchData.fetchItem(item).then((res)=>{
    mainWindow.webContents.send('item:orders', res);
  })
  .catch(e=>{
    if(e.response.status == '404'){
      console.log(`Item ${item} not found...`);
    } else {
      console.log(`Error ${e.response.status} while making request...`);
    }
  })
  //mainWindow.webContents.send('item:add', item);
});

ipcMain.on('open:link', (e, link)=>{
  shell.openExternal(link);
});

ipcMain.on('app:terminate', (e)=>{
  app.quit();
});

ipcMain.on('app:minimize', (e)=>{
  mainWindow.minimize();
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