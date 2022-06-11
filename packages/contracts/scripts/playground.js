const Web3 = require("web3");
const config = require("../config.js");
const ethers = require("ethers");
const dogecoasterAbi = require("../build/contracts/Dogecoaster.json").abi;
const weeeAbi = require("../build/contracts/Weee.json").abi;
const arcadeNFTAbi = require("../build/contracts/ArcadeNFT.json").abi;
const bustadogeAbi = require("../build/contracts/BustaDoge.json").abi;

// const wallet = Wallet.fromMnemonic('either fatigue visa nasty bonus deputy find pair december three warrior bar submit unknown umbrella pencil tomorrow staff ladder under sun boil panic web');
// // let mnemonicWallet = ethers.Wallet.fromMnemonic(mnemonic);
// console.log(wallet.privateKey);

// console.log(wallet);
const web3 = new Web3("ws://20.229.92.230:8546"); //config.provider.matic.url_ws);//

const address = config.account.address;
const privateKey = config.account.privateKey;

const addressOwner = config.owner.address;
const privateKeyOwner = config.owner.privateKey;

// const addressMaticOwner = config.maticOwner.address;
// const privateKeyMaticOwner = config.maticOwner.privateKey;

let acc = web3.eth.accounts.wallet.add(privateKey);
let acc2 = web3.eth.accounts.wallet.add(privateKeyOwner);
// let acc3 = web3.eth.accounts.wallet.add(privateKeyMaticOwner);

console.log(acc);

web3.eth
    .subscribe("newBlockHeaders", function (error, result) {})
    .on("connected", function (subscriptionId) {
        console.log("subscribed to new blocks");
        console.log(subscriptionId);
    })
    .on("data", function (blockHeader) {
        console.log("new block mined: " + blockHeader.number);
        console.log(Date.now());
        // console.log(blockHeader);

        getRandomNum(blockHeader.number - 1);
    })
    .on("error", function (error) {
        console.log("error subscribing new block headers");
        console.log(error);
        process.exit();
    });

const dogecoasterAddress = "0x8433FbaDf7FB96bac8589DB0EC433cB02425cE20";

let contractDogecoaster = new web3.eth.Contract(dogecoasterAbi, dogecoasterAddress);

const weeeAddress = "0x182392F6f9A60aF258CE6Bd2BAdA4c5F46c258D5"; //'0x182392F6f9A60aF258CE6Bd2BAdA4c5F46c258D5'; // test contract on matic: '0x99Bb8bEFbc579d4649eD2c20b524A0A4209cc05D'

let contractWeee = new web3.eth.Contract(weeeAbi, weeeAddress);

const arcadeNFTAddress = "0x4FB1a79FFA5d9e2A3c0e59D1F1897e1a20006bc6";

let contractArcadeNFT = new web3.eth.Contract(arcadeNFTAbi, arcadeNFTAddress);

const bustadogeAddress = "0x79c3C5BEc4747ac53d83B5919b018dfC7d5825B9";

let contractBustadoge = new web3.eth.Contract(bustadogeAbi, bustadogeAddress);

async function init() {
    // let acc2 = web3.eth.accounts.create();;
    // console.log(acc2);

    let bal = await web3.eth.getBalance(addressOwner);
    console.log(web3.utils.fromWei(bal));

    // let resp = await web3.eth.sendTransaction({from: addressOwner,to: address, value: web3.utils.toWei("100", "ether"), gas: '21000', gasPrice: web3.utils.toWei('69', 'gwei')})

    // let resp = await web3.eth.sendTransaction({from: address, to: addressOwner, value: web3.utils.toWei("100", "ether"), gas: '21000', gasPrice: web3.utils.toWei('69', 'gwei')})

    // console.log(resp);

    const hash = web3.utils.soliditySha3("MINTER_BURNER_ROLE");
    console.log("hash = " + hash);

    // let resp2 = await contractWeee.methods.grantRole(hash, arcadeNFTAddress)
    // .send({value: '0', from: addressOwner, gas: '1000000', gasPrice: web3.utils.toWei('52', 'gwei')});

    // console.log(resp2);

    // let resp3 = await contractWeee.methods.grantRole(hash, dogecoasterAddress)
    // .send({value: '0', from: addressOwner, gas: '4000000', gasPrice: web3.utils.toWei('69', 'gwei')});

    let resp3 = await contractWeee.methods
        .grantRole(hash, bustadogeAddress)
        .send({ value: "0", from: addressOwner, gas: "4000000", gasPrice: web3.utils.toWei("69", "gwei") });

    console.log(resp3);

    // let resp2 = await contractWeee.methods.grantRole(hash, arcadeNFTAddress)
    // .send({value: web3.utils.toWei('10'), from: addressOwner, gas: '4000000', gasPrice: web3.utils.toWei('69', 'gwei')});

    // let resp3 = await contractWeee.methods.grantRole(web3.utils.asciiToHex("MINTER_BURNER_ROLE"), dogecoasterAddress)
    // .send({value: web3.utils.toWei('10'), from: addressOwner, gas: '4000000', gasPrice: web3.utils.toWei('69', 'gwei')});

    // let resp4 = await contractWeee.methods.buyWeee()
    // .send({value: web3.utils.toWei('10'), from: address, gas: '4000000', gasPrice: web3.utils.toWei('69', 'gwei')});
}

