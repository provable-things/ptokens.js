import * as bitcoin from 'bitcoinjs-lib'
import { Network } from 'bitcoinjs-lib'
import { pTokensNode } from 'ptokens-node'
import * as utils from 'ptokens-utils'
import Web3 from 'web3'
import PromiEvent from 'promievent'

const HOST_NODE_POLLING_TIME_INTERVAL = 3000
const POLLING_TIME = 3000

interface A {
  [key: string]: number
}
const confirmations: A = {
  btc: 1,
  ltc: 4,
  doge: 1,
  rvn: 25,
}

type IssueResult = {
  amount: number
  nativeTx: string
  hostTx: string
  to: string
}

// NOTE: will be removed in versions >= 1.0.0
const hostBlockchainEvents = {
  ethereum: 'onEthTxConfirmed',
  eosio: 'onEosTxConfirmed',
}

const litecoinNetwork: Network = {
  messagePrefix: '\x19Litecoin Signed Message:\n',
  bech32: 'ltc',
  bip32: {
    public: 0x019da462,
    private: 0x019d9cfe,
  },
  pubKeyHash: 0x30,
  scriptHash: 0x32,
  wif: 0xb0,
}

const litecoinNetworkTestnet: Network = {
  messagePrefix: '\x19Litecoin Signed Message:\n',
  bech32: 'ltc',
  bip32: {
    public: 0x019da462,
    private: 0x019d9cfe,
  },
  pubKeyHash: 0x6f,
  scriptHash: 0x3a,
  wif: 0xb0,
}

const dogecoinNetwork: Network = {
  messagePrefix: '\x1aRavencoin Signed Message:\n',
  bip32: {
    public: 0x02facafd,
    private: 0x02fac398,
  },
  pubKeyHash: 0x1e,
  scriptHash: 0x16,
  wif: 0x9e,
  bech32: undefined,
}

const ravencoinNetwork: Network = {
  messagePrefix: '\x1aRavencoin Signed Message:\n',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4,
  },
  pubKeyHash: 0x3c,
  scriptHash: 0x7a,
  wif: 0x80,
  bech32: undefined,
}

const lbcNetwork: Network = {
  messagePrefix: undefined,
  bip32: undefined,
  pubKeyHash: 0x55,
  scriptHash: 0x7a,
  wif: undefined,
  bech32: undefined,
}

const {
  constants: {
    networks: {
      BitcoinMainnet,
      BitcoinTestnet,
      LitecoinMainnet,
      LitecoinTestnet,
      DogecoinMainnet,
      RavencoinMainnet,
      LbryMainnet,
    },
    blockchains: { Bitcoin, Litecoin, Dogecoin, Ravencoin, Lbry },
  },
} = utils

const NETWORKS = {
  [Bitcoin]: {
    [BitcoinMainnet]: bitcoin.networks.bitcoin,
    [BitcoinTestnet]: bitcoin.networks.testnet,
  },
  [Litecoin]: {
    [LitecoinMainnet]: litecoinNetwork,
    [LitecoinTestnet]: litecoinNetworkTestnet,
  },
  [Dogecoin]: {
    [DogecoinMainnet]: dogecoinNetwork,
  },
  [Ravencoin]: {
    [RavencoinMainnet]: ravencoinNetwork,
  },
  [Lbry]: {
    [LbryMainnet]: lbcNetwork,
  },
}

export type DepositAddressConfig = {
  nativeBlockchain: string
  nativeNetwork: string
  hostBlockchain: string
  hostNetwork: string
  hostApi: Web3
  node: pTokensNode
}

export class DepositAddress {
  hostBlockchain: string
  hostNetwork: string
  nativeBlockchain: string
  nativeNetwork: string
  node: pTokensNode
  hostApi: Web3
  nonce: number
  enclavePublicKey: string
  address: string
  hostAddress: string

  constructor(_config: DepositAddressConfig) {
    this.hostBlockchain = _config.hostBlockchain
    this.hostNetwork = _config.hostNetwork
    this.nativeBlockchain = _config.nativeBlockchain
    this.nativeNetwork = _config.nativeNetwork
    this.node = _config.node
    this.hostApi = _config.hostApi
  }

  async generate(_hostAddress: string, _originatingChainId: string, _destinationChainId: string) {
    try {
      const res = await this.node.getNativeDepositAddress(_hostAddress, _originatingChainId, _destinationChainId)
      this.nonce = res.nonce
      this.enclavePublicKey = res.enclavePublicKey
      this.address = res.nativeDepositAddress
      this.hostAddress = _hostAddress
      return this.address
    } catch (_err) {
      console.info(_err)
      throw new Error('Error during deposit address generation')
    }
  }

  toString() {
    return this.address
  }

  verify() {
    return true
    const {
      constants: {
        blockchains: { Eosio, Telos },
      },
    } = utils

    const network = NETWORKS[this.nativeBlockchain][this.nativeNetwork]
    if (!network) throw new Error('Please use a valid combination of nativeNetwork and nativeBlockchain')

    // NOTE: eos account name are utf-8 encoded
    const hostAddressBuf =
      this.hostBlockchain === Eosio || this.hostBlockchain === Telos
        ? Buffer.from(this.hostAddress, 'utf-8')
        : Buffer.from(utils.evm.removeHexPrefix(this.hostAddress), 'hex')

    const nonceBuf = utils.converters.encodeUint64le(this.nonce)
    const enclavePublicKeyBuf = Buffer.from(utils.evm.removeHexPrefix(this.enclavePublicKey), 'hex')
    const hostAddressAndNonceHashBuf = bitcoin.crypto.hash256(Buffer.concat([hostAddressBuf, nonceBuf]))
    const output = bitcoin.script.compile(
      [].concat(hostAddressAndNonceHashBuf, bitcoin.opcodes.OP_DROP, enclavePublicKeyBuf, bitcoin.opcodes.OP_CHECKSIG)
    )

    const p2sh = bitcoin.payments.p2sh({
      redeem: {
        output,
        network,
      },
      network,
    })
    console.info(this.address)
    console.info(p2sh.address)
    return p2sh.address === this.address
  }

  waitForDeposit(originatingChainId: string): PromiEvent<string> {
    if (!this.hostApi) {
      throw new Error('Provider not specified. Impossible to monitor the tx')
    }
    if (!this.address) throw new Error('Please generate a deposit address')
    const shortNativeBlockchain = utils.helpers.getBlockchainShortType(this.nativeBlockchain)
    const shortHostBlockchain = utils.helpers.getBlockchainShortType(this.hostBlockchain)
    const promi = new PromiEvent<string>(
      (resolve) =>
        (async () => {
          const utxo = new utils.utxo[shortNativeBlockchain]()
          const nativeTxId = await utxo
            .monitorUtxoByAddress(this.address, POLLING_TIME, confirmations[shortNativeBlockchain])
            .on('broadcasted', (_) => promi.emit('nativeTxBroadcasted'))
            .on('confirmed', (_txId) => promi.emit('nativeTxConfirmed', _txId))
          const broadcastedHostTxReport = await this.node.getTransactionStatus(nativeTxId, originatingChainId)
          const hostTxId: string = broadcastedHostTxReport.outputs[0]
          const hostTxReceipt = await utils.evm.waitForTransactionConfirmation(this.hostApi, hostTxId)
          promi.emit('hostTxConfirmed', hostTxReceipt)
          resolve(hostTxId)
        })() as unknown
    )
    return promi
  }
}
