import { DocumentRegistry } from '@jupyterlab/docregistry';
import { Contents, ServerConnection } from '@jupyterlab/services';
import { Signal, ISignal } from '@lumino/signaling';

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

  getPathIdByLocalPath(localPath: string): Promise<Number> {
    if (localPath == '') {
      return new Promise<Number>((resolve, reject) => {
        resolve(0);
      });
    }
    localPath = this.formatLocalPath(localPath);
    var myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    var raw = JSON.stringify({ path: localPath });
    return fetch(this._backEndBaseUrl + 'doc/path/info', {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow'
    })
      .then((response: Response) => {
        if (response.status != 200) {
          return response.json().then(json => Promise.reject(json));
        }
        return response.json();
      })
      .then(response => {
        if (response && response.code == 200) {
          const resData = response.data;
          return new Promise<Number>((resolve, reject) => {
            resolve(resData.id);
          });
        } else {
          return Promise.reject(response);
        }
      });
  }

  formatLocalPath(localPath: string): string {
    if (!localPath.startsWith('/')) {
      localPath = '/' + localPath;
    }
    return localPath;
  }

  get(
    localPath: string,
    options?: Contents.IFetchOptions
  ): Promise<Contents.IModel> {
    return this.getPathIdByLocalPath(localPath).then(pathId => {
      const pathUrl = this._backEndBaseUrl + 'doc/' + pathId + '/tree';
      return fetch(pathUrl, {
        method: 'GET',
        redirect: 'follow'
      })
        .then((response: Response) => {
          if (response.status != 200) {
            return response.json().then(json => Promise.reject(json));
          }
          return response.json();
        })
        .then(response => {
          if (response && response.code == 200) {
            /**
             * 判断是目录，则显示目录
             */
            const resData = response.data;

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
        });
    });
  }
  getDownloadUrl(localPath: string): Promise<string> {
    throw new Error('Method not implemented.');
  }
  newUntitled(options?: Contents.ICreateOptions): Promise<Contents.IModel> {
    console.log(options);
    this.getPathIdByLocalPath(options.path).then(pathId => {
      /**
       * 调用添加文件夹的接口
       */
      var myHeaders = new Headers();
      myHeaders.append('Content-Type', 'application/json');
      var raw = JSON.stringify({
        folderId: pathId,
        isFolder: true,
      });
      return fetch(this._backEndBaseUrl + 'doc/add', {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
      })
        .then((response: Response) => {
          if (response.status != 200) {
            return response.json().then(json => Promise.reject(json));
          }
          return response.json();
        })
        .then(response => {
          if (response && response.code == 200) {

            const resData = response.data;
            this._fileChanged.emit({
              type: 'new',
              oldValue: null,
              newValue: resData
            });
            return this.toJupyterContents(resData);
          } else {
            return Promise.reject(response);
          }
        });

      
    });
    return Promise.reject('Not yet');
  }
  delete(localPath: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
  rename(oldLocalPath: string, newLocalPath: string): Promise<Contents.IModel> {
    throw new Error('Method not implemented.');
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
