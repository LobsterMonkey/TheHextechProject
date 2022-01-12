const { expect } = require("chai");
const { ethers } = require("hardhat");



describe("HexTech Presale Contract", function () {

  let HexTechPresale;
  let instanceHexTechPresale;
  let HexTechToken;
  let instanceHexTechToken;
  let WETHToken;
  let instanceWETHToken;
  let owner;

  beforeEach(async function () {

    [owner, addr1, addr2, addr3, addr4, addr5] = await ethers.getSigners();

    HexTechPresale = await ethers.getContractFactory("contracts/HexTechPresale.sol:HexTechPresale");

    HexTechToken = await ethers.getContractFactory("HexTechToken");
    instanceHexTechToken = await HexTechToken.deploy("HXT", "Hextech Token");

    WETHToken = await ethers.getContractFactory("WETHToken");
    instanceWETHToken = await WETHToken.deploy();

  });

  describe("Presale Deployment", function () {

    it("should revert because of rate", async function () {
      await expect(
        HexTechPresale.deploy(0,owner.address,instanceHexTechToken.address,instanceWETHToken.address)
      ).to.be.revertedWith('Pre-Sale: rate is 0');
    });
    
    beforeEach(async function () {
      instanceHexTechPresale = await HexTechPresale.deploy(450,owner.address,instanceHexTechToken.address,instanceWETHToken.address);
    });

    it("should set the right owner", async function () {
      expect(await instanceHexTechPresale.owner()).to.equal(owner.address);
    });

    it("should set the right rate", async function () {
      expect(await instanceHexTechPresale.getRate()).to.equal(450);
    });

    it("should set the right wallet", async function () {
      expect(await instanceHexTechPresale.getWallet()).to.equal(owner.address);
    });

    it("should set the right token", async function () {
      expect(await instanceHexTechPresale.getToken()).to.equal(instanceHexTechToken.address);
    });

  });

  describe("Before Presale starts", function () {

    beforeEach(async function () {
      instanceHexTechPresale = await HexTechPresale.deploy(450,owner.address,instanceHexTechToken.address,instanceWETHToken.address);
    });

    it("should revert bcs presale didn't start (getStartICOBlock)", async function () {
      await expect(instanceHexTechPresale.getStartICOBlock()).to.be.revertedWith("Error: Presale has not started yet");
    });

    it("should revert bcs only owner can change rate", async function () {
      await expect(instanceHexTechPresale.connect(addr1).setRate(400)).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("should set a new rate", async function () {
      await instanceHexTechPresale.setRate(400);
      expect(await instanceHexTechPresale.getRate()).to.be.equal(400);
    });

    it("should return 0 availableTokensICO", async function () {
      expect(await instanceHexTechPresale.getAvailableTokensICO()).to.be.equal(0);
    });

    it("should revert bcs only owner can change availableTokensICO", async function () {
      await expect(instanceHexTechPresale.connect(addr1).setAvailableTokensICO(45000)).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("should set a new amount of availableTokensICO", async function () {
      await instanceHexTechPresale.setAvailableTokensICO(45000);
      expect(await instanceHexTechPresale.getAvailableTokensICO()).to.be.equal(45000);
    });

    it("should revert stopICO bcs presale has not started yet", async function () {
      await expect(instanceHexTechPresale.stopICO()).to.be.revertedWith("Pre-Sale: ICO must be active");
    });

    it("should revert buyTokens bcs presale has not started yet", async function () {
      await expect(instanceHexTechPresale.buyTokens(1)).to.be.revertedWith("Pre-Sale: ICO must be active");
    });

    it("should revert claimToken bcs presale has not started yet", async function () {
      await expect(instanceHexTechPresale.connect(addr1).claimToken()).to.be.revertedWith("Pre-Sale has not concluded: Cannot claim token");
    });

    it("should revert claimRefund bcs presale has not started yet", async function () {
      await expect(instanceHexTechPresale.connect(addr1).claimRefund()).to.be.revertedWith("Pre-Sale: You didn't buy any tokens!");
    });

  });

  describe("Start Presale", function () {

    let currentBlock;
    let endBlock;
    let minPurchase = ethers.utils.parseUnits('0.01', 'ether');
    let maxPurchase = ethers.utils.parseUnits('2', 'ether');
    let availableTokens = ethers.utils.parseUnits('6000', 'ether');
    let softcap = ethers.utils.parseUnits('5', 'ether');
    let hardcap = ethers.utils.parseUnits('10', 'ether');
    let poolPercent = 75;

    beforeEach(async function () {

      // Deploy HexTechPresale instance
      instanceHexTechPresale = await HexTechPresale.deploy(450,owner.address,instanceHexTechToken.address,instanceWETHToken.address);

      // Grant MINTER_ROLE to presale contract
      await instanceHexTechToken.grantRole(ethers.utils.id("MINTER_ROLE"),instanceHexTechPresale.address);

      // Initialize current block
      currentBlock = await instanceHexTechPresale.getCurrentBlock();
      endBlock = currentBlock.toNumber() + 1000;
    });

    describe("Reverts", function () {

      it("should revert startICO bcs you cannot startICO more than once", async function () {
      
        
        await instanceHexTechPresale.startICO(
          endBlock,
          minPurchase,
          maxPurchase,
          availableTokens,
          softcap,
          hardcap,
          poolPercent
        );

        await instanceHexTechPresale.stopICO();

        await expect(instanceHexTechPresale.startICO(
          endBlock,
          minPurchase,
          maxPurchase,
          availableTokens,
          softcap,
          hardcap,
          poolPercent
        )).to.be.revertedWith('Presale has already started');

      });

      it("should revert startICO bcs endBlock is before current block", async function () {
      
        await expect(instanceHexTechPresale.startICO(
          currentBlock.toNumber() - 100,
          minPurchase,
          maxPurchase,
          availableTokens,
          softcap,
          hardcap,
          poolPercent
        )).to.be.revertedWith("Pre-Sale: duration should be > 0");
      });
  
      it("should revert startICO bcs minPurchase should be > 0", async function () {
  
        await expect(instanceHexTechPresale.startICO(
          endBlock,
          0,
          maxPurchase,
          availableTokens,
          softcap,
          hardcap,
          poolPercent
        )).to.be.revertedWith("Pre-Sale: _minPurchase should > 0");
      });
  
      it("should revert startICO bcs maxPurchase should be > minPurchase", async function () {
  
        await expect(instanceHexTechPresale.startICO(
          endBlock,
          minPurchase,
          0,
          availableTokens,
          softcap,
          hardcap,
          poolPercent
        )).to.be.revertedWith("Pre-Sale: _maxPurchase should be > _minPurchase");
      });
  
      it("should revert startICO bcs availableTokens should be > 0", async function () {
  
        await expect(instanceHexTechPresale.startICO(
          endBlock,
          minPurchase,
          maxPurchase,
          0,
          softcap,
          hardcap,
          poolPercent
        )).to.be.revertedWith('Pre-Sale: availableTokens should be > 0');
      });
  
      it("should revert startICO bcs softcap should be > 0", async function () {
  
        await expect(instanceHexTechPresale.startICO(
          endBlock,
          minPurchase,
          maxPurchase,
          availableTokens,
          0,
          hardcap,
          poolPercent
        )).to.be.revertedWith("Pre-Sale: _softCap should be > 0");
      });
  
      it("should revert startICO bcs hardcap should be > softcap", async function () {
  
        await expect(instanceHexTechPresale.startICO(
          endBlock,
          minPurchase,
          maxPurchase,
          availableTokens,
          softcap,
          0,
          poolPercent
        )).to.be.revertedWith("Pre-Sale: _hardCap should be > _softCap");
      });
  
      it("should revert startICO bcs poolpercent should be > 0", async function () {
  
        await expect(instanceHexTechPresale.startICO(
          endBlock,
          minPurchase,
          maxPurchase,
          availableTokens,
          softcap,
          hardcap,
          0
        )).to.be.revertedWith("Pre-Sale: poolPercent should be > 0 and <= 100");
      });
  
      it("should revert startICO bcs poolpercent should be <= 100", async function () {
  
        await expect(instanceHexTechPresale.startICO(
          endBlock,
          minPurchase,
          maxPurchase,
          availableTokens,
          softcap,
          hardcap,
          101
        )).to.be.revertedWith("Pre-Sale: poolPercent should be > 0 and <= 100");
      });

    });

    describe('Presale started', function () {

      beforeEach(async function () {

        await instanceHexTechPresale.startICO(
          endBlock,
          minPurchase,
          maxPurchase,
          availableTokens,
          softcap,
          hardcap,
          poolPercent
        );

        const amountWETH = ethers.utils.parseUnits('100000000', 'ether');
        await instanceWETHToken.mint(owner.address, amountWETH);

        const amountApprovedWETH = ethers.utils.parseUnits('45000000000', 'ether');
        await instanceWETHToken.approve(
        instanceHexTechPresale.address,
        amountApprovedWETH
        );

      });

      describe("Constants initialization", function () {

        it('should set the right endBlock', async function () {
          expect(await instanceHexTechPresale.getEndICOBlock()).to.be.equal(endBlock);
        });

        it('should set the right minPurchase', async function () {
          expect(await instanceHexTechPresale.minPurchase()).to.be.equal(minPurchase);
        });

        it('should set the right maxPurchase', async function () {
          expect(await instanceHexTechPresale.maxPurchase()).to.be.equal(maxPurchase);
        });

        it('should set the right availableTokensICO', async function () {
          expect(await instanceHexTechPresale.getAvailableTokensICO()).to.be.equal(ethers.utils.parseUnits('4500','ether')); // AvailableTokensICO = availableTokens * poolPercent/100
        });
    
        it('should set the right softcap', async function () {
          expect(await instanceHexTechPresale.softCap()).to.be.equal(softcap);
        });  

        it('should set the right hardcap', async function () {
          expect(await instanceHexTechPresale.hardCap()).to.be.equal(hardcap);
        });

        it('should set the right poolpercent', async function () {
          expect(await instanceHexTechPresale.poolPercent()).to.be.equal(poolPercent);
        });
      });

      describe("buyTokens()", function () {

        it('should allow people to buy tokens', async function () {
          const availableTokensICO = await instanceHexTechPresale.getAvailableTokensICO();
          const amountBuy = ethers.utils.parseUnits('1','ether');
          await instanceHexTechPresale.buyTokens(amountBuy);
          const newAvailableTokensICO = availableTokensICO.sub(amountBuy.mul(450));

          expect(await instanceHexTechPresale.weiRaised()).to.be.equal(amountBuy);
          expect(await instanceHexTechPresale.getAvailableTokensICO()).to.be.equal(newAvailableTokensICO);
          expect(await instanceWETHToken.balanceOf(instanceHexTechPresale.address)).to.be.equal(amountBuy);
        });

        it('should not allow to buy 0', async function () {
          const availableTokensICO = await instanceHexTechPresale.getAvailableTokensICO();
          const amountBuy = 0;
          
          await expect(instanceHexTechPresale.buyTokens(amountBuy)).to.be.revertedWith('Pre-Sale: weiAmount is 0');
          expect(await instanceHexTechPresale.getAvailableTokensICO()).to.be.equal(availableTokensICO);
        });

        it('should not allow to buy less than minPurchase', async function () {
          const availableTokensICO = await instanceHexTechPresale.getAvailableTokensICO();
          const amountBuy = ethers.utils.parseUnits('0.005', 'ether');
          
          await expect(instanceHexTechPresale.buyTokens(amountBuy)).to.be.revertedWith('have to send at least: minPurchase');
          expect(await instanceHexTechPresale.getAvailableTokensICO()).to.be.equal(availableTokensICO);
        });

        it('should not allow to buy more than maxPurchase in one buy', async function () {
          const availableTokensICO = await instanceHexTechPresale.getAvailableTokensICO();
          const amountBuy = ethers.utils.parseUnits('3', 'ether');
          
          await expect(instanceHexTechPresale.buyTokens(amountBuy)).to.be.revertedWith('have to send max: maxPurchase');
          expect(await instanceHexTechPresale.getAvailableTokensICO()).to.be.equal(availableTokensICO);
        });

        it('should not allow to buy more than maxPurchase in multiple buys', async function () {
          const amountBuy1 = ethers.utils.parseUnits('1.5', 'ether');
          await instanceHexTechPresale.buyTokens(amountBuy1);

          const availableTokensICO = await instanceHexTechPresale.getAvailableTokensICO();
          const amountBuy2 = ethers.utils.parseUnits('1', 'ether');
          await expect(instanceHexTechPresale.buyTokens(amountBuy2)).to.be.revertedWith('cannot contribute more than maxPurchase');
          expect(await instanceHexTechPresale.getAvailableTokensICO()).to.be.equal(availableTokensICO);
        });

        it('should not allow people that havent approve WETH to buyTokens', async function () {
          const availableTokensICO = await instanceHexTechPresale.getAvailableTokensICO();
          const amountBuy = ethers.utils.parseUnits('1','ether');

          await expect(instanceHexTechPresale.connect(addr1).buyTokens(amountBuy)).to.be.revertedWith('You need to approve WETH');
          expect(await instanceHexTechPresale.getAvailableTokensICO()).to.be.equal(availableTokensICO);
        });

        it('should not allow people without WETH to buyTokens', async function () {
          const availableTokensICO = await instanceHexTechPresale.getAvailableTokensICO();
          const amountBuy = ethers.utils.parseUnits('1','ether');
          const amountApproved = ethers.utils.parseUnits('100','ether');
          await instanceWETHToken.connect(addr1).approve(instanceHexTechPresale.address,amountApproved);

          await expect(instanceHexTechPresale.connect(addr1).buyTokens(amountBuy)).to.be.revertedWith("ERC20: transfer amount exceeds balance");
          expect(await instanceHexTechPresale.getAvailableTokensICO()).to.be.equal(availableTokensICO);
        });

        it('should not allow to contribute above hardcap', async function () {
          const amountBuy = ethers.utils.parseUnits('2','ether');
          const amountApproved = ethers.utils.parseUnits('100','ether');
          const addresses = [addr1, addr2, addr3, addr4, addr5];

          const presaleResult = await instanceHexTechPresale.presaleResult();
          console.log(presaleResult);

          for (const addr of addresses) {
            await instanceWETHToken.mint(addr.address, amountBuy);
            await instanceWETHToken.connect(addr).approve(instanceHexTechPresale.address,amountApproved);
            await instanceHexTechPresale.connect(addr).buyTokens(amountBuy);
          }

          const presaleResultAgain = await instanceHexTechPresale.presaleResult();
          console.log(presaleResultAgain);
          
          await expect(instanceHexTechPresale.buyTokens(ethers.utils.parseUnits('0.02','ether'))).to.be.revertedWith('hardcap has been reached');          
        });
      });

      describe('icoNotActive() modifier', function () {

        it('should not allow owner to change rate when ico is active', async function () {
          await expect(instanceHexTechPresale.setRate(400)).to.be.revertedWith('Pre-Sale: ICO should not be active');
        });

        it('should not allow owner to change availableTokensICO when ico is active', async function () {
          await expect(instanceHexTechPresale.setAvailableTokensICO(ethers.utils.parseUnits('4000','ether'))).to.be.revertedWith('Pre-Sale: ICO should not be active');
        });

        it('should not allow user to claimTokens when ico is active', async function () {
          await expect(instanceHexTechPresale.connect(addr1).claimToken()).to.be.revertedWith('Pre-Sale: ICO should not be active');
        });

        it('should not allow user to claimRefund when ico is active', async function () {
          await expect(instanceHexTechPresale.connect(addr1).claimRefund()).to.be.revertedWith('Pre-Sale: ICO should not be active');
        });
      });

      describe('stopICO()', function () {

        it('should set endICO to 0', async function () {

          await instanceHexTechPresale.stopICO();
          expect(await instanceHexTechPresale.endICO()).to.be.equal(0);
        });

        describe('if weiRaised >= softCap', function () {

          let amountBuy;
          let amountApproved;
          let addresses;

          beforeEach(async function() {

            amountBuy = ethers.utils.parseUnits('2','ether');
            amountApproved = ethers.utils.parseUnits('100','ether');
            addresses = [addr1, addr2, addr3];

            for (const addr of addresses) {
              await instanceWETHToken.mint(addr.address, amountBuy);
              await instanceWETHToken.connect(addr).approve(instanceHexTechPresale.address,amountApproved);
              await instanceHexTechPresale.connect(addr).buyTokens(amountBuy);
            }

            await instanceHexTechPresale.stopICO();

          });

          it('should set presaleResult to true', async function () {
            expect(await instanceHexTechPresale.presaleResult()).to.be.true;
          });

          describe('presaleResult == true', function () {

            it('should allow claimToken', async function () {
              const tokenBought = await instanceHexTechPresale.TokenBought(addr1.address);
              await instanceHexTechPresale.connect(addr1).claimToken();

              expect(await instanceHexTechPresale.Claimed(addr1.address)).to.be.true;
              expect(await instanceHexTechToken.balanceOf(addr1.address)).to.be.equal(tokenBought);
            });

            it('should not allow claimToken if you already claimed', async function () {
              const tokenBought = await instanceHexTechPresale.TokenBought(addr1.address);
              await instanceHexTechPresale.connect(addr1).claimToken();

              await expect(instanceHexTechPresale.connect(addr1).claimToken()).to.be.revertedWith("Pre-Sale: You did claim your tokens!");
              expect(await instanceHexTechToken.balanceOf(addr1.address)).to.be.equal(tokenBought);
            });

            it('should not allow claimToken if you did not buyToken during presale', async function () {
              await expect(instanceHexTechPresale.connect(addr4).claimToken()).to.be.revertedWith("Pre-Sale: You didn't buy any tokens!");
            });

            it('should not allow claimRefund', async function () {
              await expect(instanceHexTechPresale.connect(addr4).claimRefund()).to.be.revertedWith("Pre-Sale has concluded: Cannot claim refund");
            });
          });

        });

        describe('if weiRaised < softCap', function () {

          let amountBuy;
          let amountApproved;
          let addresses;

          beforeEach(async function() {

            amountBuy = ethers.utils.parseUnits('2','ether');
            amountApproved = ethers.utils.parseUnits('100','ether');
            addresses = [addr1, addr2];

            for (const addr of addresses) {
              await instanceWETHToken.mint(addr.address, amountBuy);
              await instanceWETHToken.connect(addr).approve(instanceHexTechPresale.address,amountApproved);
              await instanceHexTechPresale.connect(addr).buyTokens(amountBuy);
            }

            await instanceHexTechPresale.stopICO();

          });

          it('should keep presaleResult to false', async function () {
            
            expect(await instanceHexTechPresale.presaleResult()).to.be.false;
          });

          describe('presaleResult == false', function () {

            it('should allow claimRefund', async function () {
              const coinPaid = await instanceHexTechPresale.CoinPaid(addr1.address);
              await instanceHexTechPresale.connect(addr1).claimRefund();

              expect(await instanceHexTechPresale.Claimed(addr1.address)).to.be.true;
              expect(await instanceWETHToken.balanceOf(addr1.address)).to.be.equal(coinPaid);
            });

            it('should not allow claimRefund if you already claimed', async function () {
              const coinPaid = await instanceHexTechPresale.CoinPaid(addr1.address);
              await instanceHexTechPresale.connect(addr1).claimRefund();

              await expect(instanceHexTechPresale.connect(addr1).claimRefund()).to.be.revertedWith("Pre-Sale: You did claim your refund!");
              expect(await instanceWETHToken.balanceOf(addr1.address)).to.be.equal(coinPaid);
            });

            it('should not allow claimRefund if you did not buyToken during presale', async function () {
              await expect(instanceHexTechPresale.connect(addr4).claimRefund()).to.be.revertedWith("Pre-Sale: You didn't buy any tokens!");
            });

            it('should not allow claimToken', async function () {
              await expect(instanceHexTechPresale.connect(addr4).claimToken()).to.be.revertedWith("Pre-Sale has not concluded: Cannot claim token");
            });
          });
        });
      });
    });
  });
});
