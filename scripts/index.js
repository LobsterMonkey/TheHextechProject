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

    /* // Mint USDC to main account
    const amountUSDC = ethers.utils.parseUnits('100000000', 'ether');
    const mintUSDC = await usdcToken.mint(accounts[0], amountUSDC);
    const receiptMintUSDC = await mintUSDC.wait();
    console.log(receiptMintUSDC);
    const balanceUSDC = await usdcToken.balanceOf(accounts[0]);
    console.log(balanceUSDC.toString()) */

    // Mint WETH to main account
    const amountWETH = ethers.utils.parseUnits('100000000', 'ether');
    const mintWETH = await wethToken.mint(accounts[0], amountWETH);
    const receiptMintWETH = await mintWETH.wait();
    console.log(receiptMintWETH);
    const balanceWETH = await wethToken.balanceOf(accounts[0]);
    console.log(balanceWETH.toString())

    /* // Approve Quickswap to use our USDC
    const spender = UniswapV2Router02Address;
    const amountApprovedUSDC = ethers.utils.parseUnits('45000000000', 'ether');
    const approveUSDC = await usdcToken.approve(
        spender,
        amountApprovedUSDC
    );
    const receiptApproveUSDC = await approveUSDC.wait();
    console.log(receiptApproveUSDC); */

    // Approve Quickswap to use our WETH
    const spender = UniswapV2Router02Address;
    const amountApprovedWETH = ethers.utils.parseUnits('45000000000', 'ether');
    const approveWETH = await wethToken.approve(
        spender,
        amountApprovedWETH
    );
    const receiptApproveWETH = await approveWETH.wait();
    console.log(receiptApproveWETH);

  /*   // Create USDC-WETH Liquidity 
    const tokenA = USDCTokenAddress;
    const tokenB = WETHTokenAddress;
    const createPair = await wethToken.createPair(
        tokenA,
        tokenB
    );
    const receiptCreatePair = await createPair.wait();
    console.log(receiptCreatePair); */




    /* // Add USDC-WETH Liquidity
    const amountADesired = ethers.utils.parseUnits('450000', 'ether');
    const amountBDesired = ethers.utils.parseUnits('100', 'ether');
    const amountAMin = ethers.utils.parseUnits('45000', 'ether');
    const amountBMin = ethers.utils.parseUnits('10', 'ether');
    const to = accounts[0];
    const deadline =  Date.now() + 1000 * 60 * 10;

    const addLiquidity = await uniswapV2Router.addLiquidity(
        tokenA,
        tokenB,
        amountADesired,
        amountBDesired,
        amountAMin,
        amountBMin,
        to,
        deadline
    );
    const receiptAddLiquidity = await addLiquidity.wait();
    console.log(receiptAddLiquidity); */

    

    // Mint HEXTECH Tokens to Presale contract
    const amount1 = ethers.utils.parseUnits('60000', 'ether');
    const mint1 = await hexTechToken.mint(HexTechPresaleAddress, amount1);
    const receiptMint1 = await mint1.wait();
    console.log(receiptMint1);
    const balance1 = await hexTechToken.balanceOf(HexTechPresaleAddress);
    console.log(balance1.toString())

    // Start Presale
    const currentBlock = await hexTechPresale.getCurrentBlock();
    const endBlock = currentBlock.toNumber() + 100;
    const minAmount = ethers.utils.parseUnits('0.01', 'ether');
    const maxAmount = ethers.utils.parseUnits('2', 'ether');
    const availableTokens = ethers.utils.parseUnits('60000', 'ether');
    const softcap = ethers.utils.parseUnits('50', 'ether');
    const hardcap = ethers.utils.parseUnits('100', 'ether');
    const poolPercent = 75;

    console.log(currentBlock.toNumber());

    const startICO = await hexTechPresale.startICO(
        endBlock,
        minAmount,
        maxAmount,
        availableTokens,
        softcap,
        hardcap,
        poolPercent
    );
    const receiptStartICO = await startICO.wait();
    console.log(receiptStartICO);
    
    // Verify Presale End Block
    const endICO = await hexTechPresale.getEndICOBlock();
    console.log(endICO.toNumber());

    // Approve Presale to use our WETH
    const amountApprovedWETH2 = ethers.utils.parseUnits('45000000000', 'ether');
    const approveWETH2 = await wethToken.approve(
        HexTechPresaleAddress,
        amountApprovedWETH2
    );
    const receiptApproveWETH2 = await approveWETH2.wait();
    console.log(receiptApproveWETH2);

    /* // Try to send Tokens to presale
    const amountSendWETH = ethers.utils.parseUnits('1', 'ether');
    const sendWETH = await wethToken.transfer(
        HexTechPresaleAddress,
        amountSendWETH
    );
    const receiptSendWETH = await sendWETH.wait();
    console.log(receiptSendWETH); */

    /* const [owner] = await ethers.getSigners();
    const transactionHash = await owner.sendTransaction({
        to: HexTechPresaleAddress,
        value: ethers.utils.parseEther("1.0"), // Sends exactly 1.0 ether
    });
    const receiptSendTransaction = await transactionHash.wait();
    console.log(receiptSendTransaction); */
}
  
main()
.then(() => process.exit(0))
.catch(error => {
    console.error(error);
    process.exit(1);
});