# RWA Token Demo - QF5208 Project

A tokenized Real-World Asset (RWA) investment product demo deployed on the Sepolia testnet.

## 🎯 Project Overview

This project demonstrates a complete tokenization solution for real-world assets, including:

- **Smart Contract**: ERC-20 token with ownership control, whitelist management, and transfer restrictions
- **Frontend Dashboard**: Interactive web interface to manage tokens, view distributions, and track transactions
- **Landing Page**: Professional introduction with project overview

### Key Features

✅ **Token Management**
- Mint new tokens (Owner only)
- Burn tokens (any holder)
- Transfer with whitelist restrictions
- Real-time balance tracking

✅ **Whitelist Control**
- Add/remove addresses (Owner only)
- View whitelisted wallets and distributions
- Automatic blocking of transfers to non-whitelisted addresses

✅ **Transaction Tracking**
- View successful transactions
- Monitor blocked transactions with reasons
- Real-time dashboard updates

✅ **Role-Based Access**
- Owner: Full control (mint, burn, manage whitelist)
- Investor: Limited access (burn own tokens, transfer to whitelisted addresses)

---

## 📦 Technology Stack

### Smart Contract
- **Language**: Solidity 0.8.28
- **Framework**: Hardhat
- **Network**: Sepolia Testnet
- **Standard**: ERC-20

### Frontend
- **Framework**: Vue 3 (Composition API)
- **Build Tool**: Vite
- **Web3**: ethers.js v6
- **Wallet**: MetaMask
- **Styling**: CSS3 with Glassmorphism

---

## 🚀 Live Demo

**Deployed URL**: (Will be updated after Vercel deployment)

**Smart Contract Address**: `0xDc24F48FB96407139ffe5076Ce4178D1D9663FEB` (Sepolia)

**Network**: Sepolia Testnet (ChainID: 11155111)

---

## 🛠️ Setup & Running Locally

### Prerequisites

- Node.js 16+ installed
- MetaMask wallet extension
- Sepolia testnet ETH (for gas fees)

### Installation

