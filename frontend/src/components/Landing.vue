<template>
  <div class="landing-container">
    <!-- Navigation -->
    <nav class="navbar">
      <div class="nav-content">
        <div class="logo">
          <span class="logo-icon">⛓️</span>
          <span class="logo-text">RWA Token</span>
        </div>
        <div class="nav-links">
          <a href="#features">Features</a>
          <a href="#about">About</a>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <h1 class="hero-title">
          Real World Asset<br />Tokenization
        </h1>
        <p class="hero-subtitle">
          Secure, transparent, and compliant asset distribution on blockchain
        </p>
        <button @click="connectWallet" class="btn-hero" :disabled="isLoading">
          <span v-if="!isLoading">↓ Connect Wallet to Start</span>
          <span v-else>⏳ Connecting...</span>
        </button>
        <p class="hero-hint">Built on Sepolia Testnet • ERC-20 Standard</p>
      </div>

      <div class="hero-visual">
        <div class="floating-cube">
          <div class="cube-face front">RWA</div>
          <div class="cube-face back">RWAT</div>
          <div class="cube-face right">500K</div>
          <div class="cube-face left">100%</div>
          <div class="cube-face top">$</div>
          <div class="cube-face bottom">🔐</div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features" id="features">
      <h2>How It Works</h2>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">👤</div>
          <h3>Owner Control</h3>
          <p>Complete control over whitelist and token distribution with full transparency</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">✅</div>
          <h3>Whitelist Approval</h3>
          <p>Only approved addresses can receive and transfer assets securely</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🔄</div>
          <h3>Full Control</h3>
          <p>Mint new tokens, burn existing ones, and manage transfers seamlessly</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">📊</div>
          <h3>Transparency</h3>
          <p>Track all blocked transactions and view complete asset distribution</p>
        </div>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="stats">
      <div class="stat-item">
        <div class="stat-number">1M</div>
        <div class="stat-label">Total Supply</div>
      </div>
      <div class="stat-item">
        <div class="stat-number">∞</div>
        <div class="stat-label">Scalability</div>
      </div>
      <div class="stat-item">
        <div class="stat-number">100%</div>
        <div class="stat-label">Decentralized</div>
      </div>
      <div class="stat-item">
        <div class="stat-number">⛓️</div>
        <div class="stat-label">On-Chain</div>
      </div>
    </section>

    <!-- About Section -->
    <section class="about" id="about">
      <div class="about-content">
        <h2>About RWA Tokenization</h2>
        <p>
          Real World Asset (RWA) tokenization represents a paradigm shift in how we manage and transfer 
          ownership of physical assets. By converting rights to real-world assets into blockchain-based tokens, 
          we enable:
        </p>
        <ul class="about-list">
          <li>✓ Fractional ownership of high-value assets</li>
          <li>✓ Instant settlement and clearing</li>
          <li>✓ Enhanced liquidity and accessibility</li>
          <li>✓ Immutable audit trail and compliance records</li>
          <li>✓ Reduced counterparty risk</li>
        </ul>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta">
      <h2>Ready to Explore?</h2>
      <p>Connect your wallet to access the RWA Token dashboard</p>
      <button @click="connectWallet" class="btn-cta" :disabled="isLoading">
        {{ isLoading ? '⏳ Connecting...' : 'Launch Dashboard' }}
      </button>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <p>RWA Token Demo • Sepolia Testnet • Built with ❤️</p>
      <p class="footer-contract">Contract: {{ shortenAddress(contractAddress) }}</p>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ethers } from 'ethers'

const props = defineProps({
  onConnect: Function
})

const isLoading = ref(false)
const contractAddress = '0xDc24F48FB96407139ffe5076Ce4178D1D9663FEB'

const shortenAddress = (addr) => {
  if (!addr) return 'N/A'
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

const connectWallet = async () => {
  isLoading.value = true
  try {
    if (!window.ethereum) {
      alert('MetaMask not installed')
      return
    }

    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts'
    })

    // Trigger parent callback
    if (props.onConnect) {
      props.onConnect(accounts[0])
    }
  } catch (error) {
    console.error('Connection error:', error)
    alert('Failed to connect wallet')
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.landing-container {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  color: #333;
  overflow-x: hidden;
}

/* Navigation */
.navbar {
  position: fixed;
  top: 0;
  width: 100%;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  z-index: 1000;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
}

.nav-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 15px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 24px;
  font-weight: 700;
  color: #667eea;
}

.logo-icon {
  font-size: 28px;
}

.nav-links {
  display: flex;
  gap: 30px;
}

.nav-links a {
  text-decoration: none;
  color: #333;
  font-weight: 500;
  transition: color 0.3s;
}

.nav-links a:hover {
  color: #667eea;
}

/* Hero Section */
.hero {
  margin-top: 80px;
  padding: 100px 40px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
  max-width: 1400px;
  margin-left: auto;
  margin-right: auto;
}

