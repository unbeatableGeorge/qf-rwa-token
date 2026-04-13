<template>
  <!-- Landing Page -->
  <Landing v-if="!isConnected" :onConnect="handleLandingConnect" />

  <!-- Dashboard -->
  <div v-else id="app" class="app-container">
    <header class="app-header">
      <h1 class="logo-link" @click="goToLanding" title="Back to Home">
        ⛓️ AQT Token
      </h1>
      <div class="wallet-section">
        <button 
          v-if="!isConnected" 
          @click="connectWallet"
          class="btn btn-primary"
        >
          Connect Wallet
        </button>
        <div v-else class="wallet-info">
          <span class="address">{{ formatAddress(currentAccount) }}</span>
          <span class="role" :class="{ owner: isOwner, investor: !isOwner }">
            {{ isOwner ? '👑 Owner' : '👤 Investor' }}
          </span>
          <span class="chain" :class="{ error: !onCorrectChain }">
            {{ chainName }}
          </span>
        </div>
      </div>
    </header>

    <main class="app-main">
      <section class="dashboard">
        <!-- Total Supply Card -->
        <card class="card-total-supply">
          <h2>{{ tokenName }}</h2>
          <div class="value">{{ totalSupply }} {{ tokenSymbol }}</div>
          <div class="meta">Symbol: {{ tokenSymbol }} | Decimals: {{ tokenDecimals }}</div>
          
          <div class="token-info">
            <div class="info-item">
              <span class="label">Your Role</span>
              <span class="info-value">{{ isOwner ? '👑 Owner' : '👤 Investor' }}</span>
            </div>
            <div class="info-item">
              <span class="label">Network</span>
              <span class="info-value">{{ chainName }}</span>
            </div>
            <div class="info-item">
              <span class="label">Contract</span>
              <span class="info-value mono">{{ formatAddress(contractAddress) }}</span>
            </div>
          </div>
        </card>

        <!-- Whitelisted Wallets -->
        <card class="card-whitelisted">
          <h3>Whitelisted Wallets</h3>
          <div class="list">
            <div v-for="addr in whitelistedAddresses" :key="addr" class="list-item">
              {{ formatAddress(addr) }}
            </div>
            <div v-if="whitelistedAddresses.length === 0" class="empty">
              No whitelisted addresses yet
            </div>
          </div>
          <div class="action" :class="{ disabled: !isOwner }">
            <input 
              v-model="newWhitelistAddr" 
              placeholder="Address to whitelist"
              class="input"
              :disabled="isLoading || !isOwner"
            />
            <button @click="addToWhitelist" class="btn btn-small" :disabled="isLoading || !isOwner">
              {{ isLoading ? '⏳ Loading...' : 'Add' }}
            </button>
            <p v-if="!isOwner" class="permission-notice">
              ℹ️ Only the contract owner can add addresses to whitelist
            </p>
          </div>
        </card>

        <!-- Token Operations -->
        <card v-if="isConnected" class="card-operations">
          <h3>Token Operations</h3>
          
          <!-- Mint (owner only) -->
          <div class="operation" :class="{ disabled: !isOwner }">
            <h4>Mint {{ !isOwner ? '👑 (Owner Only)' : '' }}</h4>
            <input 
              v-model="mintTo" 
              placeholder="Recipient address"
              class="input"
              :disabled="isLoading || !isOwner"
            />
            <input 
              v-model="mintAmount" 
              placeholder="Amount"
              type="number"
              class="input"
              :disabled="isLoading || !isOwner"
            />
            <button @click="executeMint" class="btn btn-small" :disabled="isLoading || !isOwner">
              {{ isLoading ? '⏳ Loading...' : 'Mint' }}
            </button>
            <p v-if="!isOwner" class="permission-notice">
              ℹ️ Only the contract owner can mint new tokens
            </p>
          </div>

          <!-- Redeem (any holder) -->
          <div class="operation">
            <h4>Request Redemption</h4>
            <input 
              v-model="redeemAmount" 
              placeholder="Amount to redeem"
              type="number"
              class="input"
              :disabled="isLoading"
            />
            <button @click="executeRedeem" class="btn btn-small" :disabled="isLoading">
              {{ isLoading ? '⏳ Loading...' : 'Initiate Redemption' }}
            </button>
            <p class="info-text">Submit your tokens for redemption. Owner will process after verifying off-chain asset transfer.</p>
          </div>

          <!-- Transfer -->
          <div class="operation">
            <h4>Transfer</h4>
            <input 
              v-model="transferTo" 
              placeholder="Recipient address"
              class="input"
              :disabled="isLoading"
            />
            <input 
              v-model="transferAmount" 
              placeholder="Amount"
              type="number"
              class="input"
              :disabled="isLoading"
            />
            <button @click="executeTransfer" class="btn btn-small" :disabled="isLoading">
              {{ isLoading ? '⏳ Loading...' : 'Transfer' }}
            </button>
          </div>
        </card>

        <!-- Transfer Ownership (Owner Only) -->
        <card v-if="isOwner" class="card-transfer-ownership">
          <h3>👑 Transfer Ownership</h3>
          <p class="warning-text">⚠️ This action is irreversible. The new owner will have full control over the contract.</p>
          <input 
            v-model="newOwnerAddr" 
            placeholder="New owner address (0x...)"
            class="input"
            :disabled="isLoading"
          />
          <button @click="executeTransferOwnership" class="btn btn-danger" :disabled="isLoading || !newOwnerAddr">
            {{ isLoading ? '⏳ Processing...' : 'Confirm Transfer Ownership' }}
          </button>
          <p v-if="newOwnerAddr" class="preview-text">
            New owner: {{ formatAddress(newOwnerAddr) }}
          </p>
        </card>

        <!-- Pending Redemptions (Owner only) -->
        <card class="card-pending-redemptions" v-if="isOwner">
          <h3>⏳ Pending Redemptions</h3>
          <p class="info-text">Users who have requested redemption. Approve after confirming off-chain asset transfer.</p>
          <div class="list">
            <div v-for="(redemption, idx) in pendingRedemptions" :key="idx" class="redemption-item">
              <div class="redemption-info">
                <span class="user">{{ formatAddress(redemption.user) }}</span>
                <span class="amount">{{ redemption.amount }} {{ tokenSymbol }}</span>
              </div>
              <button @click="executeApproveRedemption(redemption.user, redemption.amount)" class="btn btn-small btn-approve" :disabled="isLoading">
                {{ isLoading ? '⏳' : '✓ Approve' }}
              </button>
            </div>
            <div v-if="pendingRedemptions.length === 0" class="empty">
              No pending redemptions
            </div>
          </div>
        </card>

        <!-- Transactions -->
        <card class="card-transactions">
          <h3>Recent Transactions</h3>
          <div class="list">
            <div v-for="(tx, idx) in recentTransactions" :key="idx" class="tx-item">
              <span class="type">{{ tx.type }}</span>
              <span class="hash">{{ tx.hash ? formatAddress(tx.hash) : 'Pending...' }}</span>
              <span class="status" :class="tx.status">{{ tx.status }}</span>
            </div>
            <div v-if="recentTransactions.length === 0" class="empty">
              No transactions yet
            </div>
          </div>
        </card>

        <!-- Blocked Transactions -->
        <card class="card-blocked">
          <h3>Blocked Transactions</h3>
          <div class="list">
            <div v-for="(blocked, idx) in blockedTransactions" :key="idx" class="blocked-item">
              <span class="from">{{ formatAddress(blocked.from) }}</span>
              <span class="arrow">→</span>
              <span class="to">{{ formatAddress(blocked.to) }}</span>
              <span class="reason">{{ blocked.reason }}</span>
            </div>
            <div v-if="blockedTransactions.length === 0" class="empty">
              No blocked transactions
            </div>
          </div>
        </card>

        <!-- Distribution -->
        <card class="card-distribution">
          <h3>Distribution Across Wallets</h3>
          <table class="distribution-table">
            <thead>
              <tr>
                <th>Address</th>
                <th>Balance</th>
                <th>Percentage</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="dist in distribution" :key="dist.address">
                <td>{{ formatAddress(dist.address) }}</td>
                <td>{{ dist.balance }} {{ tokenSymbol }}</td>
                <td>{{ dist.percentage }}%</td>
              </tr>
            </tbody>
          </table>
        </card>
      </section>
    </main>

    <footer class="app-footer">
      <p>Demo contract: {{ contractAddress }}</p>
    </footer>
  </div>
  <!-- End Dashboard -->
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ethers } from 'ethers'
import Card from './components/Card.vue'
import Landing from './components/Landing.vue'

