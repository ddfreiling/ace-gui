# Ace-GUI

A desktop GUI for Ace, the EPUB accessibility checker by the [DAISY Consortium](daisy.org).

# Development Notes

This was started from this boilerplate project:
https://github.com/pastahito/electron-react-webpack

## Work Items

* redux
  - add ES6 support to main process
  - there TODOs here related to setting status and error messages related to running Ace
  - also plenty of TODOs here as this redux code is largely untested
* messages window
  - scroll to bottom
  - use aria-live regions?
* table styling tweaks
* logo
  - check that logo is set on all platforms
  - 'about' dialog
  - app tray
* persist preferences + recents

### Ideas

* implementing style with HoC seems popular in material-ui ... consider it for the tables at least

## Polishing

* default prefs location + outdir should be app data dir
* overall wording and layout review
  - are there too many heading elements?
  - should we use material-ui drawers anywhere/everywhere?

# Limitations

* Open file vs directory behavior: https://github.com/electron/electron/blob/master/docs/api/dialog.md#dialogshowopendialogbrowserwindow-options-callback
* Dynamic menu support missing in electron
