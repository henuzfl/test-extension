import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { IDocumentManager } from "@jupyterlab/docmanager";
import {
  IFileBrowserFactory,
} from '@jupyterlab/filebrowser';
import { TestDrive } from './contents';
import { SetupCommands } from './commands';

import {
  ICommandPalette
} from '@jupyterlab/apputils';
import { AncunFileBrowser } from './dislogs';


/**
 * Initialization data for the test-extension extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'test-extension',
  autoStart: true,
  requires: [
    IDocumentManager,
    IFileBrowserFactory,
    ICommandPalette
  ],
  activate: activeTestFileBrower
};

const NAMESPACE = "test-filebrowser";

function activeTestFileBrower(
  app: JupyterFrontEnd,
  manager: IDocumentManager,
  factory: IFileBrowserFactory,
  palette: ICommandPalette
): void{
  /**
   * 自定义的文件浏览器驱动，并添加到document manager
   */
  const drive = new TestDrive(app.docRegistry);
  manager.services.contents.addDrive(drive);

  /**
   * 使用IFileBrowserFactory新建文件浏览器，并使用自定义的drive
   */
  const browser = factory.createFileBrowser(NAMESPACE, {
    driveName: drive.name,
    state: null,
    refreshInterval: 10000
  });

  /**
   * 自定义的widget，并添加到app
   */
  const widget = new AncunFileBrowser(browser,manager);
  widget.title.iconClass = "jp-test-icon jp-SideBar-tabIcon";
  widget.title.caption = "Test file Browser";
  widget.id = "test-file-browser";
  SetupCommands(app,palette);
  app.shell.add(widget, "left", { rank: 100 });
  return;
}

export default extension;
