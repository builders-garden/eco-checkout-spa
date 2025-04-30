# Eco Checkout SPA 

A single-page application for handling stablecoin payments and transactions across multiple blockchain networks.

## Overview

The Eco Checkout SPA is a web application that enables merchants to redirect their users to a simple and intuitive interface for receiving cryptocurrency payments from various blockchain networks via intents.

## Installation

### Prerequisites

- Node.js
- Package manager (npm, yarn, or pnpm)

### Environment Variables

Create a `.env.local` file with the following variables:

```env
NEXT_PUBLIC_REOWN_APP_ID=your_reown_app_id
NEXT_PUBLIC_RELAYOOR_BASE_URL=the_Relayoor_base_url
NEXT_PUBLIC_APP_BASE_URL=your_app_base_url
```

### Installation Steps

Using npm:

```bash
npm install
npm run dev
```

Using yarn:

```bash
yarn install
yarn dev
```

Using pnpm:

```bash
pnpm install
pnpm dev
```

## Testing

The application accepts several query parameters that control the payment flow:

### Required Query Parameters

1. `recipient`: Ethereum address of the payment recipient

   - Must be a valid Ethereum address (0x followed by 40 hex characters)
   - If invalid or empty, defaults to null

2. `amount`: Payment amount the user must pay

   - Must be a positive number
   - Supports up to 2 decimal places
   - If invalid or empty, defaults to null

3. `network`: The network where the tokens will be received

   - Must be a valid and Eco-supported chain ID
   - If invalid, defaults to null

### Optional Query Parameters

1. `token`: The desired token to receive

   - Must be an Eco-supported token (e.g., "USDC")
   - If invalid or empty, defaults to "USDC"

2. `redirect`: URL to redirect after payment completion
   - Optional parameter
   - If not provided, defaults to an empty string

### Validation Behavior

The `PaymentParamsValidator` class handles parameter validation:

- Invalid or empty parameters are replaced with default values
- The app shows a "Missing Parameters" view if required parameters are missing
- Transaction processing only begins when all required parameters are valid

### The "Missing Parameters" View

If any required query parameters are missing, users can fill them in using a simple form shown in a special view that appears before the checkout process. Ideally, merchants should provide a redirect link to their users, that already includes all required query parameters.

## Application Flow

1. Parameters are validated on page load
2. If valid, the user can proceed to payment; if not valid, the user must manually fill in the required missing parameters
3. The user connects their wallet
4. If the connected wallet contains enough tokens to cover the due amount, the user is presented with an optimized selection of tokens; if the wallet's total value is insufficient, the user is prompted to connect another wallet
5. If the user is not satisfied with the optimized token selection, they can change it by opening the advanced token selection modal
6. The user reviews the checkout through the payment recap step before proceeding with the actual payment
7. The user lands in the transactions view, where the first transaction is automatically started
8. Once the user completes all transactions, if a redirect link is provided as a query parameter, the user is shown a button that redirects to the merchant's website; otherwise, the payment process finishes with a success message and the window can be closed
