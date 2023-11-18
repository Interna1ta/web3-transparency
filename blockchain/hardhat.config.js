require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path: ".env" });

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;
const METAMASK_SEPOLIA_PRIVATE_KEY = process.env.METAMASK_SEPOLIA_PRIVATE_KEY;
const METAMASK_LOCALHOST_PRIVATE_KEY = process.env.METAMASK_LOCALHOST_PRIVATE_KEY;

module.exports = {
  defaultNetwork: "sepolia",
  solidity: "0.8.20",
  networks: {
    // localhost: {
    //   url: "http://127.0.0.1:8545",
    //   accounts: [METAMASK_LOCALHOST_PRIVATE_KEY]
    // },
    hardhat: {
      accounts: {
        accountsBalance: "10000000000000000000000"
      }
    },
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts: [METAMASK_SEPOLIA_PRIVATE_KEY]
    }
  }
};
