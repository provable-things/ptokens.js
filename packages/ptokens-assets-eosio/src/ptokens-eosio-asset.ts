import { pTokensAsset } from 'ptokens-entities'
import PromiEvent from 'promievent'
export class pTokensEosioAsset extends pTokensAsset {
  nativeToInterim(): PromiEvent<string> {
    throw new Error('Method not implemented.')
  }
  hostToInterim(): PromiEvent<string> {
    throw new Error('Method not implemented.')
  }
}