```bash
# Clone or navigate to the project directory
cd QF_project/frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Environment Setup

Create a `.env.local` file in the `frontend` directory:

```
VITE_CONTRACT_ADDRESS=0xDc24F48FB96407139ffe5076Ce4178D1D9663FEB
VITE_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_API_KEY
```

Replace `YOUR_INFURA_API_KEY` with your actual Infura API key from https://infura.io

---

## 📱 How to Use

### 1. Connect Wallet

1. Click "↓ Connect Wallet to Start" on the landing page
2. MetaMask will prompt you to:
   - Select an account
   - Switch to Sepolia network (auto-switched if not on it)
3. Approve the connection

### 2. Navigate Dashboard

Once connected, you'll see:

- **Total Supply Card** - Token info and your role
- **Whitelisted Wallets** - List of approved addresses
- **Token Operations** - Mint, Burn, Transfer forms
- **Recent Transactions** - Successful transaction history
- **Blocked Transactions** - Failed transactions with reasons
- **Distribution** - Token holdings across all whitelisted addresses

### 3. Perform Operations

#### As Owner
- **Mint**: Create new tokens for whitelisted addresses
- **Add to Whitelist**: Authorize new addresses to receive tokens
- **Burn**: Destroy tokens from your wallet
- **Transfer**: Send tokens to whitelisted addresses

#### As Investor
- **Burn**: Destroy your own tokens
- **Transfer**: Send tokens to whitelisted addresses only
- (Mint and whitelist functions are disabled)

### 4. Testing Non-Owner Access

To test investor role:

1. Create a new MetaMask account (or use a different address)
2. Make sure it has some Sepolia ETH for gas fees
3. Connect with that account
4. Notice the "👤 Investor" role badge
5. Observe that Mint and Add to Whitelist are disabled

---

## 🔐 Security & Design

### Whitelist Restrictions
- Non-whitelisted recipients **cannot receive tokens** via Mint or Transfer
- Failed attempts are logged as "Blocked Transactions"
- Only Owner can manage the whitelist

### Gas Efficiency
- Enumerable whitelist for efficient distribution tracking
- Batch operations where possible
- Optimized contract storage layout

### Frontend Security
- No private keys stored in browser
- All transactions signed by MetaMask
- Environment variables for sensitive data
- No hardcoded credentials

---

## 📊 Smart Contract Architecture

### Token Contract (`Token.sol`)

**Key Functions:**
- `mint(address to, uint256 amount)` - Create new tokens
- `burn(uint256 amount)` - Destroy own tokens
- `burnFrom(address from, uint256 amount)` - Burn with allowance
- `setWhitelisted(address addr, bool status)` - Manage whitelist
- `transfer(address to, uint256 amount)` - Send tokens
- `transferFrom(address from, address to, uint256 amount)` - Delegated transfer

**Whitelist Functions:**
- `getWhitelisted()` - Get all whitelisted addresses
- `getWhitelistedAt(uint256 index)` - Get address by index
- `getWhitelistedCount()` - Get total count
- `isWhitelisted(address addr)` - Check if address is whitelisted

---

## 📈 Testing

The smart contract has been thoroughly tested with 34 test cases covering:

- Ownership transfer and restrictions
- Whitelist management and enumeration
- Mint functionality with approvals
- Burn operations and balance checks
- Transfer restrictions and blocking
- Allowance-based operations
- Event emissions

**Test Results**: ✅ All 34 tests passing

Run tests:
```bash
cd smartcontract
npm test
```

---

## 📝 Project Structure

```
QF_project/
├── smartcontract/
│   ├── contracts/
│   │   └── Token.sol          # Main ERC-20 contract
│   ├── test/
│   │   └── Token.js           # Test suite (34 tests)
│   ├── scripts/
│   │   └── deploy.js          # Deployment script
│   ├── hardhat.config.js
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Landing.vue     # Landing/home page
    │   │   ├── Card.vue        # Reusable card component
    │   │   └── PriceChart.vue  # (Optional price chart)
    │   ├── App.vue             # Main dashboard
    │   └── main.js
    ├── .env.local              # Environment variables (local only)
    ├── vite.config.js
    ├── index.html
    └── package.json
```

---

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. Push code to GitHub
2. Go to vercel.com
3. Import your GitHub repository
4. Add environment variables:
   - `VITE_CONTRACT_ADDRESS`
   - `VITE_RPC_URL`
5. Click Deploy
6. Get your live URL!

### Deploy Smart Contract

Smart contract is already deployed on Sepolia:
```
Address: 0xDc24F48FB96407139ffe5076Ce4178D1D9663FEB
```

To redeploy (not recommended during demo):
```bash
cd smartcontract
npm run deploy:sepolia
```

---

## 🎓 Educational Value

This project demonstrates:

✅ ERC-20 token standard and extensions
✅ Smart contract authorization patterns
✅ Web3 wallet integration (MetaMask)
✅ React/Vue framework integration with blockchain
✅ Real-world asset tokenization concept
✅ Role-based access control
✅ Transaction tracking and UI updates

---

## ⚠️ Important Notes

- **Testnet Only**: This is a demo on Sepolia testnet. Not for production use.
- **Gas Fees**: Small Sepolia ETH amounts required for gas fees
- **MetaMask Required**: Users need MetaMask wallet installed
- **Sepolia Network**: Ensure MetaMask is set to Sepolia testnet

---

## 🔗 Useful Links

- **Contract on Sepolia Etherscan**: https://sepolia.etherscan.io/address/0xDc24F48FB96407139ffe5076Ce4178D1D9663FEB
- **Get Sepolia ETH**: https://sepoliafaucet.com
- **Infura**: https://infura.io
- **MetaMask**: https://metamask.io

---

## 📞 Support & Questions

For questions about this project, refer to:
- Smart contract code and comments in `Token.sol`
- Test cases in `test/Token.js` for usage examples
- Frontend components for UI implementation details

---

## 📄 License

This project is created for educational purposes as part of QF5208 coursework.

---

**Last Updated**: April 9, 2026
**Status**: ✅ Ready for Demo (April 11, 2026)
