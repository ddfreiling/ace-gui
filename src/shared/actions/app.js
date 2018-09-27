import path from 'path';
import fs from 'fs';
import ace from '@daisy/ace-core';

export const SET_READY = 'SET_READY';
export const RUN_ACE = 'RUN_ACE';
export const OPEN_REPORT = "OPEN_REPORT";
export const CLOSE_REPORT = "CLOSE_REPORT";
export const ADD_MESSAGE = "ADD_MESSAGE";

export function setReady(flag) {
  return {
    type: SET_READY,
    payload: flag,
  };
}

export function runAce(filepath) {
  return (dispatch, getState) => {
    dispatch(setReady(false));
    dispatch(addMessage(`Running Ace on ${filepath}`));
    let epubFilepath = filepath;
    let outdir = prepareOutdir(epubFilepath, getState().preferences);

    if (outdir.success) {
      ace(epubFilepath, {outdir: outdir.value})
      .then(() => {
        dispatch(addMessage('Ace check complete'));
        let reportFilepath = outdir.value + '/report.json';
        dispatch(openReport(reportFilepath));
      })
      .then(() =>
        dispatch(setReady(true))
      )
      .catch(error =>  {// Ace execution error
        dispatch(addMessage(error));
        dispatch(setReady(true));
      });
    }
    else { // error creating outdir (.value has the error message)
      dispatch(addMessage(outdir.value));
    }
  }
}
export function openReport(filepath) {
  return {
    type: OPEN_REPORT,
    payload: filepath,
  };
}
export function closeReport() {
  return {
    type: CLOSE_REPORT,
    payload: '',
  };
}
export function addMessage(message) {
  return {
    type: ADD_MESSAGE,
    payload: message,
  };
}

function prepareOutdir(filepath, prefs) {
  let outdir = prefs.outdir;
  if (prefs.organize) {
    outdir = path.join(outdir, path.parse(filepath).name);
  }
  if (!prefs.overwrite) {
    const overrides = ['report.json', 'report.html', 'data', 'js']
      .map(file => path.join(outdir, file))
      .filter(fs.existsSync);
    if (overrides.length > 0) {
      let msg = `Output directory is not empty. Running Ace would overwrite the following files or directories:
      ${overrides.map(file => `  - ${file}`).join('\n')}. Enable the option 'Overwrite' to allow this.`;
      return {success: false, value: msg};
    }
  }
  return {success: true, value: outdir};
}