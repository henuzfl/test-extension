import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { PanelLayout, Widget } from "@lumino/widgets";

import { IDocumentManager } from "@jupyterlab/docmanager";

import {
  IFileBrowserFactory,
  FileBrowser
} from '@jupyterlab/filebrowser';
import { TestDrive } from './contents';


/**
 * Initialization data for the test-extension extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'test-extension',
  autoStart: true,
  requires: [
    IDocumentManager,
    IFileBrowserFactory
  ],
  activate: activeTestFileBrower
};

export class TestFileBrowerWidget extends Widget{
  constructor(browser: FileBrowser) {
    super();
    this.addClass("jp-AncunBrowser");
    this.layout = new PanelLayout();
    (this.layout as PanelLayout).addWidget(browser);
    browser.model.refresh();
  }
}

const NAMESPACE = "test-filebrowser";

function activeTestFileBrower(
  app: JupyterFrontEnd,
  manager: IDocumentManager,
  factory: IFileBrowserFactory,
): void{
  const drive = new TestDrive(app.docRegistry);
  manager.services.contents.addDrive(drive);

  const browser = factory.createFileBrowser(NAMESPACE, {
    driveName: drive.name,
    state: null,
    refreshInterval: 300000
  });

  const widget = new TestFileBrowerWidget(browser);
  widget.title.iconClass = "jp-icon3 jp-SideBar-tabIcon";
  widget.title.caption = "Test file Browser";
  widget.id = "test-file-browser";

  app.shell.add(widget, "left", { rank: 100 });
  return;
}

export default extension;
