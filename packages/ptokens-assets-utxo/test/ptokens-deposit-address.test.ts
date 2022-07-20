import { pTokensDepositAddress } from '../src/ptokens-deposit-address'
import { pTokensNode, pTokensNodeProvider } from 'ptokens-node'
import { Blockchain, Network } from 'ptokens-entities'

describe('pTokens deposit address', () => {
  test('Should generate correctly a UTXO deposit address', async () => {
    const provider = new pTokensNodeProvider('node-provider-endpoint')
    const node = new pTokensNode(provider)
    const depositAddress = new pTokensDepositAddress({
      nativeBlockchain: Blockchain.Bitcoin,
      nativeNetwork: Network.Mainnet,
      node,
    })
    const depositAddressSample = {
      enclavePublicKey: '0367663eeb293b978b495c20dee62cbfba551bf7e05a8381b374af84861ab6de39',
      nonce: 1652286130,
      nativeDepositAddress: '3Ak5KkZ66PQ6koNoWai6SB3Pi31Z8sGFF6',
    }
    const getNativeDepositAddressSpy = jest
      .spyOn(node, 'getNativeDepositAddress')
      .mockResolvedValue(depositAddressSample)
    await depositAddress.generate('destination-address', 'orig-chain-id', 'dest-chain-id')
    expect(getNativeDepositAddressSpy).toBeCalledWith('orig-chain-id', 'destination-address', 'dest-chain-id')
    expect(depositAddress.toString()).toEqual('3Ak5KkZ66PQ6koNoWai6SB3Pi31Z8sGFF6')
  })

  test('Should throw when an error occurs generating an address', async () => {
    const provider = new pTokensNodeProvider('node-provider-endpoint')
    const node = new pTokensNode(provider)
    const depositAddress = new pTokensDepositAddress({
      nativeBlockchain: Blockchain.Bitcoin,
      nativeNetwork: Network.Mainnet,
      node,
    })
    const getNativeDepositAddressSpy = jest
      .spyOn(node, 'getNativeDepositAddress')
      .mockRejectedValue(new Error('Address generation error'))
    try {
      await depositAddress.generate('destination-address', 'orig-chain-id', 'dest-chain-id')
    } catch (err) {
      expect(err.message).toEqual('Error during deposit address generation')
      expect(getNativeDepositAddressSpy).toBeCalledWith('orig-chain-id', 'destination-address', 'dest-chain-id')
    }
  })
})
