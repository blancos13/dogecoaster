const path = require("path");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const { DefinePlugin } = require("webpack");
const { readJsonSync, existsSync } = require("fs-extra");
const { exit } = require("process");
const getLocalnetConfig = require("./scripts/get-localnet-config");

module.exports = env => {
    const createDefineValues = () => {
        // Node addresses
        const configPath = path.resolve(__dirname, "network-config.json");
        if (!existsSync(configPath)) {
            console.error("Could not find config at", configPath);
            exit(1);
        }

        const config = {
            localnet: getLocalnetConfig(),
            ...readJsonSync(configPath),
        };

        const defineValues = {};
        outer: for (const network of Object.keys(config)) {
            const { nodes, contracts } = config[network];
            if (nodes == undefined || nodes.length === 0) {
                console.warn(`${network} will not be targetable: the network is not configured.`);
                continue;
            }

            const networkUpperCase = network.toUpperCase();
            for (const contract of Object.keys(contracts)) {
                const { address, abi } = contracts[contract];
                if (address == undefined) {
                    console.warn(`${network} will not be targetable: the ${contract} address is not configured.`);
                    continue outer;
                }

                if (abi == undefined) {
                    console.warn(`${network} will not be targetable: the ${contract} ABI is not configured.`);
                    continue outer;
                }

                const contractUpperCase = contract.toUpperCase();
                defineValues[`${networkUpperCase}_${contractUpperCase}_ADDRESS`] = JSON.stringify(address);
                defineValues[`${networkUpperCase}_${contractUpperCase}_ABI`] = JSON.stringify(abi);
            }

            // Nodes are the last thing defined for a network. In the client we can therefore assume that if nodes are specified,
            // so are all other configuration values.
            defineValues[`${networkUpperCase}_NODES`] = JSON.stringify(nodes);
        }

        return defineValues;
    }

    const mode = "development";
    const devtool = "inline-source-map";

    const baseConfig = {
        mode,
        devtool,
        resolve: {
            extensions: [".ts", ".tsx", ".js", ".scss"],
        },
        plugins: [new ForkTsCheckerWebpackPlugin(), new DefinePlugin(createDefineValues())],
        module: {
            rules: [
                // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
                { test: /\.tsx?$/, loader: "ts-loader" },
                {
                    test: /\.s[ac]ss$/i,
                    use: [
                        // Creates `style` nodes from JS strings
                        "style-loader",
                        // Translates CSS into CommonJS
                        "css-loader",
                        // Compiles Sass to CSS
                        {
                            loader: "sass-loader",
                            options: {
                                implementation: require("sass"),
                                sourceMap: true,
                            },
                        },
                    ],
                },
            ],
        },
    };

    const coasterWorkerConfig = {
        ...baseConfig,
        entry: path.resolve(__dirname, "src", "client", "coaster-worker", "index.ts"),
        output: {
            filename: "coaster-worker.js",
        },
    }

    const mainConfig = {
        ...baseConfig,
        entry: path.resolve(__dirname, "src", "client", "index.tsx"),
        output: {
            filename: "main.js",
        },
        devServer: {
            compress: true,
            open: true,
            port: 9000,
            static: [path.resolve(__dirname, "src/client"), path.resolve(__dirname, "dist"), path.resolve(__dirname)],
        },
    }

    switch (env.bundle) {
        case "coaster-worker":
            return coasterWorkerConfig;
        case "main":
        default:
            return mainConfig;
    }
}
