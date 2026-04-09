# Smartcontract Setup

## Installation

```bash
npm install
```

## Environment Setup

Set your configuration variables using Hardhat's secure vars system:

```bash
# Set Infura API Key (get from https://www.infura.io/)
npx hardhat vars set INFURA_API_KEY

# Set Sepolia Private Key (from MetaMask - WARNING: Never commit this!)
npx hardhat vars set SEPOLIA_PRIVATE_KEY
```

Variables are stored in `./.hardhat/vars` (git-ignored).

## Commands

```bash
# Compile contracts
npm run compile

# Run tests
npm test

# Deploy to local Hardhat network (for development)
npm run deploy:local

# Deploy to Sepolia testnet
npm run deploy:sepolia
```

## Contract Features

- **Ownership**: Owner can mint, manage whitelist, transfer ownership
- **Mint**: Create new tokens (onlyOwner, to must be whitelisted)
- **Burn**: Any holder can burn their own tokens
- **BurnFrom**: Spender can burn tokens with allowance
- **Whitelist**: Transfer/TransferFrom only to whitelisted addresses
- **Enumeration**: Frontend can query all whitelisted addresses

## After Deployment

When you deploy to Sepolia, note the contract address and set it in the frontend config.
