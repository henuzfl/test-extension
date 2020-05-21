import { DocumentRegistry } from '@jupyterlab/docregistry';
import { Contents, ServerConnection } from '@jupyterlab/services';
import {Signal, ISignal } from '@lumino/signaling';

export class TestDrive implements Contents.IDrive {
  constructor(registry: DocumentRegistry) {
    this._registry = registry;
  }

  public _registry: DocumentRegistry;

  name: string = 'test-file-drive';
  serverSettings: ServerConnection.ISettings;
  private _fileChanged = new Signal<this, Contents.IChangedArgs>(this);


  get fileChanged(): ISignal<this, Contents.IChangedArgs> {
    return this._fileChanged;
  }

  toJupyterContents(content: any): Contents.IModel {
    const result = {
      name: content.name,
      path: content.path,
      format: "json", // this._registry.getFileType('text').fileFormat,
      type: content.type,
      created: "",
      writable: false,
      last_modified: "",
      mimetype: content.mimetype,
      content: content.content
    } as Contents.IModel;
    return result;
  }


  get(
    localPath: string,
    options?: Contents.IFetchOptions
  ): Promise<Contents.IModel> {
    const samples = [
      {
        "name":"示例目录",
        "type":"directory",
        "path":"示例目录",
        "updateTime":"2020-05-20 12:00:00"
      },
      {
        "name":"示例文件.csv",
        "type":"file",
        "path":"示例文件.csv",
        "updateTime":"2020-05-20 12:00:00",
        "oss_url":"http://192.168.2.33:9001/ancun-test/wine.csv"
      }
    ]
    let content : any;
    if(localPath == ""){
      content = samples;
    }else if(localPath == "示例文件.csv"){
      content = samples[1];
    }else{
      content = "";
    }

    return new Promise<Contents.IModel>((resolve,reject) => {
      if(Array.isArray(content)){
        resolve({
          name: "",
          path: localPath,
          format: "json",
          type: "directory",
          created: "",
          writable: false,
          last_modified: "",
          mimetype: "",
          content: content.map(c => {
            return this.toJupyterContents(c);
          })
        })
      }else{
        const ossUrl = content.oss_url;
        let requestOptions: any = {
          method: 'GET',
          redirect: 'follow'
        };
        fetch(ossUrl,requestOptions).then((response: Response) => {
          if (response.status != 200) {
            return response.json().then(json => Promise.reject(json));
          } else {
            console.log(response.text());
          }
        })
        resolve({
          type: "file",
          path:localPath,
          name: "",
          format: "text",
          content: "aa,aa",
          created: "",
          writable: false,
          last_modified: "",
          mimetype: ""
        });
      }
    })
  }
  getDownloadUrl(localPath: string): Promise<string> {
    throw new Error('Method not implemented.');
  }
  newUntitled(options?: Contents.ICreateOptions): Promise<Contents.IModel> {
    throw new Error('Method not implemented.');
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
