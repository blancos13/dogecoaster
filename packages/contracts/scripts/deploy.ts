import fs from "fs-extra";
import { ethers, run } from "hardhat";
import path from "path";

async function main() {
    // Hardhat always runs the compile task when running scripts with its command
    // line interface.
    //
    // If this script is run directly using `node` you may want to call compile
    // manually to make sure everything is compiled
    await run("compile");

    const Weee = await ethers.getContractFactory("Weee");
    const weee = await Weee.deploy("Weee Arcade Token", "WEEE");
    await weee.deployed();
    console.log("Weee deployed to:", weee.address);

    const Dogecoaster = await ethers.getContractFactory("Dogecoaster");
    const dogecoaster = await Dogecoaster.deploy(weee.address);
    await dogecoaster.deployed();
    console.log("Dogecoaster deployed to:", dogecoaster.address);

    const weeeMinterBurnerRole = await weee.MINTER_BURNER_ROLE();
    const weeeGrantTx = await weee.grantRole(weeeMinterBurnerRole, dogecoaster.address);
    await weeeGrantTx.wait();

    const addresses = {
        weee: weee.address,
        dogecoaster: dogecoaster.address,
    };

    const addressesPath = path.resolve(__dirname, "..", "..", "site", "local-addresses.json");
    fs.writeJson(addressesPath, addresses);
    console.log("Contract addresses written to:", addressesPath);
}

main().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
