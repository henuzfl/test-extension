import { Widget, GridLayout } from '@lumino/widgets';
import { FileBrowser } from '@jupyterlab/filebrowser';
import { IDocumentManager } from "@jupyterlab/docmanager";


export class AncunFileBrowser extends Widget {
  constructor(browser: FileBrowser, manager: IDocumentManager) {
    super();
    this.addClass('jp-TestBrowser');
    const layout = (this.layout = new GridLayout({
      rowCount: 1,
      columnCount: 1
    }));
    layout.addWidget(browser);
    browser.model.refresh();
  }
}