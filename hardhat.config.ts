require("dotenv").config();
import type { HardhatUserConfig } from "hardhat/config";
import "@openzeppelin/hardhat-upgrades";
import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-ethers";
import "hardhat-contract-sizer";
import "hardhat-deploy";
import "hardhat-docgen";

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.20",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  networks: {
    hardhat: {
      forking: {
        url: `https://eth-mainnet.g.alchemy.com/v2/${process.env.MAINNET_ALCHEMY_KEY}`,
      },
    },
    main: {
      url: `https://eth-mainnet.g.alchemy.com/v2/${process.env.MAINNET_ALCHEMY_KEY}`,
      accounts: [process.env.PRIVATE_KEY as string],
    },
    arbitrum: {
      url: `https://arb-mainnet.g.alchemy.com/v2/${process.env.ARB_ALCHEMY_KEY}`,
      accounts: [process.env.PRIVATE_KEY as string],
    },
    optimism: {
      url: `https://opt-mainnet.g.alchemy.com/v2/${process.env.OP_ALCHEMY_KEY}`,
      accounts: [process.env.PRIVATE_KEY as string],
    },
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${process.env.SEPOLIA_ACLHEMY_KEY}`,
      accounts: [process.env.PRIVATE_KEY as string],
    },
    goerli: {
      url: `https://eth-goerli.g.alchemy.com/v2/${process.env.GOERLI_ACLHEMY_KEY}`,
      accounts: [process.env.PRIVATE_KEY as string],
    },
    polygon: {
      url: `https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_POLYGON_KEY}`,
      accounts: [process.env.PRIVATE_KEY as string],
    },
    base : {
      url: `https://base-mainnet.g.alchemy.com/v2/${process.env.BASE_ALCHEMY_KEY}`,
      accounts: [process.env.PRIVATE_KEY as string],
    },
    optimism_goerli: {
      url: `https://opt-goerli.g.alchemy.com/v2/${process.env.OP_GOERLIT_KEY}`,
      accounts: [process.env.PRIVATE_KEY as string],
    },
  },
  contractSizer: {
    runOnCompile: true,
  },
  etherscan: {
    apiKey: "",
    customChains: [
      {
        network: 'base',
        chainId: 8453,
        urls: {
          apiURL: 'https://api.basescan.org/api',
          browserURL: '	https://mainnet.base.org/',
        },
      },
    ],
  },
};

export default config;
