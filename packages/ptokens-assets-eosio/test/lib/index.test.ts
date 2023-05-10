import BigNumber from 'bignumber.js'
import { getAmountInEosFormat } from '../../src'

describe('getAmountInEosFormat', () => {
  test('Should format amount correctly', () => {
    expect(getAmountInEosFormat(new BigNumber(111.4444), 6, 'SYS')).toStrictEqual('111.444400 SYS')
    expect(getAmountInEosFormat(new BigNumber(111.44443399), 6, 'SYS')).toStrictEqual('111.444434 SYS')
    expect(getAmountInEosFormat(111.44443399, 6, 'SYS')).toStrictEqual('111.444434 SYS')
    expect(getAmountInEosFormat('111.44443399', 6, 'SYS')).toStrictEqual('111.444434 SYS')
    expect(getAmountInEosFormat('111.44443399', 6, 'sys')).toStrictEqual('111.444434 SYS')
  })
})
