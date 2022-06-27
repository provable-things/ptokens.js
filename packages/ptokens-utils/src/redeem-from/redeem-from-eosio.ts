// import { Api, JsonRpc } from 'eosjs'
// import { getAmountInEosFormat } from '../eosio/'
// import pTokenOnEosAbi from '../abi/pTokenOnEOSContractAbi.json'

// export function redeemFromEosio(
//   _api: Api,
//   _amount: string,
//   _nativeAddress: string,
//   _decimals: number,
//   _contractAddress: string,
//   _pToken: string,
//   _options
// ) {
//   try {
//     const { blocksBehind, expireSeconds, permission, actor } = _options
//     _api.cachedAbis.set(_contractAddress, {
//       abi: pTokenOnEosAbi,
//       rawAbi: null,
//     })

//     return _api.transact(
//       {
//         actions: [
//           {
//             account: _contractAddress,
//             name: 'redeem',
//             authorization: [
//               {
//                 actor,
//                 permission,
//               },
//             ],
//             data: {
//               sender: actor,
//               quantity: getAmountInEosFormat(_amount, _decimals, _pToken.toUpperCase()),
//               memo: _nativeAddress,
//             },
//           },
//         ],
//       },
//       {
//         blocksBehind,
//         expireSeconds,
//       }
//     )
//   } catch (_err) {
//     throw new Error(_err.message)
//   }
// }
