import { NetworkId } from 'ptokens-constants'

import { maps } from '../src/'

describe('chainIdToBlockchainMap', () => {
  test('Should get correct blockchain and network', () => {
    expect(
      Object.values(NetworkId).every((_networkId) =>
        Object.values(maps.chainIdToBlockchainMap.get(_networkId)).every((_val) => _val !== undefined)
      )
    ).toBeTruthy()
  })
})
