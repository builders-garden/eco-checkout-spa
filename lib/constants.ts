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