// Configuration
const CONFIG = {
  SEPOLIA_CHAIN_ID: 11155111,
  CONTRACT_ADDRESS: import.meta.env.VITE_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000',
  RPC_URL: import.meta.env.VITE_RPC_URL || 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY'
}

// State
const isConnected = ref(false)
const currentAccount = ref(null)
const currentChainId = ref(null)

// Non-reactive ethers instances (shouldn't be refs - breaks internal access)
let provider = null
let signer = null
let contract = null

const totalSupply = ref('0')
const tokenName = ref('AI-Quant ETF Token')
const tokenSymbol = ref('AQT')
const tokenDecimals = ref(18)
const isOwner = ref(false)

const whitelistedAddresses = ref([])
const newWhitelistAddr = ref('')
const recentTransactions = ref([])
const blockedTransactions = ref([])
const distribution = ref([])
const pendingRedemptions = ref([])
const isLoading = ref(false)

// Form inputs
const mintTo = ref('')
const mintAmount = ref('')
const redeemAmount = ref('')
const transferTo = ref('')
const transferAmount = ref('')
const newOwnerAddr = ref('')

// Computed properties
const onCorrectChain = computed(() => currentChainId.value === CONFIG.SEPOLIA_CHAIN_ID)
const chainName = computed(() => {
  if (!currentChainId.value) return 'Not Connected'
  if (currentChainId.value === CONFIG.SEPOLIA_CHAIN_ID) return 'Sepolia'
  if (currentChainId.value === 31337) return 'Hardhat Local'
  return `Chain ${currentChainId.value}`
})

