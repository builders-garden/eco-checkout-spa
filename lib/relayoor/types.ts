import { Address } from "viem";

export interface TokenBalance {
  token: string;
  amount: string;
}

export interface CallData {
  target: string;
  data: string;
  value: string;
}

// Balance Response Types
export interface BalanceResponse {
  data: Record<string, TokenBalance[]>;
}

// Get Transfers Response Types
export interface GetTransfersResponse {
  data: Record<string, Transfer[]>;
}

export interface Transfer {
  chainID: number;
  token: string;
  tokenSymbol: string;
  amount: string;
  hasPermit: boolean;
  permit3Allowance: string;
}

// Send Response Types
export interface SendResponse {
  data: {
    requestID: string;
    dAppID: string;
    intents: Intent[];
    permit3SignatureData: Permit3SignatureData;
  };
}

export interface RequestedTransferType {
  chainID: number;
  token: string;
  tokenSymbol: string;
  amount: string;
  hasPermit: boolean;
  permit3Allowance: string;
}

export interface Intent {
  routeData: RouteData;
  rewardData: RewardData;
}

export interface RouteData {
  originChainID: string;
  destinationChainID: string;
  inboxContract: string;
  salt: string;
  tokens: TokenBalance[];
  calls: CallData[];
}

export interface RewardData {
  creator: string;
  proverContract: string;
  deadline: string;
  nativeValue: string;
  tokens: TokenBalance[];
}

export interface Permit3SignatureData {
  domain: {
    name: string;
    version: string;
    chainId: number;
    verifyingContract: Address;
  };
  message: {
    owner: string;
    salt: string;
    deadline: string;
    timestamp: number;
    unhingedRoot: string;
  };
  leafs: string[];
  allowanceOrTransfers: AllowanceOrTransfer[];
}

// Get Intent Response Types
export interface GetIntentResponse {
  data: IntentData[];
}

export interface IntentData {
  quoteID: string;
  dAppID: string;
  hash: string;
  intentGroupID: string;
  intentExecutionType: string;
  creator: string;
  chainId: number;
  transactionHash: string;
  params: IntentParams;
  v2GaslessIntentData: V2GaslessIntentData;
  createdAt: string;
  updatedAt: string;
}

export interface IntentParams {
  hash: string;
  creator: string;
  prover: string;
  salt: string;
  source: string;
  destination: string;
  inbox: string;
  deadline: string;
  nativeValue: string;
  routeTokens: TokenBalance[];
  rewardTokens: TokenBalance[];
  calls: CallData[];
}

export interface V2GaslessIntentData {
  permitData: PermitData;
  allowPartial: boolean;
}

export interface PermitData {
  permit3: Permit3Data;
  permit: any[];
  permit2: any[];
}

export interface Permit3Data {
  chainId: number;
  permitContract: string;
  owner: string;
  salt: string;
  signature: string;
  deadline: string;
  timestamp: number;
  leafs: string[];
  allowanceOrTransfers: AllowanceOrTransfer[];
}

export interface AllowanceOrTransfer {
  chainID: number;
  modeOrExpiration: number;
  token: string;
  account: string;
  amountDelta: string;
}

// Execute Intent Response Types
export interface ExecuteIntentResponse {
  data: {
    successes: ExecutionSuccess[];
    failures: ExecutionFailure[];
  };
}

// Execution Success Types
export interface ExecutionSuccess {
  chainID: number;
  quoteIDs: string[];
}

// Execution Failure Types
export interface ExecutionFailure {
  chainID: number;
  quoteIDs: string[];
  error: string;
}

// Get Intent Data Response Types
export interface GetIntentDataResponse {
  data: {
    intentGroupID: string;
    destinationChainID: number;
    destinationChainTxHash: string;
  };
}
