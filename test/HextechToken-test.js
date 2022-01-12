const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Hextech Token Contract", function () {

    let HexTechToken;
    let instanceHexTechToken;

    beforeEach(async function () {

        [owner, addr1, addr2, addr3, addr4, addr5] = await ethers.getSigners();

        HexTechToken = await ethers.getContractFactory("HexTechToken");
        instanceHexTechToken = await HexTechToken.deploy("HXT", "Hextech Token");
    });

    it("should set the right default admin", async function () {
        expect(await instanceHexTechToken.hasRole("0x0000000000000000000000000000000000000000000000000000000000000000", owner.address)).to.be.true;
    });

    it("should grant minter role", async function () {
        await instanceHexTechToken.grantRole(ethers.utils.id("MINTER_ROLE"),owner.address);
        expect(await instanceHexTechToken.hasRole(ethers.utils.id("MINTER_ROLE"), owner.address)).to.be.true;
    });

    it("should grant burner role", async function () {
        await instanceHexTechToken.grantRole(ethers.utils.id("BURNER_ROLE"),owner.address);
        expect(await instanceHexTechToken.hasRole(ethers.utils.id("BURNER_ROLE"), owner.address)).to.be.true;
    });

    it("should allow minter to mint", async function () {
        await instanceHexTechToken.grantRole(ethers.utils.id("MINTER_ROLE"),addr1.address);
        await instanceHexTechToken.connect(addr1).mint(addr1.address, ethers.utils.parseUnits("1000","ether"));

        expect(await instanceHexTechToken.balanceOf(addr1.address)).to.be.equal(ethers.utils.parseUnits("1000","ether"));
    });

    it("should not allow non minter to mint", async function () {
        await expect(instanceHexTechToken.connect(addr1).mint(addr1.address, ethers.utils.parseUnits("1000","ether"))).to.be.revertedWith('AccessControl: account 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 is missing role 0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6');
    });

    it("should allow burner to burn", async function () {
        await instanceHexTechToken.grantRole(ethers.utils.id("MINTER_ROLE"),addr1.address);
        await instanceHexTechToken.connect(addr1).mint(addr1.address, ethers.utils.parseUnits("1000","ether"));

        await instanceHexTechToken.grantRole(ethers.utils.id("BURNER_ROLE"),addr1.address);
        await instanceHexTechToken.connect(addr1).burn(ethers.utils.parseUnits("500","ether"));

        expect(await instanceHexTechToken.balanceOf(addr1.address)).to.be.equal(ethers.utils.parseUnits("500","ether"));
    });

    it("should not allow non burner to burn", async function () {
        await instanceHexTechToken.grantRole(ethers.utils.id("MINTER_ROLE"),addr1.address);
        await instanceHexTechToken.connect(addr1).mint(addr1.address, ethers.utils.parseUnits("1000","ether"));

        await expect(instanceHexTechToken.connect(addr1).burn(ethers.utils.parseUnits("500","ether"))).to.be.revertedWith('AccessControl: account 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 is missing role 0x3c11d16cbaffd01df69ce1c404f6340ee057498f5f00246190ea54220576a848');
    });

    it("should burn 1% of tokens of from when using transfer", async function () {
        await instanceHexTechToken.grantRole(ethers.utils.id("MINTER_ROLE"),owner.address);
        await instanceHexTechToken.mint(addr2.address, ethers.utils.parseUnits("1000","ether"));
        expect(await instanceHexTechToken.balanceOf(addr2.address)).to.be.equal(ethers.utils.parseUnits("1000","ether"));

        await instanceHexTechToken.connect(addr2).transfer(owner.address, ethers.utils.parseUnits("500","ether"));

        expect(await instanceHexTechToken.balanceOf(owner.address)).to.be.equal(ethers.utils.parseUnits("495","ether"));
    });

    it("should burn 1% of tokens of from when using transferFrom", async function () {
        await instanceHexTechToken.grantRole(ethers.utils.id("MINTER_ROLE"),owner.address);
        await instanceHexTechToken.mint(addr2.address, ethers.utils.parseUnits("1000","ether"));
        expect(await instanceHexTechToken.balanceOf(addr2.address)).to.be.equal(ethers.utils.parseUnits("1000","ether"));

        await instanceHexTechToken.connect(addr2).approve(owner.address, ethers.utils.parseUnits("500","ether"));
        expect(await instanceHexTechToken.allowance(addr2.address, owner.address)).to.be.equal(ethers.utils.parseUnits("500", "ether"));

        await instanceHexTechToken.transferFrom(addr2.address, owner.address, ethers.utils.parseUnits("500","ether"));

        expect(await instanceHexTechToken.balanceOf(owner.address)).to.be.equal(ethers.utils.parseUnits("495","ether"));
    });

    it("it should not burn 1% of transfer if made by minter", async function () {
        await instanceHexTechToken.grantRole(ethers.utils.id("MINTER_ROLE"),owner.address);
        await instanceHexTechToken.mint(owner.address, ethers.utils.parseUnits("1000","ether"));
        expect(await instanceHexTechToken.balanceOf(owner.address)).to.be.equal(ethers.utils.parseUnits("1000","ether"));

        await instanceHexTechToken.transfer(addr2.address, ethers.utils.parseUnits("500","ether"));

        expect(await instanceHexTechToken.balanceOf(addr2.address)).to.be.equal(ethers.utils.parseUnits("500","ether"));
    });
    
});