const contractAddress = computed(() => CONFIG.CONTRACT_ADDRESS)

// Complete Contract ABI
const CONTRACT_ABI = [
  {'inputs': [], 'stateMutability': 'nonpayable', 'type': 'constructor'},
  {'inputs': [{'internalType': 'address', 'name': '_owner', 'type': 'address'}, {'internalType': 'address', 'name': 'spender', 'type': 'address'}], 'name': 'allowance', 'outputs': [{'internalType': 'uint256', 'name': '', 'type': 'uint256'}], 'stateMutability': 'view', 'type': 'function'},
  {'inputs': [{'internalType': 'address', 'name': 'spender', 'type': 'address'}, {'internalType': 'uint256', 'name': 'amount', 'type': 'uint256'}], 'name': 'approve', 'outputs': [{'internalType': 'bool', 'name': '', 'type': 'bool'}], 'stateMutability': 'nonpayable', 'type': 'function'},
  {'inputs': [{'internalType': 'address', 'name': 'account', 'type': 'address'}], 'name': 'balanceOf', 'outputs': [{'internalType': 'uint256', 'name': '', 'type': 'uint256'}], 'stateMutability': 'view', 'type': 'function'},
  {'inputs': [{'internalType': 'uint256', 'name': 'amount', 'type': 'uint256'}], 'name': 'burn', 'outputs': [{'internalType': 'bool', 'name': '', 'type': 'bool'}], 'stateMutability': 'nonpayable', 'type': 'function'},
  {'inputs': [{'internalType': 'address', 'name': 'from', 'type': 'address'}, {'internalType': 'uint256', 'name': 'amount', 'type': 'uint256'}], 'name': 'burnFrom', 'outputs': [{'internalType': 'bool', 'name': '', 'type': 'bool'}], 'stateMutability': 'nonpayable', 'type': 'function'},
  {'inputs': [], 'name': 'decimals', 'outputs': [{'internalType': 'uint8', 'name': '', 'type': 'uint8'}], 'stateMutability': 'view', 'type': 'function'},
  {'inputs': [], 'name': 'getWhitelisted', 'outputs': [{'internalType': 'address[]', 'name': '', 'type': 'address[]'}], 'stateMutability': 'view', 'type': 'function'},
  {'inputs': [{'internalType': 'uint256', 'name': 'index', 'type': 'uint256'}], 'name': 'getWhitelistedAt', 'outputs': [{'internalType': 'address', 'name': '', 'type': 'address'}], 'stateMutability': 'view', 'type': 'function'},
  {'inputs': [], 'name': 'getWhitelistedCount', 'outputs': [{'internalType': 'uint256', 'name': '', 'type': 'uint256'}], 'stateMutability': 'view', 'type': 'function'},
  {'inputs': [{'internalType': 'address', 'name': 'addr', 'type': 'address'}], 'name': 'isWhitelisted', 'outputs': [{'internalType': 'bool', 'name': '', 'type': 'bool'}], 'stateMutability': 'view', 'type': 'function'},
  {'inputs': [{'internalType': 'address', 'name': 'to', 'type': 'address'}, {'internalType': 'uint256', 'name': 'amount', 'type': 'uint256'}], 'name': 'mint', 'outputs': [], 'stateMutability': 'nonpayable', 'type': 'function'},
  {'inputs': [], 'name': 'name', 'outputs': [{'internalType': 'string', 'name': '', 'type': 'string'}], 'stateMutability': 'view', 'type': 'function'},
  {'inputs': [], 'name': 'owner', 'outputs': [{'internalType': 'address', 'name': '', 'type': 'address'}], 'stateMutability': 'view', 'type': 'function'},
  {'inputs': [{'internalType': 'address', 'name': 'addr', 'type': 'address'}, {'internalType': 'bool', 'name': 'status', 'type': 'bool'}], 'name': 'setWhitelisted', 'outputs': [], 'stateMutability': 'nonpayable', 'type': 'function'},
  {'inputs': [], 'name': 'symbol', 'outputs': [{'internalType': 'string', 'name': '', 'type': 'string'}], 'stateMutability': 'view', 'type': 'function'},
  {'inputs': [], 'name': 'totalSupply', 'outputs': [{'internalType': 'uint256', 'name': '', 'type': 'uint256'}], 'stateMutability': 'view', 'type': 'function'},
  {'inputs': [{'internalType': 'address', 'name': 'to', 'type': 'address'}, {'internalType': 'uint256', 'name': 'amount', 'type': 'uint256'}], 'name': 'transfer', 'outputs': [{'internalType': 'bool', 'name': '', 'type': 'bool'}], 'stateMutability': 'nonpayable', 'type': 'function'},
  {'inputs': [{'internalType': 'address', 'name': 'from', 'type': 'address'}, {'internalType': 'address', 'name': 'to', 'type': 'address'}, {'internalType': 'uint256', 'name': 'amount', 'type': 'uint256'}], 'name': 'transferFrom', 'outputs': [{'internalType': 'bool', 'name': '', 'type': 'bool'}], 'stateMutability': 'nonpayable', 'type': 'function'},
  {'inputs': [{'internalType': 'address', 'name': 'newOwner', 'type': 'address'}], 'name': 'transferOwnership', 'outputs': [], 'stateMutability': 'nonpayable', 'type': 'function'},
  {'inputs': [{'internalType': 'uint256', 'name': 'amount', 'type': 'uint256'}], 'name': 'initiateRedemption', 'outputs': [{'internalType': 'bool', 'name': '', 'type': 'bool'}], 'stateMutability': 'nonpayable', 'type': 'function'},
  {'inputs': [{'internalType': 'address', 'name': 'user', 'type': 'address'}, {'internalType': 'uint256', 'name': 'amount', 'type': 'uint256'}], 'name': 'approveRedemption', 'outputs': [], 'stateMutability': 'nonpayable', 'type': 'function'},
  {'inputs': [{'internalType': 'address', 'name': 'user', 'type': 'address'}], 'name': 'getPendingRedemption', 'outputs': [{'internalType': 'uint256', 'name': '', 'type': 'uint256'}], 'stateMutability': 'view', 'type': 'function'},
  {'inputs': [{'internalType': 'address', 'name': 'user', 'type': 'address'}, {'internalType': 'uint256', 'name': 'amount', 'type': 'uint256'}], 'name': 'cancelRedemption', 'outputs': [], 'stateMutability': 'nonpayable', 'type': 'function'}
]

