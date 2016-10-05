const electron = require('electron')
const path = require('path')
const {app, BrowserWindow, dialog, shell} = electron

let win = null

app.on('ready', () => {
  console.log('ready!')
  win = new BrowserWindow({
    height: 150,
    width: 530,
    frame: false,
    title: "Discord.FM Stream Widget",
    icon: "./resources/app/favicon.ico",
    minHeight: 150,
    minWidth: 530,
    resizable: false
  });
  win.loadURL(path.join('file://', __dirname, './start.html'))

  win.webContents.on('crashed', function () {
    const options = {
      type: 'info',
      title: 'Whoops!',
      message: 'Looks like the window crashed!',
      buttons: ['Reload', 'Close']
    }
    dialog.showMessageBox(options, function (index) {
      if(index === 0){win.reload()}else{win.close()}
    })
  })

  win.on('unresponsive', function () {
    const options = {
      type: 'info',
        title: 'Uh Oh!',
      message: "Looks like the window isn't paying attention to your actions!",
      buttons: ['Reload', 'Close', 'Wait For It...']
    }
    dialog.showMessageBox(options, function (index) {
      if(index === 0){win.reload()}else if(index === 1){win.close()}
    })
  })

  win.on('closed', function() {
   win = null;
  })
})
app.on('window-all-closed', () => {
  app.quit()
})

exports.closeWin = () => {
  win.close()
}

exports.minimizeWin = () => {
  win.minimize()
}

exports.openLink = (url) => {
  shell.openExternal(url)
}

exports.loadLib = (lib) => {
  win.loadURL(path.join('file://', __dirname, './index.html?lib='+lib))
}

exports.backToStart = () => {
  win.loadURL(path.join('file://', __dirname, './start.html'))
}

exports.win = () => {
  return win
}
