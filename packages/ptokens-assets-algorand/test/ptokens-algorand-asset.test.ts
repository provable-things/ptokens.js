import { pTokensNode, pTokensNodeProvider } from 'ptokens-node'
import { pTokensAlgorandAsset, pTokensAlgorandProvider } from '../src'
import PromiEvent from 'promievent'
import { Blockchain, ChainId, Network } from 'ptokens-entities'
import algosdk from 'algosdk'
import { BasicSignatureProvider } from '../src/ptokens-algorand-provider'

const TEST_MNEMONIC =
  'remind hat sibling sock multiply heart tuition magic bounce option yard rely daring raven basket wood bike educate ensure museum gorilla oyster tower ability claim'

jest.mock('ptokens-node')

describe('Algorand asset', () => {
  test('Should create an Algorand asset from constructor', () => {
    const node = new pTokensNode(new pTokensNodeProvider('test-url'))
    const asset = new pTokensAlgorandAsset({
      node,
      symbol: 'SYM',
      assetInfo: {
        chainId: ChainId.AlgorandMainnet,
        isNative: true,
        tokenAddress: 'token-contract-address',
        tokenInternalAddress: 'token-internal-address',
        isSystemToken: false,
        vaultAddress: 'vault-contract-address',
      },
    })
    expect(asset.symbol).toStrictEqual('SYM')
    expect(asset.chainId).toStrictEqual(ChainId.AlgorandMainnet)
    expect(asset.blockchain).toStrictEqual(Blockchain.Algorand)
    expect(asset.network).toStrictEqual(Network.Mainnet)
    expect(asset.weight).toEqual(1)
  })

  describe('hostToInterim', () => {
    beforeEach(() => {
      jest.resetAllMocks()
    })
    test('Should not call hostToInterim if provider is missing', async () => {
      const node = new pTokensNode(new pTokensNodeProvider('test-url'))
      const asset = new pTokensAlgorandAsset({
        node,
        symbol: 'SYM',
        assetInfo: {
          chainId: ChainId.AlgorandMainnet,
          isNative: true,
          tokenAddress: 'token-contract-address',
          tokenInternalAddress: 'token-internal-address',
          isSystemToken: false,
          vaultAddress: 'vault-contract-address',
        },
      })
      try {
        await asset.hostToInterim(1, 'destination-address', 'destination-chain-id')
        fail()
      } catch (err) {
        expect(err.message).toEqual('Missing provider')
      }
    })

    test('Should not call hostToInterim for native tokens', async () => {
      const node = new pTokensNode(new pTokensNodeProvider('test-url'))
      const client = new algosdk.Algodv2('algorand-endpoint')
      const signatureProvider = new BasicSignatureProvider(TEST_MNEMONIC)
      const provider = new pTokensAlgorandProvider(client, signatureProvider)
      const account = algosdk.mnemonicToSecretKey(TEST_MNEMONIC)
      provider.setAccount(account.addr)
      const transactSpy = jest.spyOn(provider, 'transactInGroup').mockImplementation(() => {
        const promi = new PromiEvent<string>((resolve) =>
          setImmediate(() => {
            promi.emit('txBroadcasted', 'tx-hash')
            promi.emit('txConfirmed', 'tx-hash')
            return resolve('tx-hash')
          })
        )
        return promi
      })
      const asset = new pTokensAlgorandAsset({
        node,
        symbol: 'SYM',
        provider: provider,
        assetInfo: {
          chainId: ChainId.AlgorandMainnet,
          isNative: true,
          tokenAddress: 'token-contract-address',
          tokenInternalAddress: 'token-internal-address',
          isSystemToken: false,
          vaultAddress: 'vault-contract-address',
        },
      })
      try {
        await asset.hostToInterim(1, 'destination-address', 'destination-chain-id')
        fail()
      } catch (err) {
        expect(err.message).toEqual('Invalid call to hostToInterim() for native token')
        expect(transactSpy).toHaveBeenCalledTimes(0)
      }
    })

    test('Should not call hostToInterim if token owner is missing', async () => {
      const node = new pTokensNode(new pTokensNodeProvider('test-url'))
      const client = new algosdk.Algodv2('algorand-endpoint')
      const signatureProvider = new BasicSignatureProvider(TEST_MNEMONIC)
      const provider = new pTokensAlgorandProvider(client, signatureProvider)
      const getAssetInfoSpy = jest.spyOn(pTokensNode.prototype, 'getAssetInfoByChainId')
      const transactSpy = jest.spyOn(provider, 'transactInGroup')
      const asset = new pTokensAlgorandAsset({
        node,
        symbol: 'SYM',
        provider: provider,
        assetInfo: {
          chainId: ChainId.AlgorandMainnet,
          isNative: false,
          tokenAddress: '123456789',
          tokenInternalAddress: 'token-internal-address',
          isSystemToken: false,
          hostIdentity: 'HIBVFSZFK4FEANCOZFIVZNBHLJK3ERRHKDRZVGX4RZU7WQIMSSKL4PQZMA',
        },
      })
      try {
        await asset.hostToInterim(1, 'destination-address', 'destination-chain-id')
        fail()
      } catch (err) {
        expect(err.message).toEqual('Missing account')
        expect(getAssetInfoSpy).toHaveBeenCalledTimes(0)
        expect(transactSpy).toHaveBeenCalledTimes(0)
      }
    })

    test('Should call makeContractSend with redeem for non-native token', async () => {
      const node = new pTokensNode(new pTokensNodeProvider('test-url'))
      const client = new algosdk.Algodv2('algorand-endpoint')
      const signatureProvider = new BasicSignatureProvider(TEST_MNEMONIC)
      const provider = new pTokensAlgorandProvider(client, signatureProvider)
      const account = algosdk.mnemonicToSecretKey(TEST_MNEMONIC)
      provider.setAccount(account.addr)
      const suggestedParams = {
        fee: 100,
        lastRound: 10000,
        firstRound: 9000,
        genesisID: 'mainnet-v1.0',
        genesisHash: 'wGHE2Pwdvd7S12BL5FaOP20EGYesN73ktiC1qzkkit8=',
      }
      const getTransactionParamsSpy = jest.spyOn(provider, 'getTransactionParams').mockResolvedValue(suggestedParams)
      const transactSpy = jest.spyOn(provider, 'transactInGroup').mockImplementation(() => {
        const promi = new PromiEvent<string>((resolve) =>
          setImmediate(() => {
            promi.emit('txBroadcasted', 'tx-hash')
            promi.emit('txConfirmed', 'tx-hash')
            return resolve('tx-hash')
          })
        )
        return promi
      })
      const asset = new pTokensAlgorandAsset({
        node,
        symbol: 'SYM',
        provider: provider,
        assetInfo: {
          chainId: ChainId.AlgorandMainnet,
          isNative: false,
          tokenAddress: '123456789',
          tokenInternalAddress: 'token-internal-address',
          isSystemToken: false,
          hostIdentity: 'HIBVFSZFK4FEANCOZFIVZNBHLJK3ERRHKDRZVGX4RZU7WQIMSSKL4PQZMA',
        },
      })
      let txHashBroadcasted = ''
      let txHashConfirmed = ''
      const ret = await asset
        .hostToInterim(1, 'destination-address', 'destination-chain-id')
        .on('txBroadcasted', (_txHash) => {
          txHashBroadcasted = _txHash
        })
        .on('txConfirmed', (_txHash) => {
          txHashConfirmed = _txHash
        })
      expect(txHashBroadcasted).toEqual('tx-hash')
      expect(txHashConfirmed).toEqual('tx-hash')
      expect(ret).toEqual('tx-hash')
      expect(getTransactionParamsSpy).toHaveBeenNthCalledWith(1)
      expect(transactSpy).toHaveBeenNthCalledWith(1, [
        algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
          from: account.addr,
          to: 'HIBVFSZFK4FEANCOZFIVZNBHLJK3ERRHKDRZVGX4RZU7WQIMSSKL4PQZMA',
          amount: 1,
          suggestedParams,
          assetIndex: 123456789,
          note: Uint8Array.from([
            148, 0, 180, 100, 101, 115, 116, 105, 110, 97, 116, 105, 111, 110, 45, 99, 104, 97, 105, 110, 45, 105, 100,
            179, 100, 101, 115, 116, 105, 110, 97, 116, 105, 111, 110, 45, 97, 100, 100, 114, 101, 115, 115, 144,
          ]),
        }),
      ])
    })

    test('Should call makeContractSend with redeem for non-native token with user data', async () => {
      const node = new pTokensNode(new pTokensNodeProvider('test-url'))
      const client = new algosdk.Algodv2('algorand-endpoint')
      const signatureProvider = new BasicSignatureProvider(TEST_MNEMONIC)
      const provider = new pTokensAlgorandProvider(client, signatureProvider)
      const account = algosdk.mnemonicToSecretKey(TEST_MNEMONIC)
      provider.setAccount(account.addr)
      const suggestedParams = {
        fee: 100,
        lastRound: 10000,
        firstRound: 9000,
        genesisID: 'mainnet-v1.0',
        genesisHash: 'wGHE2Pwdvd7S12BL5FaOP20EGYesN73ktiC1qzkkit8=',
      }
      const getTransactionParamsSpy = jest.spyOn(provider, 'getTransactionParams').mockResolvedValue({
        fee: 100,
        lastRound: 10000,
        firstRound: 9000,
        genesisID: 'mainnet-v1.0',
        genesisHash: 'wGHE2Pwdvd7S12BL5FaOP20EGYesN73ktiC1qzkkit8=',
      })
      const transactSpy = jest.spyOn(provider, 'transactInGroup').mockImplementation(() => {
        const promi = new PromiEvent<string>((resolve) =>
          setImmediate(() => {
            promi.emit('txBroadcasted', 'tx-hash')
            promi.emit('txConfirmed', 'tx-hash')
            return resolve('tx-hash')
          })
        )
        return promi
      })
      const asset = new pTokensAlgorandAsset({
        node,
        symbol: 'SYM',
        provider: provider,
        assetInfo: {
          chainId: ChainId.AlgorandMainnet,
          isNative: false,
          tokenAddress: '123456789',
          tokenInternalAddress: 'token-internal-address',
          isSystemToken: false,
          hostIdentity: 'HIBVFSZFK4FEANCOZFIVZNBHLJK3ERRHKDRZVGX4RZU7WQIMSSKL4PQZMA',
        },
      })
      let txHashBroadcasted = ''
      let txHashConfirmed = ''
      const ret = await asset
        .hostToInterim(1, 'destination-address', 'destination-chain-id', Buffer.from('user-data'))
        .on('txBroadcasted', (_txHash) => {
          txHashBroadcasted = _txHash
        })
        .on('txConfirmed', (_txHash) => {
          txHashConfirmed = _txHash
        })
      expect(txHashBroadcasted).toEqual('tx-hash')
      expect(txHashConfirmed).toEqual('tx-hash')
      expect(ret).toEqual('tx-hash')
      expect(getTransactionParamsSpy).toHaveBeenNthCalledWith(1)
      expect(transactSpy).toHaveBeenNthCalledWith(1, [
        algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
          from: account.addr,
          to: 'HIBVFSZFK4FEANCOZFIVZNBHLJK3ERRHKDRZVGX4RZU7WQIMSSKL4PQZMA',
          amount: 1,
          suggestedParams,
          assetIndex: 123456789,
          note: Uint8Array.from([
            148, 0, 180, 100, 101, 115, 116, 105, 110, 97, 116, 105, 111, 110, 45, 99, 104, 97, 105, 110, 45, 105, 100,
            179, 100, 101, 115, 116, 105, 110, 97, 116, 105, 111, 110, 45, 97, 100, 100, 114, 101, 115, 115, 144,
          ]),
        }),
        ,
      ])
    })
  })
})
