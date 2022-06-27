import Web3 from 'web3'
import { HttpProvider } from 'web3-core'

describe('getBlock', () => {
  test('aaa', async () => {
    const currentProvider = new Web3.providers.HttpProvider(
      'https://mainnet.infura.io/v3/99f4f026b46143c49358ee022bb4ddbb'
    )
    const web3 = new Web3(currentProvider)
    const info = await web3.eth.getBlock('latest')
    expect(info.gasLimit).toBeGreaterThan(0)
    const prov = web3.currentProvider as HttpProvider
    prov.disconnect()
  })
})
