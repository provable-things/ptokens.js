import { http } from 'ptokens-helpers'
import jsonrpc from 'jsonrpc-lite'

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
    return await http.fetchJsonByPost<T>(this.url, req)
  }
}
