const Dogecoaster = artifacts.require("Dogecoaster");
const Weee = artifacts.require("Weee");
const ArcadeNFT = artifacts.require("ArcadeNFT");
const Test = artifacts.require("Test");
const BustaDoge = artifacts.require("BustaDoge");

module.exports = async function (deployer, network) {
    try {
        console.log("deploying onto " + network);

        // await deployer.deploy(Dogecoaster, '0x182392F6f9A60aF258CE6Bd2BAdA4c5F46c258D5');
        await deployer.deploy(BustaDoge, "0x182392F6f9A60aF258CE6Bd2BAdA4c5F46c258D5");
        // await deployer.deploy(ArcadeNFT, '0x182392F6f9A60aF258CE6Bd2BAdA4c5F46c258D5');
        // await deployer.deploy(Weee, 'Weee Arcade Token', 'WEEE');
        // await deployer.deploy(Test, 'Test Token', 'TEST');
        // await deployer.deploy(Test, 'Test Token', 'TEST');
    } catch (e) {
        console.log(`Error in migration: ${e.message}`);
    }
};
