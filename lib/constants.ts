import { Hex, maxUint256, maxUint32 } from "viem";

// EVM empty address
export const EMPTY_ADDRESS: Hex = "0x0000000000000000000000000000000000000000";

// A bit less than the max uint256
export const MAX_UINT256_MINUS_MAX_UINT32 = maxUint256 - maxUint32;

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

// Permit3 Types
export const PERMIT3_TYPES = {
  SignedUnhingedPermit3: [
    { name: "owner", type: "address" },
    { name: "salt", type: "bytes32" },
    { name: "deadline", type: "uint256" },
    { name: "timestamp", type: "uint48" },
    { name: "unhingedRoot", type: "bytes32" },
  ],
};
