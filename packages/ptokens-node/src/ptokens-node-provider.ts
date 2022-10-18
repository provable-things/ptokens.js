import { http } from 'ptokens-helpers'
import jsonrpc from 'jsonrpc-lite'
import { SuccessObject, ErrorObject } from 'jsonrpc-lite'
export class pTokensNodeProvider {
  private _url: string

  /**
   * Create and initialize a pTokensNodeProvider object.
   * @param _url The URL of a pNetwork node running pNetwork webserver v3.
   */
  constructor(_url: string) {
    this._url = _url
  }

  /**
   * The URL set when creating the object.
   */
  get url(): string {
    return this._url
  }

  /**
   * Send a RPC request to the pNetwork webserver.
   * @param _reqId The request ID.
   * @param _method The RPC method to be called.
   * @param _params Optional parameters that will be passed to the RPC method.
   * @returns A Promise that resolves with the result of the JSON response.
   */
  async sendRpcRequest<T>(_reqId: number, _method: string, _params: any[]): Promise<T> {
    const req = jsonrpc.request(_reqId, _method, _params)
    const resp = await http.fetchJsonByPost<SuccessObject | ErrorObject>(this.url, req)
    if ('error' in resp) throw new Error(`JSON RPC error ${resp.error.message}`)
    else if (resp.result) return resp.result as unknown as T
    else throw new Error(`Invalid JSON RPC response ${JSON.stringify(resp)}`)
  }
}
