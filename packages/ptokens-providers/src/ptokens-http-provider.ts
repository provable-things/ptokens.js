import axios, { AxiosInstance, AxiosResponse, AxiosRequestConfig, AxiosRequestHeaders } from 'axios'

const DEFAULT_TIMEOUT = 10000
const DEFAULT_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Origin, Content-Type',
  'Content-Type': 'application/json',
}

export enum CallTypes {
  CALL_GET,
  CALL_POST,
}

async function tryAxiosRequest<T>(promise: Promise<T>): Promise<T> {
  try {
    const ret = await promise
    return ret
  } catch (err) {
    if (err.code === 'ERR_REQUEST_ABORTED') throw new Error('Timeout!')
    throw err
  }
}

export class HttpProvider {
  endpoint: string
  headers: AxiosRequestHeaders
  api: AxiosInstance

  constructor(_endpoint: string, _headers?) {
    this.headers = _headers || DEFAULT_HEADERS
    this.endpoint = _endpoint
    this.api = axios.create({
      baseURL: _endpoint,
      headers: _headers || DEFAULT_HEADERS,
    })
  }

  async call<T>(_callType: CallTypes, _apiPath: string, _params = {}, _timeout = DEFAULT_TIMEOUT): Promise<T> {
    const options: AxiosRequestConfig = {}
    if (_timeout) options.timeout = _timeout
    let res: AxiosResponse<T>
    switch (_callType) {
      case CallTypes.CALL_GET:
        res = await tryAxiosRequest(this.api.get(_apiPath, options))
        break
      case CallTypes.CALL_POST:
        res = await tryAxiosRequest(this.api.post(_apiPath, _params, options))
        break
      default:
        throw new Error('Unsupported call type')
    }
    return res.data
  }

  setEndpoint(_endpoint: string) {
    this.endpoint = _endpoint
    this.api = axios.create({
      baseURL: _endpoint,
      headers: this.headers,
    })
    return this
  }

  setHeaders(_headers: any) {
    this.headers = _headers
    this.api = axios.create({
      baseURL: this.endpoint,
      headers: _headers,
    })
    return this
  }
}
