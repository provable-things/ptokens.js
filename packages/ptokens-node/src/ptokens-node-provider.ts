import { http } from 'ptokens-helpers'
import jsonrpc from 'jsonrpc-lite'
import { SuccessObject, ErrorObject } from 'jsonrpc-lite'
export class pTokensNodeProvider {
  private _url: string

  constructor(_url: string) {
    this._url = _url
  }

  get url(): string {
    return this._url
  }

  async sendRpcRequest<T>(_reqId: number, _method: string, _params: any[]): Promise<T> {
    const req = jsonrpc.request(_reqId, _method, _params)
    const resp = await http.fetchJsonByPost<SuccessObject | ErrorObject>(this.url, req)
    if ('error' in resp) throw new Error(`JSON RPC error ${resp.error.message}`)
    else if (resp.result) return resp.result as unknown as T
    else throw new Error(`Invalid JSON RPC response ${JSON.stringify(resp)}`)
  }
}
