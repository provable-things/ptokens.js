import { http } from 'ptokens-utils'
import jsonrpc from 'jsonrpc-lite'

export class pTokensNodeProvider {
  url: string

  constructor(url: string) {
    this.url = url
  }

  getUrl(): string {
    return this.url
  }

  sendRpcRequest(_reqId: number, _method: string, _params: Array<any>): Promise<unknown> {
    const req = jsonrpc.request(_reqId, _method, _params)
    return http.postRequest(this.url, req)
  }
}
