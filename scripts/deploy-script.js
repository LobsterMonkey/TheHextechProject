// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const HexTechToken = await hre.ethers.getContractFactory("HexTechToken");
  const hexTechToken = await HexTechToken.deploy();

  await hexTechToken.deployed();

  console.log("HexTechToken deployed to:", hexTechToken.address);

  const USDCToken = await hre.ethers.getContractFactory("USDCToken");
  const usdcToken = await USDCToken.deploy();

  await usdcToken.deployed();

  console.log("USDCToken deployed to:", usdcToken.address);

  const WETHToken = await hre.ethers.getContractFactory("WETHToken");
  const wethToken = await WETHToken.deploy();

  await wethToken.deployed();

  console.log("WETHToken deployed to:", wethToken.address);

  const HexTechPresale = await hre.ethers.getContractFactory("HexTechPresale");
  const hexTechPresale = await HexTechPresale.deploy(450,"0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",hexTechToken.address,wethToken.address);

  await hexTechPresale.deployed();

  console.log("HexTechPresale deployed to:", hexTechPresale.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
