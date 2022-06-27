import * as bitcoin from 'bitcoinjs-lib'
import { Network } from 'bitcoinjs-lib'
import { pTokensNode } from 'ptokens-node'
import * as utils from 'ptokens-utils'
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
  node: pTokensNode
}

export class DepositAddress {
  nativeBlockchain: string
  nativeNetwork: string
  node: pTokensNode
  nonce: number
  enclavePublicKey: string
  address: string
  hostAddress: string

  constructor(_config: DepositAddressConfig) {
    this.nativeBlockchain = _config.nativeBlockchain
    this.nativeNetwork = _config.nativeNetwork
    this.node = _config.node
  }

  async generate(_hostAddress: string, _originatingChainId: string, _destinationChainId: string) {
    try {
      const res = await this.node.getNativeDepositAddress(_originatingChainId, _hostAddress, _destinationChainId)
      this.nonce = res.nonce
      this.enclavePublicKey = res.enclavePublicKey
      this.address = res.nativeDepositAddress
      this.hostAddress = _hostAddress
      return this.address
    } catch (_err) {
      throw new Error('Error during deposit address generation')
    }
  }

  toString() {
    return this.address
  }

  verify(hostBlockchain: string) {
    const {
      constants: {
        blockchains: { Eosio, Telos },
      },
    } = utils

    const network = NETWORKS[this.nativeBlockchain][this.nativeNetwork]
    if (!network) throw new Error('Please use a valid combination of nativeNetwork and nativeBlockchain')

    // NOTE: eos account name are utf-8 encoded
    const hostAddressBuf =
      hostBlockchain === Eosio || hostBlockchain === Telos
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
    return p2sh.address === this.address
  }

  waitForDeposit(): PromiEvent<string> {
    if (!this.address) {
      throw new Error('Please generate a deposit address')
    }
    const shortNativeBlockchain = utils.helpers.getBlockchainShortType(this.nativeBlockchain)
    const promi = new PromiEvent<string>(
      (resolve) =>
        (async () => {
          const utxo = new utils.utxo[shortNativeBlockchain]()
          const nativeTxId = await utxo
            .monitorUtxoByAddress(this.address, POLLING_TIME, confirmations[shortNativeBlockchain])
            .on('broadcasted', () => promi.emit('txBroadcasted'))
            .on('confirmed', (_txId) => promi.emit('txConfirmed', _txId))
          resolve(nativeTxId)
        })() as unknown
    )
    return promi
  }
}