async function board(amount, numBlocks, cashOutAt) {
    let weeeBal = await contractWeee.methods.balanceOf(address).call();
    console.log("Your WEEE balance is: " + web3.utils.fromWei(weeeBal));

    let resp = await contractDogecoaster.methods
        .board(web3.utils.toWei(amount.toString()), numBlocks, cashOutAt)
        .send({ from: address, gas: "4000000", gasPrice: web3.utils.toWei("69", "gwei") });

    console.log(resp);
    console.log(resp.events.NewRide);

    weeeBal = await contractWeee.methods.balanceOf(address).call();
    console.log("Boarded the Dogecoaster! Your new WEEE balance is: " + web3.utils.fromWei(weeeBal));
    console.log("Ride begins on block " + resp.events.NewRide.returnValues._fromBlock);
}

async function claim(withCashOut) {
    let weeeBal = await contractWeee.methods.balanceOf(address).call();
    console.log("Your WEEE balance is: " + web3.utils.fromWei(weeeBal));

    let resp;
    if (withCashOut) {
        resp = await contractDogecoaster.methods
            .claimWithCashOut()
            .send({ from: address, gas: "4000000", gasPrice: web3.utils.toWei("69", "gwei") });
    } else {
        resp = await contractDogecoaster.methods
            .claim()
            .send({ from: address, gas: "4000000", gasPrice: web3.utils.toWei("69", "gwei") });
    }

    console.log("gasUsed: " + resp.gasUsed);

    weeeBal = await contractWeee.methods.balanceOf(address).call();
    console.log(
        "Claimed your ride! Your new WEEE balance is: " +
            web3.utils.fromWei(weeeBal) +
            "\nPlease collect your on-ride photo for 5 WEEE on your way out",
    );

    // console.log(resp);
}

async function getRandomNum(blockNum) {
    let resp = await contractBustadoge.methods.getRandomNumber(blockNum).call();
    // console.log(resp);
    console.log("Random number for block " + blockNum + " = " + resp);
}

// init();
// board(1, 100, 2);
// claim(true);

/////////////////////////////

async function boardBustadoge(amount, multiplierNumerator) {
    let weeeBal = await contractWeee.methods.balanceOf(address).call();
    console.log("Your WEEE balance is: " + web3.utils.fromWei(weeeBal));

    let resp = await contractBustadoge.methods
        .board(web3.utils.toWei(amount.toString()), multiplierNumerator)
        .send({ from: address, gas: "4000000", gasPrice: web3.utils.toWei("69", "gwei") });

    console.log(resp);
    console.log(resp.events.NewRide);

    weeeBal = await contractWeee.methods.balanceOf(address).call();
    console.log("Boarded BustaDoge! Your new WEEE balance is: " + web3.utils.fromWei(weeeBal));
    console.log("Ride is on block " + resp.events.NewRide.returnValues._rideBlock);
}

async function claimBustadoge() {
    let weeeBal = await contractWeee.methods.balanceOf(address).call();
    console.log("Your WEEE balance is: " + web3.utils.fromWei(weeeBal));

    let resp = await contractBustadoge.methods
        .claim()
        .send({ from: address, gas: "4000000", gasPrice: web3.utils.toWei("69", "gwei") });

    console.log("gasUsed: " + resp.gasUsed);

    weeeBal = await contractWeee.methods.balanceOf(address).call();
    console.log(
        "Claimed your ride! Your new WEEE balance is: " +
            web3.utils.fromWei(weeeBal) +
            "\nPlease collect your on-ride photo for 5 WEEE on your way out",
    );

    console.log(resp.events.Claimed.returnValues);
}

// boardBustadoge(1,2*1000000);
claimBustadoge();