// Switch to Sepolia network
const switchToSepolia = async () => {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0xaa36a7' }] // Sepolia chainId in hex
    })
  } catch (switchError) {
    // 如果网络不存在，添加它
    if (switchError.code === 4902) {
      console.log('Sepolia not found, adding network...')
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: '0xaa36a7',
          chainName: 'Sepolia Testnet',
          rpcUrls: ['https://sepolia.infura.io/v3/'],
          nativeCurrency: {
            name: 'Sepolia ETH',
            symbol: 'ETH',
            decimals: 18
          },
          blockExplorerUrls: ['https://sepolia.etherscan.io']
        }]
      })
    } else {
      throw switchError
    }
  }
}

// Go back to Landing page
const goToLanding = () => {
  // Reset all state
  isConnected.value = false
  currentAccount.value = null
  currentChainId.value = null
  provider = null
  signer = null
  contract = null
  
  // Reset data
  totalSupply.value = '0'
  whitelistedAddresses.value = []
  recentTransactions.value = []
  blockedTransactions.value = []
  distribution.value = []
}

// Handle Landing Connect - from Landing component
const handleLandingConnect = async (account) => {
  await connectWallet()
}

// Methods
const connectWallet = async () => {
  try {
    console.log('🔗 Attempting wallet connection...')
    if (!window.ethereum) {
      alert('MetaMask not installed')
      return
    }

    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts'
    })

    // 检查网络，如果不是Sepolia就尝试切换
    let network = await window.ethereum.request({
      method: 'eth_chainId'
    })
    const chainId = parseInt(network, 16)
    
    if (chainId !== CONFIG.SEPOLIA_CHAIN_ID) {
      console.log('🔄 Switching to Sepolia...')
      await switchToSepolia()
      // 切换后重新初始化provider
    }

    provider = new ethers.BrowserProvider(window.ethereum)
    signer = await provider.getSigner()
    currentAccount.value = accounts[0]

    const blockchainNetwork = await provider.getNetwork()
    currentChainId.value = Number(blockchainNetwork.chainId)

    console.log('✅ Connected | Chain:', blockchainNetwork.name, '| ID:', currentChainId.value)

    if (currentChainId.value !== CONFIG.SEPOLIA_CHAIN_ID) {
      alert(`Wrong network! Please switch to Sepolia manually.`)
      return
    }

    contract = new ethers.Contract(CONFIG.CONTRACT_ADDRESS, CONTRACT_ABI, signer)
    isConnected.value = true
    await loadContractData()
  } catch (error) {
    console.error('Error connecting wallet:', error)
    alert('Failed to connect wallet: ' + error.message)
  }
}

