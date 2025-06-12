import { Hex } from "viem";

// EVM empty address
export const EMPTY_ADDRESS: Hex = "0x0000000000000000000000000000000000000000";

// Minimum Protocol Fee on Mainnet
export const MIN_MAINNET_PROTOCOL_FEE: number = 0.365;

// Minimum Protocol Fee on L2s
export const MIN_L2_PROTOCOL_FEE: number = 0.00275;

// Increase in fees per 100 tokens on Mainnet
export const INCREASE_MAINNET_PROTOCOL_FEE: number = 0.015;

// Increase in fees per 100 tokens on L2s
export const INCREASE_L2_PROTOCOL_FEE: number = 0.00075;

// ENS Resolvers
export const ENS_PUBLIC_RESOLVER_ADDRESS =
  "0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63";
export const ENS_PUBLIC_RESOLVER_ADDRESS_2 =
  "0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41";

// Base Names Resolver
export const BASENAME_L2_RESOLVER_ADDRESS =
  "0xC6d566A56A1aFf6508b41f6c90ff131615583BCD";

// Permit3 Verifier Address
export const PERMIT3_VERIFIER_ADDRESS =
  "0xFB63C771dd42F5f8C949c69Cddb15aFe585D6889";
