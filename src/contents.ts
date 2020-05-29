import { DocumentRegistry } from '@jupyterlab/docregistry';
import { Contents, ServerConnection } from '@jupyterlab/services';
import { Signal, ISignal } from '@lumino/signaling';
import { HttpUtils } from './utils';

export class TestDrive implements Contents.IDrive {
  constructor(registry: DocumentRegistry) {
    this._registry = registry;
    this._backEndBaseUrl = 'http://192.168.2.55:1325/';
  }

  public _registry: DocumentRegistry;
  private _backEndBaseUrl: string;

  name: string = 'test-file-drive';
  serverSettings: ServerConnection.ISettings;
  private _fileChanged = new Signal<this, Contents.IChangedArgs>(this);

  get fileChanged(): ISignal<this, Contents.IChangedArgs> {
    return this._fileChanged;
  }

  toJupyterContents(content: any): Contents.IModel {
    let contentType = 'file';
    if (content.isFolder) {
      contentType = 'directory';
    }
    const result = {
      name: content.filename,
      path: content.path,
      format: 'json', // this._registry.getFileType('text').fileFormat,
      type: contentType,
      created: content.createTime,
      writable: false,
      last_modified: content.updateTime,
      mimetype: '',
      content: ''
    } as Contents.IModel;
    return result;
  }

  async getInfoByLocalPath(localPath: string) {
    if (localPath == '') {
      return 0;
    }
    localPath = this.formatLocalPath(localPath);
    return HttpUtils.post(this._backEndBaseUrl + 'doc/path/info', {
      path: localPath
    });
  }

  formatLocalPath(localPath: string): string {
    if (!localPath.startsWith('/')) {
      localPath = '/' + localPath;
    }
    return localPath;
  }

  async get(
    localPath: string,
    options?: Contents.IFetchOptions
  ): Promise<Contents.IModel> {
    let pathId = 0;
    if (localPath != '') {
      const pathInfo = await this.getInfoByLocalPath(localPath);
      pathId = pathInfo.id;
    }

    const pathUrl = this._backEndBaseUrl + 'doc/' + pathId + '/tree';

    const resData = await HttpUtils.get(pathUrl);

    return new Promise<Contents.IModel>((resolve, reject) => {
      if (resData.isFolder) {
        let content: any[] = new Array<any>();
        let children = resData.children;
        if (resData.children) {
          content = children;
        }
        if (Array.isArray(children)) {
          content = children.map(c => this.toJupyterContents(c));
        }
        if (localPath.startsWith('/')) {
          localPath = localPath.substring(1, localPath.length);
        }
        resolve({
          type: 'directory',
          path: localPath.trim(),
          name: '',
          format: 'json',
          content: content,
          created: '',
          writable: false,
          last_modified: '',
          mimetype: ''
        });
      } else {
        resolve({
          type: 'file',
          path: localPath,
          name: '',
          format: 'text',
          content: 'aa,aa\nbb,bb',
          created: '',
          writable: false,
          last_modified: '',
          mimetype: ''
        });
      }
    });
  }

  getDownloadUrl(localPath: string): Promise<string> {
    throw new Error('Method not implemented.');
  }
  async newUntitled(
    options?: Contents.ICreateOptions
  ): Promise<Contents.IModel> {
    const pathInfo = await this.getInfoByLocalPath(options.path);
    const pathId = pathInfo.id;
    var myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    const resData = await HttpUtils.post(this._backEndBaseUrl + 'doc/add', {
      folderId: pathId,
      isFolder: true
    });

    const newModel = this.toJupyterContents(resData);
    this._fileChanged.emit({
      type: 'new',
      oldValue: null,
      newValue: newModel
    });
    return newModel;
  }

  async delete(localPath: string): Promise<void> {
    const localPathInfo = await this.getInfoByLocalPath(localPath);
    // if (localPathInfo.isFolder && null != localPathInfo.children) {
    //   const message = `确定删除: ` + localPathInfo.name + '吗？';
    //   const result = await showDialog({
    //     title: '删除',
    //     body: message,
    //     buttons: [Dialog.cancelButton(), Dialog.warnButton({ label: 'Delete' })]
    //   });
    //   if (this.isDisposed || !result.button.accept) {
    //     return;
    //   }
    // }
    await HttpUtils.delete(this._backEndBaseUrl + 'doc/delete/' + localPathInfo.id);
    this._fileChanged.emit({
      type: 'delete',
      oldValue: { path: localPath },
      newValue: null
    });
  }

  getFileNameByPath(path: string): string {
    if ('' == path) {
      return '';
    }
    if (path.indexOf('/') == -1) {
      return path;
    }
    return path.split('/').pop();
  }

  getParentPathByPath(path: string): string {
    if ('' == path) {
      return '';
    }
    if (path.endsWith('/')) {
      path = path.substring(0, path.length - 1);
    }
    return path.substring(0, path.lastIndexOf('/'));
  }

  async rename(
    oldLocalPath: string,
    newLocalPath: string
  ): Promise<Contents.IModel> {
    oldLocalPath = oldLocalPath.trim();
    newLocalPath = newLocalPath.trim();
    const oldPathInfo = await this.getInfoByLocalPath(oldLocalPath);
    const oldPathId = oldPathInfo.id;
    const newFileName = this.getFileNameByPath(newLocalPath);
    const newParentPath = this.getParentPathByPath(newLocalPath);
    const oldParentPath = this.getParentPathByPath(oldLocalPath);
    var raw: { [key: string]: string } = {};
    raw['filename'] = newFileName;
    raw['id'] = oldPathId;
    if (newParentPath != oldParentPath) {
      const newParentPathInfo = await this.getInfoByLocalPath(newParentPath);
      raw['folderId'] = newParentPathInfo.id;
    }
    var myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');

    const resData =  await HttpUtils.post(this._backEndBaseUrl + 'doc/update',raw);
    const newModel = this.toJupyterContents(resData);
    this._fileChanged.emit({
      type: 'rename',
      oldValue: { path: oldLocalPath },
      newValue: newModel
    });
    return newModel;
  }
  save(
    localPath: string,
    options?: Partial<Contents.IModel>
  ): Promise<Contents.IModel> {
    throw new Error('Method not implemented.');
  }
  copy(localPath: string, toLocalDir: string): Promise<Contents.IModel> {
    throw new Error('Method not implemented.');
  }
  createCheckpoint(localPath: string): Promise<Contents.ICheckpointModel> {
    throw new Error('Method not implemented.');
  }
  listCheckpoints(localPath: string): Promise<Contents.ICheckpointModel[]> {
    throw new Error('Method not implemented.');
  }
  restoreCheckpoint(localPath: string, checkpointID: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
  deleteCheckpoint(localPath: string, checkpointID: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
  isDisposed: boolean;
  dispose(): void {
    throw new Error('Method not implemented.');
  }
}