const loadContractData = async () => {
  isLoading.value = true
  try {
    const [name, symbol, decimals, supply, owner, whitelist] = await Promise.all([
      contract.name(),
      contract.symbol(),
      contract.decimals(),
      contract.totalSupply(),
      contract.owner(),
      contract.getWhitelisted()
    ])

    tokenName.value = name
    tokenSymbol.value = symbol
    tokenDecimals.value = decimals
    totalSupply.value = ethers.formatUnits(supply, decimals)
    isOwner.value = currentAccount.value?.toLowerCase() === owner.toLowerCase()
    whitelistedAddresses.value = whitelist

    // Load distribution and pending redemptions
    await Promise.all([
      loadDistribution(whitelist),
      loadPendingRedemptions(whitelist)
    ])
  } catch (error) {
    console.error('Error loading contract data:', error)
  } finally {
    isLoading.value = false
  }
}

const loadDistribution = async (addresses) => {
  try {
    if (!addresses || addresses.length === 0) {
      distribution.value = []
      return
    }

    const total = await contract.totalSupply()
    const distributions = []

    // Fetch all balances in parallel for faster loading
    const balances = await Promise.all(
      addresses.map(addr => contract.balanceOf(addr).catch(e => {
        console.error(`Error fetching balance for ${addr}:`, e)
        return 0n
      }))
    )

    // Build distribution array
    for (let i = 0; i < addresses.length; i++) {
      const balance = balances[i]
      const percentage = total > 0 ? ((Number(balance) / Number(total)) * 100).toFixed(2) : 0
      distributions.push({
        address: addresses[i],
        balance: ethers.formatUnits(balance, tokenDecimals.value),
        percentage
      })
    }

    distribution.value = distributions
  } catch (error) {
    console.error('Error loading distribution:', error)
  }
}

