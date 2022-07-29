import { http } from 'ptokens-helpers'
import jsonrpc from 'jsonrpc-lite'
import { SuccessObject, ErrorObject } from 'jsonrpc-lite'
export class pTokensNodeProvider {
  url: string

  constructor(url: string) {
    this.url = url
  }

  getUrl(): string {
    return this.url
  }

  async sendRpcRequest<T>(_reqId: number, _method: string, _params: Array<any>): Promise<T> {
    const req = jsonrpc.request(_reqId, _method, _params)
    const resp = await http.fetchJsonByPost<SuccessObject | ErrorObject>(this.url, req)
    if ('error' in resp) throw new Error(`JSON RPC error ${resp.error.message}`)
    else if (resp.result) return resp.result as unknown as T
    else throw new Error(`Invalid JSON RPC response ${JSON.stringify(resp)}`)
  }
}
