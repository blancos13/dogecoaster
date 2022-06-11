/**
 * More information about configuration can be found at:
 * trufflesuite.com/docs/advanced/configuration
 */

const Web3 = require("web3");
const HDWalletProvider = require("@truffle/hdwallet-provider");
const configDeployer = require("./configDeployer.js");
const config = require("./config.js");
const web3 = new Web3(); // this is just used for web3.utils.toWei, so provider doesn't matter

module.exports = {
    networks: {
        development: {
            host: "127.0.0.1", // Localhost (default: none)
            port: 8545, // Standard BSC port (default: none)
            network_id: "*", // Any network (default: none)
        },
        testnet: {
            provider: () =>
                new HDWalletProvider(configDeployer.owner.privateKey, "https://data-seed-prebsc-1-s1.binance.org:8545"),
            network_id: 97,
            confirmations: 10,
            timeoutBlocks: 200,
            gas: 4500000,
            gasPrice: web3.utils.toWei("5", "gwei"),
            skipDryRun: true,
        },
        smartdoge: {
            provider: () => new HDWalletProvider(configDeployer.owner.privateKey, config.provider.smartdoge.url_ws),
            network_id: 69420,
            confirmations: 10,
            timeoutBlocks: 200,
            gas: 4500000,
            gasPrice: web3.utils.toWei("69", "gwei"),
            skipDryRun: true,
        },
        // matic: {
        //   provider: () => new HDWalletProvider(configDeployer.maticOwner.privateKey, config.provider.matic.url_ws),
        //   network_id: 137,
        //   confirmations: 10,
        //   timeoutBlocks: 200,
        //   gas: 4500000,
        //   gasPrice: web3.utils.toWei('52', 'gwei'),
        //   skipDryRun: true
        // },
    },

    // Set default mocha options here, use special reporters etc.
    mocha: {
        // timeout: 100000
    },

    // Configure your compilers
    compilers: {
        solc: {
            version: "0.8.4",
        },
    },
};