const loadPendingRedemptions = async (addresses) => {
  try {
    if (!addresses || addresses.length === 0 || !isOwner.value) {
      pendingRedemptions.value = []
      return
    }

    const pending = []
    
    // Fetch all pending redemptions in parallel
    const redemptionAmounts = await Promise.all(
      addresses.map(addr => contract.getPendingRedemption(addr).catch(e => {
        console.error(`Error fetching pending redemption for ${addr}:`, e)
        return 0n
      }))
    )

    // Build pending redemptions array (only show those with pending amount > 0)
    for (let i = 0; i < addresses.length; i++) {
      const amount = redemptionAmounts[i]
      if (amount > 0n) {
        pending.push({
          user: addresses[i],
          amount: ethers.formatUnits(amount, tokenDecimals.value)
        })
      }
    }

    pendingRedemptions.value = pending
  } catch (error) {
    console.error('Error loading pending redemptions:', error)
  }
}

const addToWhitelist = async () => {
  if (!newWhitelistAddr.value) {
    alert('Enter an address')
    return
  }

  isLoading.value = true
  try {
    const tx = await contract.setWhitelisted(newWhitelistAddr.value, true)
    recordTransaction('Whitelist Added', tx.hash)
    await tx.wait()
    newWhitelistAddr.value = ''
    await loadContractData()
  } catch (error) {
    recordBlockedTransaction(currentAccount.value, newWhitelistAddr.value, error.message)
    console.error('Error adding to whitelist:', error)
  } finally {
    isLoading.value = false
  }
}

const executeMint = async () => {
  if (!mintTo.value || !mintAmount.value) return

  isLoading.value = true
  try {
    const amount = ethers.parseUnits(String(mintAmount.value), Number(tokenDecimals.value))
    const tx = await contract.mint(mintTo.value, amount)
    recordTransaction('Mint', tx.hash)
    await tx.wait()
    mintTo.value = ''
    mintAmount.value = ''
    await loadContractData()
  } catch (error) {
    recordBlockedTransaction(currentAccount.value, mintTo.value, error.message)
    console.error('Error minting:', error)
  } finally {
    isLoading.value = false
  }
}

const executeRedeem = async () => {
  if (!redeemAmount.value) return

  isLoading.value = true
  try {
    const amount = ethers.parseUnits(String(redeemAmount.value), Number(tokenDecimals.value))
    const tx = await contract.initiateRedemption(amount)
    recordTransaction('Initiate Redemption', tx.hash)
    await tx.wait()
    redeemAmount.value = ''
    await loadContractData()
  } catch (error) {
    recordBlockedTransaction(currentAccount.value, ethers.ZeroAddress, error.message)
    console.error('Error initiating redemption:', error)
  } finally {
    isLoading.value = false
  }
}

const executeApproveRedemption = async (user, amount) => {
  isLoading.value = true
  try {
    const amountBigInt = ethers.parseUnits(String(amount), Number(tokenDecimals.value))
    const tx = await contract.approveRedemption(user, amountBigInt)
    recordTransaction('Approve Redemption', tx.hash)
    await tx.wait()
    await loadContractData()
  } catch (error) {
    recordBlockedTransaction(currentAccount.value, user, error.message)
    console.error('Error approving redemption:', error)
  } finally {
    isLoading.value = false
  }
}

