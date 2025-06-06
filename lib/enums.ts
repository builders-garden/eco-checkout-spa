// Chain Images
export enum ChainImages {
  "ethereum" = "/images/chains/ethereum-logo.svg",
  "optimism" = "/images/chains/optimism-logo.svg",
  "unichain" = "/images/chains/unichain-logo.svg",
  "polygon" = "/images/chains/polygon-logo.svg",
  "base" = "/images/chains/base-logo.svg",
  "arbitrum" = "/images/chains/arbitrum-logo.svg",
  "celo" = "/images/chains/celo-logo.svg",
  "ink" = "/images/chains/ink-logo.svg",

  // Capitalized Chain Names
  "Ethereum" = "/images/chains/ethereum-logo.svg",
  "Optimism" = "/images/chains/optimism-logo.svg",
  "Unichain" = "/images/chains/unichain-logo.svg",
  "Polygon" = "/images/chains/polygon-logo.svg",
  "Base" = "/images/chains/base-logo.svg",
  "Arbitrum" = "/images/chains/arbitrum-logo.svg",
  "Celo" = "/images/chains/celo-logo.svg",
  "Ink" = "/images/chains/ink-logo.svg",
}

export enum ChainExplorerStringUrls {
  "ethereum" = "https://etherscan.io",
  "optimism" = "https://optimistic.etherscan.io",
  "unichain" = "https://uniscan.xyz",
  "polygon" = "https://polygonscan.com",
  "base" = "https://basescan.org",
  "arbitrum" = "https://arbiscan.io",
  "celo" = "https://celoscan.io",
  "ink" = "https://explorer.inkonchain.com",
}

// Token Images
export enum TokenImages {
  "usdc" = "/images/tokens/usdc-logo.svg",
  "usdbc" = "/images/tokens/usdc-logo.svg",
  "usdce" = "/images/tokens/usdc-logo.svg",
  "usdt" = "/images/tokens/usdt-logo.svg",
  "ousdt" = "/images/tokens/ousdt-logo.svg",
  "usdt0" = "/images/tokens/usdt0-logo.svg",
}

// Token Decimals
export enum TokenDecimals {
  "usdbc" = 6,
  "usdce" = 6,
  "usdc" = 6,
  "usdt" = 6,
  "ousdt" = 6,
  "usdt0" = 6,
}

// Token Symbols
export enum TokenSymbols {
  "usdbc" = "USDbC",
  "usdce" = "USDCe",
  "usdc" = "USDC",
  "usdt" = "USDT",
  "ousdt" = "oUSDT",
  "usdt0" = "USDT0",
}

// Card States
export enum CardState {
  CONNECT_WALLET = "connect-wallet",
  SELECT_PAYMENT_METHOD = "select-payment-method",
}

// Page States
export enum CheckoutPageState {
  MISSING_PARAMS = "missing-params",
  CHECKOUT = "checkout",
  PAYMENT_RECAP = "payment-recap",
  TRANSACTIONS = "transactions",
  PAYMENT_COMPLETED = "payment-completed",
}

// Transaction States
export enum TransactionStatus {
  TO_SEND = "to-send",
  AWAITING_CONFIRMATION = "awaiting-confirmation",
  SUCCESS = "success",
  ERROR = "error",
}

// Alchemy RPC Base URLs
export enum AlchemyRpcBaseUrls {
  "ethereum" = "https://eth-mainnet.g.alchemy.com/v2",
  "op mainnet" = "https://opt-mainnet.g.alchemy.com/v2",
  "polygon" = "https://polygon-mainnet.g.alchemy.com/v2",
  "base" = "https://base-mainnet.g.alchemy.com/v2",
  "arbitrum one" = "https://arb-mainnet.g.alchemy.com/v2",
  "unichain" = "https://unichain-mainnet.g.alchemy.com/v2",
  "celo" = "https://celo-mainnet.g.alchemy.com/v2",
  "ink" = "https://ink-mainnet.g.alchemy.com/v2",
}
