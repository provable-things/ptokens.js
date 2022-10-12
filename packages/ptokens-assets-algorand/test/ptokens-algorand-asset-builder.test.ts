import { pTokensAlgorandAssetBuilder, pTokensAlgorandProvider, BasicSignatureProvider } from '../src'
import { Blockchain, ChainId, Network } from 'ptokens-constants'
import { pTokensNode, pTokensNodeProvider } from 'ptokens-node'
import algosdk from 'algosdk'

const TEST_MNEMONIC =
  'remind hat sibling sock multiply heart tuition magic bounce option yard rely daring raven basket wood bike educate ensure museum gorilla oyster tower ability claim'

describe('Algorand asset', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  test('Should create an Algorand asset without provider', async () => {
    const assetInfo = {
      chainId: ChainId.AlgorandMainnet,
      isNative: false,
      tokenAddress: '123456789',
      tokenReference: 'token-internal-address',
    }
    const getAssetInfoSpy = jest.spyOn(pTokensNode.prototype, 'getAssetInfoByChainId').mockResolvedValue(assetInfo)
    const node = new pTokensNode(new pTokensNodeProvider('node-provider-url'))
    const builder = new pTokensAlgorandAssetBuilder(node)
    builder.setBlockchain(ChainId.AlgorandMainnet)
    builder.setSymbol('TET')
    builder.setDecimals(6)
    const asset = await builder.build()
    expect(getAssetInfoSpy).toHaveBeenNthCalledWith(1, 'TET', ChainId.AlgorandMainnet)
    expect(asset.blockchain).toStrictEqual(Blockchain.Algorand)
    expect(asset.network).toStrictEqual(Network.Mainnet)
    expect(asset.chainId).toStrictEqual(ChainId.AlgorandMainnet)
    expect(asset.weight).toEqual(1)
    expect(asset.assetInfo).toStrictEqual(assetInfo)
    expect(asset['_provider']).toStrictEqual(undefined)
    expect(asset['_customTransactions']).toStrictEqual(undefined)
  })

  test('Should create an Algorand asset with provider', async () => {
    const assetInfo = {
      chainId: ChainId.AlgorandMainnet,
      isNative: false,
      tokenAddress: '123456789',
      tokenReference: 'token-internal-address',
      decimals: 6,
    }
    const getAssetInfoSpy = jest.spyOn(pTokensNode.prototype, 'getAssetInfoByChainId').mockResolvedValue(assetInfo)
    const node = new pTokensNode(new pTokensNodeProvider('node-provider-url'))
    const client = new algosdk.Algodv2('algorand-endpoint')
    const signatureProvider = new BasicSignatureProvider(TEST_MNEMONIC)
    const provider = new pTokensAlgorandProvider(client, signatureProvider)
    const builder = new pTokensAlgorandAssetBuilder(node)
    builder.setBlockchain(ChainId.AlgorandMainnet)
    builder.setSymbol('SYM')
    builder.setProvider(provider)
    const asset = await builder.build()
    expect(getAssetInfoSpy).toHaveBeenNthCalledWith(1, 'SYM', ChainId.AlgorandMainnet)
    expect(asset.blockchain).toStrictEqual(Blockchain.Algorand)
    expect(asset.network).toStrictEqual(Network.Mainnet)
    expect(asset.chainId).toStrictEqual(ChainId.AlgorandMainnet)
    expect(asset.weight).toEqual(1)
    expect(asset.assetInfo).toStrictEqual(assetInfo)
    expect(asset['_provider']).toStrictEqual(provider)
    expect(asset['_customTransactions']).toStrictEqual(undefined)
  })

  test('Should create an Algorand asset with custom transactions', async () => {
    const assetInfo = {
      chainId: ChainId.AlgorandMainnet,
      isNative: false,
      tokenAddress: '123456789',
      tokenReference: 'token-internal-address',
    }
    const getAssetInfoSpy = jest.spyOn(pTokensNode.prototype, 'getAssetInfoByChainId').mockResolvedValue(assetInfo)
    const node = new pTokensNode(new pTokensNodeProvider('node-provider-url'))
    const builder = new pTokensAlgorandAssetBuilder(node)
    builder.setBlockchain(ChainId.AlgorandMainnet)
    builder.setSymbol('SYM')
    builder.setDecimals(6)
    const suggestedParams = {
      fee: 100,
      lastRound: 10000,
      firstRound: 9000,
      genesisID: 'mainnet-v1.0',
      genesisHash: 'wGHE2Pwdvd7S12BL5FaOP20EGYesN73ktiC1qzkkit8=',
    }
    const account = algosdk.mnemonicToSecretKey(TEST_MNEMONIC)
    const customTx = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      from: account.addr,
      to: account.addr,
      amount: 10,
      assetIndex: 1,
      suggestedParams,
    })
    builder.setCustomTransactions([customTx])
    const asset = await builder.build()
    expect(getAssetInfoSpy).toHaveBeenNthCalledWith(1, 'SYM', ChainId.AlgorandMainnet)
    expect(asset.blockchain).toStrictEqual(Blockchain.Algorand)
    expect(asset.network).toStrictEqual(Network.Mainnet)
    expect(asset.chainId).toStrictEqual(ChainId.AlgorandMainnet)
    expect(asset.weight).toEqual(1)
    expect(asset.assetInfo).toStrictEqual(assetInfo)
    expect(asset['_provider']).toStrictEqual(undefined)
    expect(asset['_customTransactions']).toStrictEqual([customTx])
  })

  test('Should not create an Algorand asset without blockchain data', async () => {
    const nodeProvider = new pTokensNodeProvider('node-provider-url')
    const node = new pTokensNode(nodeProvider)
    const builder = new pTokensAlgorandAssetBuilder(node)
    try {
      await builder.build()
      fail()
    } catch (err) {
      expect(err.message).toStrictEqual('Missing chain ID')
    }
  })

  test('Should not create an Algorand asset without symbol', async () => {
    const nodeProvider = new pTokensNodeProvider('node-provider-url')
    const node = new pTokensNode(nodeProvider)
    const builder = new pTokensAlgorandAssetBuilder(node)
    try {
      builder.setBlockchain(ChainId.AlgorandMainnet)
      await builder.build()
      fail()
    } catch (err) {
      expect(err.message).toStrictEqual('Missing symbol')
    }
  })

  test('Should reject if custom transactions are undefined', async () => {
    const nodeProvider = new pTokensNodeProvider('node-provider-url')
    const node = new pTokensNode(nodeProvider)
    const builder = new pTokensAlgorandAssetBuilder(node)
    try {
      builder.setCustomTransactions(undefined)
      await builder.build()
      fail()
    } catch (err) {
      expect(err.message).toStrictEqual('Invalid undefined transactions')
    }
  })

  test('Should reject if custom transactions is an empty array', async () => {
    const nodeProvider = new pTokensNodeProvider('node-provider-url')
    const node = new pTokensNode(nodeProvider)
    const builder = new pTokensAlgorandAssetBuilder(node)
    try {
      builder.setCustomTransactions([])
      await builder.build()
      fail()
    } catch (err) {
      expect(err.message).toStrictEqual('Invalid empty transactions array')
    }
  })
})