const executeTransfer = async () => {
  if (!transferTo.value || !transferAmount.value) return

  isLoading.value = true
  try {
    const amount = ethers.parseUnits(String(transferAmount.value), Number(tokenDecimals.value))
    const tx = await contract.transfer(transferTo.value, amount)
    recordTransaction('Transfer', tx.hash)
    await tx.wait()
    transferTo.value = ''
    transferAmount.value = ''
    await loadContractData()
  } catch (error) {
    recordBlockedTransaction(currentAccount.value, transferTo.value, error.message)
    console.error('Error transferring:', error)
  } finally {
    isLoading.value = false
  }
}

const executeTransferOwnership = async () => {
  if (!newOwnerAddr.value) return

  // Validate address format
  if (!ethers.isAddress(newOwnerAddr.value)) {
    alert('Invalid Ethereum address')
    return
  }

  const confirmed = confirm(
    `⚠️ WARNING: You are about to transfer ownership to ${newOwnerAddr.value}.\n\nThis action is IRREVERSIBLE. Proceed?`
  )

  if (!confirmed) return

  isLoading.value = true
  try {
    console.log('🔄 Transferring ownership to:', newOwnerAddr.value)
    const tx = await contract.transferOwnership(newOwnerAddr.value)
    recordTransaction('Transfer Ownership', tx.hash)
    await tx.wait()
    console.log('✅ Ownership transferred successfully')
    alert('✅ Ownership transferred successfully!')
    newOwnerAddr.value = ''
    await loadContractData()
  } catch (error) {
    console.error('Error transferring ownership:', error)
    alert('Failed to transfer ownership: ' + error.message)
  } finally {
    isLoading.value = false
  }
}

const recordTransaction = (type, hash) => {
  recentTransactions.value.unshift({
    type,
    hash,
    status: 'confirmed'
  })
  if (recentTransactions.value.length > 10) {
    recentTransactions.value.pop()
  }
}

const recordBlockedTransaction = (from, to, reason) => {
  blockedTransactions.value.unshift({
    from,
    to,
    reason: reason.split('(')[0].trim()
  })
  if (blockedTransactions.value.length > 5) {
    blockedTransactions.value.pop()
  }
}

