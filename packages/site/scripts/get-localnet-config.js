const { existsSync, readJsonSync } = require("fs-extra");
const path = require("path");
const { exit } = require("process");

const capitalizeFirstLetter = string => {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

module.exports = () => {
    const addressesPath = path.resolve(__dirname, "..", "local-addresses.json");
    if (!existsSync(addressesPath)) {
        console.error(
            "Could not find local addresses file at",
            addressesPath,
            "localnet contracts will not be supported",
        );
        return undefined;
    }

    const addresses = readJsonSync(addressesPath);

    const contractArtifactsPath = path.resolve(__dirname, "..", "..", "contracts", "artifacts", "contracts");
    if (!existsSync(contractArtifactsPath)) {
        console.error("Could not find contract artifacts at", contractArtifactsPath);
        exit(1);
    }

    const contracts = Object.keys(addresses).reduce((config, contract) => {
        const address = addresses[contract];
        const contractCapitalized = capitalizeFirstLetter(contract);
        const jsonPath = path.resolve(
            contractArtifactsPath,
            `${contractCapitalized}.sol`,
            `${contractCapitalized}.json`,
        );
        if (!existsSync(jsonPath)) {
            console.error("Could not find contract JSON artifact at", jsonPath);
            exit(1);
        }

        const json = readJsonSync(jsonPath);
        config[contract] = {
            address,
            abi: json.abi,
        };

        return config;
    }, {});

    return { nodes: ["http://localhost:8545"], contracts };
};
