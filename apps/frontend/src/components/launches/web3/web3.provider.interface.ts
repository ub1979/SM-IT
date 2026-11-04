export interface Web3ProviderInterface {
  onComplete: (code: string, state: string) => void;
  nonce: string;
  setupToken?: string;
  botName?: string;
}
