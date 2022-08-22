require("@nomiclabs/hardhat-waffle")
require("@nomiclabs/hardhat-etherscan")
require("hardhat-deploy")
require("hardhat-gas-reporter")
require("hardhat-contract-sizer")
require("solidity-coverage")
require("dotenv").config()

const Rinkeby_URL = process.env.Rinkeby_RPC_URL
const Goerly_URL = process.env.Goerly_RPC_URL
const PRIVATE_KEY = process.env.Private_KEY
const CMC_API_KEY = process.env.CMCAPI
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY
const Mainnet_Rpc_URL = process.env.Mainnet_Rpc_URL

module.exports = {
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            chainId: 31337,
            forking: {
              url: Mainnet_Rpc_URL,
            }
        },
        rinkeby: {
            chainId: 4,
            blockConfirmations: 3,
            url: Rinkeby_URL,
            accounts: [PRIVATE_KEY],
        },
        goerli: {
            chainId: 42,
            blockConfirmations: 3,
            url: Goerly_URL,
            accounts: [PRIVATE_KEY],
        },

    },
    gasReporter: {
        enabled: true,
        outputFile: "gas-report.txt",
        noColors: true,
        currency: "USD",
        coinmarketcap: CMC_API_KEY,
        token: "MATIC"
    },
    etherscan: {
        apiKey: process.env.ETHERSCAN_API_KEY,
    },
    solidity: {
      compilers: [{version: "0.8.9"}, {version: "0.4.19"}, {version: "0.6.12"}, {version: "0.8.0"}],
    },
    namedAccounts: {
        deployer: {
            default: 0,
        },
        player: {
            default: 1,
        },
    },
    mocha:{
        timeout: 1000000, // está en ms
    }
}
