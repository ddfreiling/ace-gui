import { app, Menu, shell, BrowserWindow, dialog } from 'electron';
import {
  selectTab,
  runAce,
  openReport,
  closeReport
} from './../shared/actions/app';

export default class MenuBuilder {
  mainWindow: BrowserWindow;

  stateValues: {
    isReportOpen: false
  };

  constructor(mainWindow: BrowserWindow, store) {
    this.mainWindow = mainWindow;
    this.store = store;

    // listen for when a report is open
    this.store.subscribe(() => {
      let currVal = this.stateValues.isReportOpen;
      let newVal = this.store.getState().app.report != null;
      if (currVal != newVal) {
        this.stateValues.isReportOpen = newVal;
        refreshMenuItemsEnabled();
      }
    })
  }

  buildMenu() {
    if (
      process.env.NODE_ENV === 'development' ||
      process.env.DEBUG_PROD === 'true'
    ) {
      this.setupDevelopmentEnvironment();
    }

    const template = buildTemplate();
    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

    return menu;
  }

  setupDevelopmentEnvironment() {
    this.mainWindow.openDevTools();
    this.mainWindow.webContents.on('context-menu', (e, props) => {
      const { x, y } = props;

      Menu.buildFromTemplate([
        {
          label: 'Inspect element',
          click: () => {
            this.mainWindow.inspectElement(x, y);
          }
        }
      ]).popup(this.mainWindow);
    });
  }

  buildTemplate() {

    const defaultTemplate = {
      subMenuFile: {
        label: 'File',
        submenu: [
          {
            label: 'Check EPUB...',
            accelerator: 'CmdOrCtrl+O',
            click: () => process.platform == 'darwin' ?
              Helpers.showEpubFileOrFolderBrowseDialog(filepath => this.store.dispatch(runAce(filepath)))
              :
              Helpers.showEpubFileBrowseDialog(filepath => this.store.dispatch(runAce(filepath)))
          },
          {
            label: 'Open Report...',
            click: () => Helpers.showReportFileBrowseDialog(filepath => this.store.dispatch(openReport(filepath)))
          },
          {
            label: 'Close Report',
            accelerator: 'CmdOrCtrl+Shift+C',
            click: () => this.store.dispatch(closeReport())
          }
        ]
      },
      subMenuViewProd: {
        label: 'View',
        submenu: [
          {
            label: 'Toggle Full Screen',
            type: 'checkbox',
            accelerator: process.platform === 'darwin'
              ? 'Ctrl+Command+F'
              : 'F11',
            click: () => this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen())
          },
          {
            type: 'separator'
          },
          {
            label: 'Go to Summary',
            accelerator: 'CmdOrCtrl+Shift+S',
            click: () => this.store.dispatch(selectTab(0))
          },
          {
            label: 'Go to Violations',
            accelerator: 'CmdOrCtrl+Shift+V',
            click: () => this.store.dispatch(selectTab(1))
          },
          {
            label: 'Go to Metadata',
            accelerator: 'CmdOrCtrl+Shift+M',
            click: () => this.store.dispatch(selectTab(2))
          },
          {
            label: 'Go to Outlines',
            accelerator: 'CmdOrCtrl+Shift+O',
            click: () => this.store.dispatch(selectTab(3))
          },
          {
            label: 'Go to Images',
            accelerator: 'CmdOrCtrl+Shift+I',
            click: () => this.store.dispatch(selectTab(4))
          },
          {
            type: 'separator'
          },
          {
            label: process.platform == 'darwin' ? 'Show in Finder' : 'Show in Explorer',
            accelerator: 'CmdOrCtrl+Shift+F',
            click: () => shell.showItemInFolder(this.store.getState().app.reportFilepath)
          }
        ]
      },
      subMenuDev: {
        label: 'Dev',
        submenu: [
          {
            label: 'Reload',
            accelerator: 'Command+R',
            click: () => this.mainWindow.webContents.reload()
          },
          {
            label: 'Toggle Developer Tools',
            accelerator: 'Alt+Command+I',
            click: () => this.mainWindow.toggleDevTools()
          }
        ]
      },
      subMenuHelp: {
        label: 'Help',
        role: 'help',
        submenu: [
          {
            label: 'Knowledge Base',
            click: () => shell.openExternal('http://kb.daisy.org/publishing/')
          },
          {
            label: 'Learn more',
            click: () => shell.openExternal('http://daisy.github.io/ace')
          },
          {
            label: 'Report an Issue',
            click: () => shell.openExternal('http://github.com/DAISY/ace-gui/issues')
          },
          {
            label: 'Copy Message Output',
            click: () => {
              let messages = this.getState().app.messages;
              let msgstr = messages.join('\n');
              clipboard.writeText(msgstr);
            }
          }
        ]
      },
      subMenuAbout: {
        label: 'Ace',
        submenu: [
          {
            label: 'About Ace',
            click: () => dialog.showMessageBox({"message": "Ace Beta", "detail": "DAISY Consortium 2018"})
          },
          {
            type: 'separator'
          },
          {
            label: 'Services',
            role: 'services',
            submenu: []
          },
          {
            type: 'separator'
          },
          {
            label: 'Hide Ace',
            accelerator: 'Command+H',
            role: 'hide'
          },
          {
            label: 'Hide Others',
            accelerator: 'Command+Alt+H',
            role: 'hideothers'
          },
          {
            label: 'Show All',
            role: 'unhide'
          },
          {
            type: 'separator'
          },
          {
            role: 'quit'
          }
        ]
      },
      subMenuWindow: {
        label: 'Window',
        role: 'window',
        submenu: [
          {
            label: 'Minimize',
            role: 'minimize'
          },
          { type: 'separator' },
          {
            label: 'Bring All to Front',
            role: 'front'
          }
        ]
      }
    };


    // On Windows and Linux, open dialogs do not support selecting both files and
    // folders and files, so add an extra menu item so there is one for each type.
    if (process.platform === 'linux' || process.platform === 'win32') {
      // insert item into File submenu
      this.defaultTemplate.subMenuFile.submenu.unshift({
        label: 'Check EPUB Folder ... ',
        click: () => Helpers.showEpubFolderBrowseDialog(filepath => store.dispatch(runAce(filepath)))
      });

      // insert item into Help submenu
      this.defaultTemplate.subMenuHelp.submenu.push(
        {
          type: 'separator'
        },
        {
          label: 'About ' + appName,
          click: () => dialog.showMessageBox({"message": "Ace Beta", "detail": "DAISY Consortium 2018"})
        }
      );
    }
    // Add "File > Quit" menu item so Linux distros where the system tray icon is
    // missing will have a way to quit the app.
    if (process.platform === 'linux') {
      // File menu (Linux)
      this.defaultTemplate.subMenuFile.submenu.push({
        label: 'Quit',
        click: () => app.quit()
      });
    }

    let isDev = process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

    let menuTemplate = process.platform === 'darwin' ?
      [
        subMenuAbout,
        subMenuFile,
        subMenuView,
        subMenuWindow,
        subMenuHelp
      ]
      :
      [
        subMenuFile,
        subMenuView,
        subMenuHelp
      ];

    return isDev ? menuTemplate.concat(subMenuDev) : menuTemplate;
  }
}