import { ChainId } from 'ptokens-constants'
import { maps } from '../src/'

describe('chainIdToBlockchainMap', () => {
  test('Should get correct blockchain and network', () => {
    expect(
      Object.values(ChainId).every((_chainId) =>
        Object.values(maps.chainIdToBlockchainMap.get(_chainId)).every((_val) => _val !== undefined)
      )
    ).toBeTruthy()
  })
})
