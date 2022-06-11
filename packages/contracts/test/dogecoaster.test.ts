import chai, { expect } from "chai";
import { solidity } from "ethereum-waffle";
import { parseEther } from "ethers/lib/utils";
import { ethers } from "hardhat";

chai.use(solidity);

describe("Dogecoaster", async () => {
    const [owner, addr1] = await ethers.getSigners();

    const deployContracts = async () => {
        // https://hardhat.org/tutorial/testing-contracts.html#using-a-different-account
        const Weee = await ethers.getContractFactory("Weee", owner);
        const weee = await Weee.deploy("WEEE Arcade Token", "WEEE");
        await weee.deployed();

        const Dogecoaster = await ethers.getContractFactory("Dogecoaster", owner);
        const dogecoaster = await Dogecoaster.deploy(weee.address);
        await dogecoaster.deployed();

        const weeeMinterBurnerRole = await weee.MINTER_BURNER_ROLE();
        await weee.grantRole(weeeMinterBurnerRole, dogecoaster.address);

        return {
            weeeOwner: weee,
            weee: weee.connect(addr1),
            dogecoasterOwner: dogecoaster,
            dogecoaster: dogecoaster.connect(addr1),
        };
    };

    describe("board", () => {
        it("succeeds when called with purchased WEEE", async () => {
            const { dogecoaster, weee } = await deployContracts();
            const value = parseEther("1");
            const buyTx = await weee.buyWeee({ value });
            await buyTx.wait();
            const boardTx = await dogecoaster.board(value, 3, 0, {});
            await boardTx.wait();
        });

        it.only("emits a NewRide event", async () => {
            const { dogecoaster, weee } = await deployContracts();
            const value = parseEther("1");
            const buyTx = await weee.buyWeee({ value });
            await buyTx.wait();

            await expect(dogecoaster.board(value, 3, 0, {})).to.emit(dogecoaster, "NewRide");
        });
    });
});
