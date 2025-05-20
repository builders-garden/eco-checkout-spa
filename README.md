# Eco Checkout 

Eco Checkout is a single-page web application that enables merchants to seamlessly receive stablecoin payments. Merchants should redirect their users to the Eco Checkout web app via a specially crafted URL that includes the necessary payment parameters.

For example, a merchant from their website can redirect users to:

```url
https://ecocheckout.xyz/?amount=5.00&token=usdc&recipient=0x4838B106FCe9647Bdf1E7877BF73cE8B0BAD5f97&network=8453&redirect=www.google.com
```

The merchant can include a `redirect` parameter to return the user to their site after the payment is completed.

Eco Checkout, powered by [Eco Routes](https://eco.com/docs/routes/overview), makes it easy for users to aggregate and pay using stablecoins across multiple blockchain networks.

## Table of Contents

- [Eco Checkout](#eco-checkout)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [Installation](#installation)
    - [Prerequisites](#prerequisites)
    - [Environment Variables](#environment-variables)
    - [Installation Steps](#installation-steps)
  - [Use the SPA](#use-the-spa)
    - [Tokens and Chains supported](#tokens-and-chains-supported)
    - [Required Query Parameters](#required-query-parameters)
    - [Optional Query Parameters](#optional-query-parameters)
    - [Validation Behavior](#validation-behavior)
    - [The "Missing Parameters" View](#the-missing-parameters-view)
  - [Application Flow](#application-flow)
  - [Development](#development)
    - [Contributing](#contributing)
    - [Local Development](#local-development)

## Overview

Eco Checkout is a single-page application (SPA) designed to facilitate stablecoin payments across multiple blockchain networks using [Eco Routes](https://eco.com/docs/routes/overview)

The app integrates with the [Eco Routes SDK](https://eco.com/docs/routes/quickstart), allowing it to create and execute payment intents efficiently.

The application is fully open-source and can be customized to suit your needs. While the core logic is generalized, you can tailor the user interface to match your branding or workflow.

## Installation

### Prerequisites

- Node.js
- Package manager (npm, yarn, or pnpm)

### Environment Variables

Create a `.env.local` file with the following variables:

| Variable                        | Description           | Example                            |
| ------------------------------- | --------------------- | ---------------------------------- |
| `NEXT_PUBLIC_REOWN_APP_ID`      | Your Reown App ID     | `your_reown_app_id`                |
| `NEXT_PUBLIC_RELAYOOR_BASE_URL` | Relayoor API base URL | `https://relayoor.beam.eco/api/v1` |
| `NEXT_PUBLIC_APP_BASE_URL`      | Your app's base URL   | `http://localhost:3000`            |

You can get a Reown App ID from [https://cloud.reown.com/sign-in](https://cloud.reown.com/sign-in).

### Installation Steps

Choose your preferred package manager:

```bash
# Using npm
npm install && npm run dev

# Using yarn
yarn install && yarn dev

# Using pnpm
pnpm install && pnpm dev
```

## Use the SPA

### Tokens and Chains supported

The tokens and chains supported by the SPA are the ones supported by ECO. You can find it here in the [Eco docs](https://eco.com/docs/routes/chain-support)

The application accepts several query parameters in the URL that control the payment flow:

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

A URL requesting 5 USDC on Base and then redirecting to `www.google.com` (imagine it's the merchant website) looks like this:

```url
https://ecocheckout.xyz?amount=5.00&token=usdc&recipient=0x4838B106FCe9647Bdf1E7877BF73cE8B0BAD5f97&network=8453&redirect=www.google.com
```

### Validation Behavior

The `PaymentParamsValidator` class handles parameter validation:

- Invalid or empty parameters are replaced with default values
- The app shows a "Missing Parameters" view if required parameters are missing
- Transaction processing only begins when all required parameters are valid

### The "Missing Parameters" View

If any required query parameters are missing, users can fill them in using a simple form shown in a special view that appears before the checkout process. Ideally, merchants should provide a redirect link to their users, that already includes all required query parameters.

## Application Flow

1. The merchant constructs the Eco Checkout URL with the required parameters and redirects the user to it
2. Parameters are validated on page load
3. If valid, the user can proceed to payment; if not valid, the user must manually fill in the required missing parameters
4. The user connects their wallet
5. If the connected wallet contains enough tokens to cover the due amount, the user is presented with an optimized selection of tokens; if the wallet's total value is insufficient, the user is prompted to connect another wallet
6. If the user is not satisfied with the optimized token selection, they can change it by opening the advanced token selection modal
7. The user reviews the checkout through the payment recap step before proceeding with the actual payment
8. The user lands in the transactions view, where the first transaction is automatically started
9. Once the user completes all transactions, if a redirect link is provided as a query parameter, the user is shown a button that redirects to the merchant's website; otherwise, the payment process finishes with a success message and the window can be closed.

## Development

### Contributing

We welcome contributions! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Local Development

1. Fork the repository
2. Install dependencies using your preferred package manager
3. Create a `.env.local` file with the required environment variables
4. Run the development server
5. Make your changes
6. Submit a pull request
