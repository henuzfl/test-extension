export class HttpUtils {
  /**
   * get
   */
  public async get(url: string): Promise<any> {
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
}
