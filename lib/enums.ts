// Chain Images
export enum ChainImages {
  "ethereum" = "/images/chains/ethereum-logo.svg",
  "optimism" = "/images/chains/op-logo.png",
  "polygon" = "/images/chains/polygon-logo.webp",
  "base" = "/images/chains/base-logo.png",
  "arbitrum" = "/images/chains/arbitrum-logo.png",

  // Capitalized Chain Names
  "Ethereum" = "/images/chains/ethereum-logo.svg",
  "Optimism" = "/images/chains/op-logo.png",
  "Polygon" = "/images/chains/polygon-logo.webp",
  "Base" = "/images/chains/base-logo.png",
  "Arbitrum" = "/images/chains/arbitrum-logo.png",
}

export enum ChainExplorerStringUrls {
  "ethereum" = "https://etherscan.io",
  "optimism" = "https://optimistic.etherscan.io",
  "polygon" = "https://polygonscan.com",
  "base" = "https://basescan.org",
  "arbitrum" = "https://arbiscan.io",
}

// Token Images
export enum TokenImages {
  "usdbc" = "/images/tokens/usdc-logo.png",
  "usdce" = "/images/tokens/usdc-logo.png",
  "usdc" = "/images/tokens/usdc-logo.png",
  "usdt" = "/images/tokens/usdt-logo.png",
}

// Token Decimals
export enum TokenDecimals {
  "usdbc" = 6,
  "usdce" = 6,
  "usdc" = 6,
  "usdt" = 6,
}

// Token Symbols
export enum TokenSymbols {
  "usdbc" = "USDbC",
  "usdce" = "USDCe",
  "usdc" = "USDC",
  "usdt" = "USDT",
}

// Card States
export enum CardState {
  CONNECT_WALLET = "connect-wallet",
  SELECT_PAYMENT_METHOD = "select-payment-method",
}

// Page States
export enum PageState {
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
}