.hero-content {
  color: white;
}

.hero-title {
  font-size: 56px;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 20px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.hero-subtitle {
  font-size: 18px;
  margin-bottom: 30px;
  opacity: 0.95;
  line-height: 1.6;
}

.btn-hero {
  background: white;
  color: #667eea;
  border: none;
  padding: 16px 40px;
  border-radius: 50px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.btn-hero:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
}

.btn-hero:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.hero-hint {
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
}

/* Hero Visual */
.hero-visual {
  display: flex;
  justify-content: center;
  align-items: center;
  perspective: 1000px;
}

.floating-cube {
  width: 200px;
  height: 200px;
  position: relative;
  transform-style: preserve-3d;
  animation: float 4s ease-in-out infinite;
}

.cube-face {
  position: absolute;
  width: 200px;
  height: 200px;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: 700;
  color: white;
  border-radius: 20px;
}

.cube-face.front {
  transform: rotateY(0deg) translateZ(100px);
}

.cube-face.back {
  transform: rotateY(180deg) translateZ(100px);
}

.cube-face.right {
  transform: rotateY(90deg) translateZ(100px);
}

.cube-face.left {
  transform: rotateY(-90deg) translateZ(100px);
}

.cube-face.top {
  transform: rotateX(90deg) translateZ(100px);
}

.cube-face.bottom {
  transform: rotateX(-90deg) translateZ(100px);
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotateX(0deg) rotateY(0deg) rotateZ(0deg);
  }
  25% {
    transform: translateY(-20px) rotateX(10deg) rotateY(10deg) rotateZ(5deg);
  }
  50% {
    transform: translateY(-40px) rotateX(0deg) rotateY(20deg) rotateZ(0deg);
  }
  75% {
    transform: translateY(-20px) rotateX(-10deg) rotateY(10deg) rotateZ(-5deg);
  }
}

/* Features Section */
.features {
  background: white;
  padding: 80px 40px;
}

.features h2 {
  text-align: center;
  font-size: 42px;
  margin-bottom: 60px;
  color: #333;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto;
}

.feature-card {
  padding: 40px;
  background: linear-gradient(135deg, #f5f7fa 0%, #f0f3f8 100%);
  border-radius: 16px;
  text-align: center;
  transition: all 0.3s;
  border: 2px solid transparent;
}

.feature-card:hover {
  transform: translateY(-10px);
  border-color: #667eea;
  box-shadow: 0 20px 40px rgba(102, 126, 234, 0.15);
}

.feature-icon {
  font-size: 48px;
  margin-bottom: 20px;
}

.feature-card h3 {
  font-size: 20px;
  margin-bottom: 15px;
  color: #333;
}

.feature-card p {
  color: #666;
  line-height: 1.6;
  font-size: 14px;
}

/* Stats Section */
.stats {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60px 40px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 40px;
  max-width: 1200px;
  margin: 0 auto;
}

.stat-item {
  text-align: center;
  color: white;
}

.stat-number {
  font-size: 48px;
  font-weight: 800;
  margin-bottom: 10px;
}

.stat-label {
  font-size: 16px;
  opacity: 0.9;
}

/* About Section */
.about {
  background: white;
  padding: 80px 40px;
}

.about-content {
  max-width: 800px;
  margin: 0 auto;
}

.about h2 {
  font-size: 36px;
  margin-bottom: 30px;
  color: #333;
}

.about p {
  color: #666;
  line-height: 1.8;
  margin-bottom: 30px;
  font-size: 16px;
}

.about-list {
  list-style: none;
  padding: 0;
}

.about-list li {
  padding: 12px 0;
  font-size: 16px;
  color: #333;
  border-bottom: 1px solid #eee;
}

.about-list li:last-child {
  border-bottom: none;
}

/* CTA Section */
.cta {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 80px 40px;
  text-align: center;
}

.cta h2 {
  font-size: 42px;
  margin-bottom: 20px;
}

.cta p {
  font-size: 18px;
  margin-bottom: 40px;
  opacity: 0.95;
}

.btn-cta {
  background: white;
  color: #667eea;
  border: none;
  padding: 16px 50px;
  border-radius: 50px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.btn-cta:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
}

.btn-cta:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Footer */
.footer {
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 40px;
  text-align: center;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.footer p {
  margin: 5px 0;
  font-size: 14px;
}

.footer-contract {
  font-size: 12px;
  opacity: 0.7;
  font-family: monospace;
}

/* Responsive */
@media (max-width: 768px) {
  .hero {
    grid-template-columns: 1fr;
    padding: 60px 20px;
  }

  .hero-title {
    font-size: 36px;
  }

  .hero-subtitle {
    font-size: 16px;
  }

  .features h2 {
    font-size: 32px;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .nav-content {
    padding: 15px 20px;
  }

  .nav-links {
    gap: 15px;
    font-size: 14px;
  }
}
</style>
