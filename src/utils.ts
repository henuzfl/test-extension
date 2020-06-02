export class HttpUtils {
  /**
   * get
   */
  public static async get(url: string): Promise<any> {
    return fetch(url, {
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
          return response.data;
        } else {
          return response;
        }
      });
  }

  public static async post(
    url: string,
    params: { [key: string]: any }
  ): Promise<any> {
    var myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    return fetch(url, {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify(params),
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
          return response.data;
        } else {
          return Promise.reject(response);
        }
      })
  }

  public static async put(
    url: string,
    params: { [key: string]: any }
  ): Promise<any> {
    var myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    return fetch(url, {
      method: 'PUT',
      headers: myHeaders,
      body: JSON.stringify(params),
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
          return response.data;
        } else {
          return Promise.reject(response);
        }
      })
  }

  public static async delete(url : string) : Promise<void>{
    return fetch(url, {
      method: 'DELETE',
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
          return;
        } else {
          return Promise.reject(response);
        }
      })
      .catch(error => Promise.reject("删除失败!"));
  }
}