const formatAddress = (addr) => {
  if (!addr) return 'N/A'
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

onMounted(() => {
  // Listen for account changes
  if (window.ethereum) {
    window.ethereum.on('accountsChanged', (accounts) => {
      if (accounts.length === 0) {
        isConnected.value = false
        currentAccount.value = null
      } else {
        currentAccount.value = accounts[0]
      }
    })

    window.ethereum.on('chainChanged', () => {
      window.location.reload()
    })
  }
})
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  color: #333;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

.app-header {
  background: white;
  padding: 20px 40px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.app-header h1 {
  margin: 0;
  font-size: 28px;
  color: #667eea;
}

.app-header h1.logo-link {
  cursor: pointer;
  transition: all 0.3s;
  user-select: none;
}

.app-header h1.logo-link:hover {
  color: #764ba2;
  transform: scale(1.05);
}

.wallet-section {
  display: flex;
  gap: 10px;
}

.wallet-info {
  display: flex;
  gap: 15px;
  align-items: center;
  background: #f5f5f5;
  padding: 10px 20px;
  border-radius: 8px;
}

.address {
  font-weight: 600;
}

.chain {
  padding: 4px 12px;
  background: #e8f4f8;
  border-radius: 4px;
  font-size: 12px;
  color: #0066cc;
}

.chain.error {
  background: #ffe8e8;
  color: #cc0000;
}

.role {
  padding: 4px 12px;
  background: #f0e6ff;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  color: #667eea;
}

.role.investor {
  background: #e6f4ff;
  color: #0066cc;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover {
  background: #5568d3;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-small {
  padding: 6px 12px;
  font-size: 12px;
  background: #667eea;
  color: white;
}

.btn-small:hover {
  background: #5568d3;
}

.btn-danger {
  background: #dc3545;
  color: white;
  padding: 10px 20px;
  width: 100%;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  margin-top: 10px;
  transition: all 0.3s;
}

.btn-danger:hover:not(:disabled) {
  background: #c82333;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.4);
}

.btn-danger:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.card-transfer-ownership {
  background: linear-gradient(135deg, #fff5e6 0%, #ffe8cc 100%);
  border-left: 4px solid #dc3545;
}

.warning-text {
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
  padding: 12px;
  border-radius: 4px;
  font-size: 12px;
  margin-bottom: 15px;
  line-height: 1.5;
}

.preview-text {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #ddd;
  font-size: 12px;
  color: #666;
  font-family: monospace;
  word-break: break-all;
}

.app-main {
  flex: 1;
  padding: 40px;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.dashboard {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
}

.card-total-supply {
  grid-column: span 1;
}

.value {
  font-size: 32px;
  font-weight: bold;
  color: #667eea;
  margin: 10px 0;
}

.meta {
  font-size: 12px;
  color: #999;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.token-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.info-item .label {
  font-size: 12px;
  color: #999;
  font-weight: 500;
}

.info-item .info-value {
  font-size: 13px;
  color: #333;
  font-weight: 600;
}

.info-item .info-value.mono {
  font-family: monospace;
  font-size: 11px;
}

.list {
  max-height: 200px;
  overflow-y: auto;
}

.list-item, .tx-item, .blocked-item {
  padding: 10px;
  background: #f9f9f9;
  margin: 5px 0;
  border-radius: 4px;
  font-size: 12px;
  font-family: monospace;
}

.empty {
  color: #999;
  text-align: center;
  padding: 20px;
}

.action {
  margin-top: 15px;
  display: flex;
  gap: 10px;
}

.input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 12px;
}

.input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.input:disabled {
  background-color: #f0f0f0;
  cursor: not-allowed;
  opacity: 0.6;
}

.operation {
  margin-bottom: 15px;
  padding: 10px;
  background: #f9f9f9;
  border-radius: 4px;
  position: relative;
}

.operation.disabled {
  opacity: 0.7;
}

.operation h4 {
  margin: 0 0 10px 0;
  font-size: 12px;
  color: #667eea;
}

.operation .input {
  display: block;
  width: 100%;
  margin-bottom: 8px;
}

.operation .btn-small {
  width: 100%;
}

.permission-notice {
  margin-top: 8px;
  padding: 8px;
  background: #e6f4ff;
  border-left: 3px solid #0066cc;
  border-radius: 4px;
  font-size: 12px;
  color: #0066cc;
  margin: 0;
}

.action {
  position: relative;
}

.action.disabled {
  opacity: 0.7;
}

.tx-item, .blocked-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.type, .status {
  flex-shrink: 0;
}

.status {
  padding: 2px 6px;
  background: #e8f4e8;
  color: #00aa00;
  font-size: 10px;
  border-radius: 3px;
}

.hash {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.blocked-item .arrow {
  flex-shrink: 0;
}

.blocked-item .reason {
  flex: 1;
  color: #cc0000;
  font-size: 10px;
}

.distribution-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

.distribution-table thead {
  background: #f5f5f5;
}

.distribution-table th, .distribution-table td {
  padding: 10px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.distribution-table th {
  font-weight: 600;
}

.info-text {
  margin: 12px 0;
  padding: 12px 14px;
  background: linear-gradient(135deg, #e6f7ff 0%, #f0f9ff 100%);
  border-left: 4px solid #0066cc;
  border-radius: 6px;
  font-size: 13px;
  color: #0050b3;
  line-height: 1.5;
  font-weight: 500;
  box-shadow: 0 2px 6px rgba(0, 102, 204, 0.08);
}

.app-footer {
  background: white;
  padding: 20px 40px;
  text-align: center;
  border-top: 1px solid #eee;
  font-size: 12px;
  color: #999;
}

@media (max-width: 768px) {
  .app-header {
    flex-direction: column;
    gap: 15px;
  }

  .app-main {
    padding: 20px;
  }

  .dashboard {
    grid-template-columns: 1fr;
  }
}
</style>
