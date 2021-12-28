const { ethers } = require("hardhat");
const abi = require("./abi/uniswapV2Router.json");

// scripts/index.js
async function main () {
    
    // Retrieve accounts from the local node
    const accounts = await ethers.provider.listAccounts();
    const signers = await ethers.getSigners();
    const provider = new ethers.providers.JsonRpcProvider();

    const HexTechTokenAddress = "0x8659DF1C638CDA8E475CD3C6481730C2b4f85873";
    const USDCTokenAddress = "0x1f9c84B161b2c7FFB540BC5354543108cCE37df1";
    const WETHTokenAddress = "0x4D1338Fa46ca6060F1472b70599cc635Ad275EDa";
    const HexTechPresaleAddress = "0x87E8f332f34984728Da4c0A008a495A5Ec4E09a2";
    const UniswapV2Router02Address = "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff";

    // Initiate contract instances
    const USDCToken = await ethers.getContractFactory("USDCToken");
    const usdcToken = await USDCToken.attach(USDCTokenAddress);

    const UniswapV2Router = new ethers.Contract(UniswapV2Router02Address, abi, provider);
    const uniswapV2Router = await UniswapV2Router.connect(signers[0]);

    const WETHToken = await ethers.getContractFactory("WETHToken");
    const wethToken = await WETHToken.attach(WETHTokenAddress);

    const HexTechToken = await ethers.getContractFactory("HexTechToken");
    const hexTechToken = await HexTechToken.attach(HexTechTokenAddress);

    const HexTechPresale = await ethers.getContractFactory("HexTechPresale");
    const hexTechPresale = await HexTechPresale.attach(HexTechPresaleAddress);

    // Verify Presale End Block
    const endICO = await hexTechPresale.getEndICOBlock();
    console.log(endICO.toNumber());

    // Verify available amount tokens in presale
    const getAvailableTokensICO = await hexTechPresale.getAvailableTokensICO();
    console.log(getAvailableTokensICO.toString());

    // Verify wei raised 
    const weiRaised = await hexTechPresale.weiRaised();
    console.log(weiRaised.toString());

    // Verify WETH balance
    const balanceWETH = await wethToken.balanceOf(accounts[0]);
    console.log(balanceWETH.toString());

    // Approve Token use to presale contract
    const spender = HexTechPresaleAddress;
    const approveAmount = ethers.utils.parseUnits('100', 'ether'); 
    const approve = await wethToken.approve(
        spender, 
        approveAmount
    );
    const receiptApprove = await approve.wait();
    console.log(receiptApprove);

    /* // Try to buy tokens
    const amountBuyTokens = ethers.utils.parseUnits('1', 'ether');
    const buyTokens = await hexTechPresale.buyTokens(
        amountBuyTokens
    );
    const receiptBuyTokens = await buyTokens.wait();
    console.log(receiptBuyTokens); */

    // Verify available amount tokens in presale again
    const getAvailableTokensICO1 = await hexTechPresale.getAvailableTokensICO();
    console.log(getAvailableTokensICO1.toString());

    // Verify wei raised 
    const weiRaised1 = await hexTechPresale.weiRaised();
    console.log(weiRaised1.toString());

    // Verify WETH balance again
    const balanceWETH1 = await wethToken.balanceOf(accounts[0]);
    console.log(balanceWETH1.toString());
}

main()
.then(() => process.exit(0))
.catch(error => {
    console.error(error);
    process.exit(1);
});