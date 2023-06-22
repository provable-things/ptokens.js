import fetch from 'cross-fetch'

import { ERROR_JSON_RESPONSE_EXTRACTION, ERROR_UNEXPECTED_HTTP_STATUS } from '../errors'

export async function postRequest(_url: string, _body, _headers: HeadersInit | undefined = {}, _timeout = 2000) {
  const controller = new AbortController()
  const timeout = setTimeout(() => {
    controller.abort()
  }, _timeout)
  try {
    const ret = await fetch(_url, {
      method: 'post',
      body: JSON.stringify(_body),
      headers: _headers,
      signal: controller.signal,
    })
    return ret
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Timed out!')
    }
    throw error
  } finally {
    clearTimeout(timeout)
  }
}

export async function getRequest(_url: string, _headers: HeadersInit | undefined = {}, _timeout = 2000) {
  const controller = new AbortController()
  const timeout = setTimeout(() => {
    controller.abort()
  }, _timeout)
  try {
    const ret = await fetch(_url, {
      headers: _headers,
      signal: controller.signal,
    })
    return ret
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Timed out!')
    }
  } finally {
    clearTimeout(timeout)
  }
}

export async function getJsonBody<T>(_result: Response): Promise<T> {
  try {
    const jsonBody = await _result.json()
    return jsonBody as T
  } catch {
    throw new Error(ERROR_JSON_RESPONSE_EXTRACTION + JSON.stringify(_result))
  }
}

function checkResponseStatus(_resp: Response) {
  if (!_resp.ok) throw new Error(`${ERROR_UNEXPECTED_HTTP_STATUS} - '${_resp.status} ${_resp.statusText}'`)
  return _resp
}

export async function fetchJsonByGet<T>(
  _url: string,
  _headers: HeadersInit | undefined = {},
  _timeout = 2000
): Promise<T> {
  const resp = await getRequest(_url, _headers, _timeout)
  checkResponseStatus(resp)
  return await getJsonBody<T>(resp)
}

export async function fetchJsonByPost<T>(
  _url: string,
  _body,
  _headers: HeadersInit | undefined = { 'Content-Type': 'application/json' },
  _timeout = 2000
): Promise<T> {
  const resp = await postRequest(_url, _body, _headers, _timeout)
  checkResponseStatus(resp)
  return await getJsonBody<T>(resp)
}
