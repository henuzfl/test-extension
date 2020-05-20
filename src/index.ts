import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

/**
 * Initialization data for the test-extension extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'test-extension',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    console.log('JupyterLab extension test-extension is activated!');
  }
};

export default extension;
