# RWA Token Demo Site (Frontend)

A Vue 3 + Vite dashboard for interacting with the RWA Token smart contract.

## Setup

```bash
npm install
```

## Environment Variables

Create a `.env.local` file in this directory:

```
VITE_CONTRACT_ADDRESS=0x[deployed_contract_address_on_sepolia]
VITE_RPC_URL=https://sepolia.infura.io/v3/[your_infura_key]
```

You'll get these values from:
1. Contract deployment (smartcontract folder)
2. Infura (https://www.infura.io/)

## Development

```bash
npm run dev
```

Opens at `http://localhost:5173`

## Build

```bash
npm run build
```

Outputs to `dist/` folder.

## Features

- Connect MetaMask wallet
- View total token supply
- Manage whitelist (owner only)
- Mint tokens (owner only)
- Burn tokens (any holder)
- Transfer tokens
- View transaction history
- View blocked transactions
- Distribution across wallets

## Notes

- Make sure you're on Sepolia testnet
- Contract must be deployed before using the frontend
- Owner wallet must have enough Sepolia ETH for gas
