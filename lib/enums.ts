// Chain Images
export enum ChainImages {
  "ethereum" = "/images/chains/ethereum-logo.svg",
  "optimism" = "/images/chains/op-logo.png",
  "polygon" = "/images/chains/polygon-logo.webp",
  "mantle" = "/images/chains/mantle-logo.png",
  "base" = "/images/chains/base-logo.png",
  "arbitrum" = "/images/chains/arbitrum-logo.png",
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
  CHECKOUT = "checkout",
  PAYMENT_RECAP = "payment-recap",
  TRANSACTIONS = "transactions",
}
