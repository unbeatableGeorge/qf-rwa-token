/** @type import('hardhat/config').HardhatUserConfig */
require("@nomicfoundation/hardhat-toolbox");
const { vars } = require("hardhat/config");

// Configuration variables - you'll set these via: npx hardhat vars set VAR_NAME
const INFURA_API_KEY = vars.get("INFURA_API_KEY", "");
const SEPOLIA_PRIVATE_KEY = vars.get("SEPOLIA_PRIVATE_KEY", "");

module.exports = {
  solidity: "0.8.28",
  networks: {
    sepolia: {
      url: `https://sepolia.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [SEPOLIA_PRIVATE_KEY],
    },
    hardhat: {
      // Local Hardhat network (default)
    },
  },
};
