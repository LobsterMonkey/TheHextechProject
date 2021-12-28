const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("HexTech Presale Contract", function () {

  let WhitelistedHexTechPresale;
  let instanceWhitelistedHexTechPresale;
  let HexTechToken;
  let instanceHexTechToken;
  let WETHToken;
  let instanceWETHToken;
  let owner;

  beforeEach(async function () {

    [owner, addr1, addr2, addr3, addr4, addr5] = await ethers.getSigners();

    WhitelistedHexTechPresale = await ethers.getContractFactory("WhitelistedHexTechPresale");
    
    HexTechToken = await ethers.getContractFactory("HexTechToken");
    instanceHexTechToken = await HexTechToken.deploy();

    WETHToken = await ethers.getContractFactory("WETHToken");
    instanceWETHToken = await WETHToken.deploy();

  });

  describe("Presale Deployment", function () {

    it("should revert because of rate", async function () {
      await expect(
        WhitelistedHexTechPresale.deploy(0,owner.address,instanceHexTechToken.address,instanceWETHToken.address)
      ).to.be.revertedWith('Pre-Sale: rate is 0');
    });
    
    beforeEach(async function () {
      instanceWhitelistedHexTechPresale = await WhitelistedHexTechPresale.deploy(450,owner.address,instanceHexTechToken.address,instanceWETHToken.address);
    });

    it("should set the right owner", async function () {
      expect(await instanceWhitelistedHexTechPresale.owner()).to.equal(owner.address);
    });

    it("should set the right rate", async function () {
      expect(await instanceWhitelistedHexTechPresale.getRate()).to.equal(450);
    });

    it("should set the right wallet", async function () {
      expect(await instanceWhitelistedHexTechPresale.getWallet()).to.equal(owner.address);
    });

    it("should set the right token", async function () {
      expect(await instanceWhitelistedHexTechPresale.getToken()).to.equal(instanceHexTechToken.address);
    });

    it("should set the right admin", async function () {
      
    })

  });

  describe("Before Presale starts", function () {

    beforeEach(async function () {
      instanceWhitelistedHexTechPresale = await WhitelistedHexTechPresale.deploy(450,owner.address,instanceHexTechToken.address,instanceWETHToken.address);
    });

    it("should revert bcs presale didn't start (getStartICOBlock)", async function () {
      await expect(instanceWhitelistedHexTechPresale.getStartICOBlock()).to.be.revertedWith("Error: Presale has not started yet");
    });

    it("should revert bcs only owner can change rate", async function () {
      await expect(instanceWhitelistedHexTechPresale.connect(addr1).setRate(400)).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("should set a new rate", async function () {
      await instanceWhitelistedHexTechPresale.setRate(400);
      expect(await instanceWhitelistedHexTechPresale.getRate()).to.be.equal(400);
    });

    it("should return 0 availableTokensICO", async function () {
      expect(await instanceWhitelistedHexTechPresale.getAvailableTokensICO()).to.be.equal(0);
    });

    it("should revert bcs only owner can change availableTokensICO", async function () {
      await expect(instanceWhitelistedHexTechPresale.connect(addr1).setAvailableTokensICO(45000)).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("should set a new amount of availableTokensICO", async function () {
      await instanceWhitelistedHexTechPresale.setAvailableTokensICO(45000);
      expect(await instanceWhitelistedHexTechPresale.getAvailableTokensICO()).to.be.equal(45000);
    });

    it("should revert stopICO bcs presale has not started yet", async function () {
      await expect(instanceWhitelistedHexTechPresale.stopICO()).to.be.revertedWith("Pre-Sale: ICO must be active");
    });

    it("should revert buyTokens bcs presale has not started yet", async function () {
      await expect(instanceWhitelistedHexTechPresale.buyTokens(1)).to.be.revertedWith("Pre-Sale: ICO must be active");
    });

    it("should revert claimToken bcs presale has not started yet", async function () {
      await expect(instanceWhitelistedHexTechPresale.connect(addr1).claimToken()).to.be.revertedWith("Pre-Sale has not concluded: Cannot claim token");
    });

    it("should revert claimRefund bcs presale has not started yet", async function () {
      await expect(instanceWhitelistedHexTechPresale.connect(addr1).claimRefund()).to.be.revertedWith("Pre-Sale: You didn't buy any tokens!");
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

      // Deploy WhitelistedHexTechPresale instance
      instanceWhitelistedHexTechPresale = await WhitelistedHexTechPresale.deploy(450,owner.address,instanceHexTechToken.address,instanceWETHToken.address);

      // Mint HexTech Tokens to presale contract
      const amountHexTech = ethers.utils.parseUnits('6000', 'ether');
      await instanceHexTechToken.mint(instanceWhitelistedHexTechPresale.address, amountHexTech); 

      // Initialize current block
      currentBlock = await instanceWhitelistedHexTechPresale.getCurrentBlock();
      endBlock = currentBlock.toNumber() + 1000;
    });

    describe("Reverts", function () {

      it("should revert startICO bcs endBlock is before current block", async function () {
      
        await expect(instanceWhitelistedHexTechPresale.startICO(
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
  
        await expect(instanceWhitelistedHexTechPresale.startICO(
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
  
        await expect(instanceWhitelistedHexTechPresale.startICO(
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
  
        await expect(instanceWhitelistedHexTechPresale.startICO(
          endBlock,
          minPurchase,
          maxPurchase,
          0,
          softcap,
          hardcap,
          poolPercent
        )).to.be.revertedWith('Pre-Sale: availableTokens should be > 0 and <= totalSupply');
      });
  
      it("should revert startICO bcs availableTokens should be <= totalSupply()", async function () {
  
  
        await expect(instanceWhitelistedHexTechPresale.startICO(
          endBlock,
          minPurchase,
          maxPurchase,
          (await instanceHexTechToken.totalSupply()).toString() + 1,
          softcap,
          hardcap,
          poolPercent
        )).to.be.revertedWith('Pre-Sale: availableTokens should be > 0 and <= totalSupply');
      });
  
      it("should revert startICO bcs softcap should be > 0", async function () {
  
        await expect(instanceWhitelistedHexTechPresale.startICO(
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
  
        await expect(instanceWhitelistedHexTechPresale.startICO(
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
  
        await expect(instanceWhitelistedHexTechPresale.startICO(
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
  
        await expect(instanceWhitelistedHexTechPresale.startICO(
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

        await instanceWhitelistedHexTechPresale.startICO(
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
        instanceWhitelistedHexTechPresale.address,
        amountApprovedWETH
        );

      });

      describe("Constants initialization", function () {

        it('should set the right endBlock', async function () {
          expect(await instanceWhitelistedHexTechPresale.getEndICOBlock()).to.be.equal(endBlock);
        });

        it('should set the right minPurchase', async function () {
          expect(await instanceWhitelistedHexTechPresale.minPurchase()).to.be.equal(minPurchase);
        });

        it('should set the right maxPurchase', async function () {
          expect(await instanceWhitelistedHexTechPresale.maxPurchase()).to.be.equal(maxPurchase);
        });

        it('should set the right availableTokensICO', async function () {
          expect(await instanceWhitelistedHexTechPresale.getAvailableTokensICO()).to.be.equal(ethers.utils.parseUnits('4500','ether')); // AvailableTokensICO = availableTokens * poolPercent/100
        });
    
        it('should set the right softcap', async function () {
          expect(await instanceWhitelistedHexTechPresale.softCap()).to.be.equal(softcap);
        });  

        it('should set the right hardcap', async function () {
          expect(await instanceWhitelistedHexTechPresale.hardCap()).to.be.equal(hardcap);
        });

        it('should set the right poolpercent', async function () {
          expect(await instanceWhitelistedHexTechPresale.poolPercent()).to.be.equal(poolPercent);
        });
      });

      describe("buyTokens()", function () {

        it('should grant whitelist role', async function () {
            await instanceWhitelistedHexTechPresale.grantRole(ethers.utils.id("WHITELIST_ROLE"),owner.address);
            expect(await instanceWhitelistedHexTechPresale.hasRole(ethers.utils.id("WHITELIST_ROLE"), owner.address)).to.be.true;
        });

        beforeEach(async function () {

            await instanceWhitelistedHexTechPresale.grantRole(ethers.utils.id("WHITELIST_ROLE"),owner.address);

        });

        it('should allow whitelisted people to buy tokens', async function () {

            const availableTokensICO = await instanceWhitelistedHexTechPresale.getAvailableTokensICO();
            const amountBuy = ethers.utils.parseUnits('1','ether');
            await instanceWhitelistedHexTechPresale.buyTokens(amountBuy);
            const newAvailableTokensICO = availableTokensICO.sub(amountBuy.mul(450));
  
            expect(await instanceWhitelistedHexTechPresale.weiRaised()).to.be.equal(amountBuy);
            expect(await instanceWhitelistedHexTechPresale.getAvailableTokensICO()).to.be.equal(newAvailableTokensICO);
            expect(await instanceWETHToken.balanceOf(instanceWhitelistedHexTechPresale.address)).to.be.equal(amountBuy);
        });

        it('should not allow non-whitelisted people to buy tokens', async function () {
            expect(await instanceWhitelistedHexTechPresale.hasRole(ethers.utils.id("WHITELIST_ROLE"), addr1.address)).to.be.false;

            const amountBuy = ethers.utils.parseUnits('1','ether');
            const amountApproved = ethers.utils.parseUnits('100','ether');
            await instanceWETHToken.connect(addr1).approve(instanceWhitelistedHexTechPresale.address,amountApproved);
            await expect(instanceWhitelistedHexTechPresale.connect(addr1).buyTokens(amountBuy)).to.be.revertedWith('WhitelistedPresale: User is not whitelisted');
        });


        it('should not allow to buy 0', async function () {
          const availableTokensICO = await instanceWhitelistedHexTechPresale.getAvailableTokensICO();
          const amountBuy = 0;
          
          await expect(instanceWhitelistedHexTechPresale.buyTokens(amountBuy)).to.be.revertedWith('Pre-Sale: weiAmount is 0');
          expect(await instanceWhitelistedHexTechPresale.getAvailableTokensICO()).to.be.equal(availableTokensICO);
        });

        it('should not allow to buy less than minPurchase', async function () {
          const availableTokensICO = await instanceWhitelistedHexTechPresale.getAvailableTokensICO();
          const amountBuy = ethers.utils.parseUnits('0.005', 'ether');
          
          await expect(instanceWhitelistedHexTechPresale.buyTokens(amountBuy)).to.be.revertedWith('have to send at least: minPurchase');
          expect(await instanceWhitelistedHexTechPresale.getAvailableTokensICO()).to.be.equal(availableTokensICO);
        });

        it('should not allow to buy more than maxPurchase in one buy', async function () {
          const availableTokensICO = await instanceWhitelistedHexTechPresale.getAvailableTokensICO();
          const amountBuy = ethers.utils.parseUnits('3', 'ether');
          
          await expect(instanceWhitelistedHexTechPresale.buyTokens(amountBuy)).to.be.revertedWith('have to send max: maxPurchase');
          expect(await instanceWhitelistedHexTechPresale.getAvailableTokensICO()).to.be.equal(availableTokensICO);
        });

        it('should not allow to buy more than maxPurchase in multiple buys', async function () {
          const amountBuy1 = ethers.utils.parseUnits('1.5', 'ether');
          await instanceWhitelistedHexTechPresale.buyTokens(amountBuy1);

          const availableTokensICO = await instanceWhitelistedHexTechPresale.getAvailableTokensICO();
          const amountBuy2 = ethers.utils.parseUnits('1', 'ether');
          await expect(instanceWhitelistedHexTechPresale.buyTokens(amountBuy2)).to.be.revertedWith('cannot contribute more than maxPurchase');
          expect(await instanceWhitelistedHexTechPresale.getAvailableTokensICO()).to.be.equal(availableTokensICO);
        });

        it('should not allow people that havent approve WETH to buyTokens', async function () {
          const availableTokensICO = await instanceWhitelistedHexTechPresale.getAvailableTokensICO();
          const amountBuy = ethers.utils.parseUnits('1','ether');

          await expect(instanceWhitelistedHexTechPresale.connect(addr1).buyTokens(amountBuy)).to.be.revertedWith('You need to approve WETH');
          expect(await instanceWhitelistedHexTechPresale.getAvailableTokensICO()).to.be.equal(availableTokensICO);
        });

        it('should not allow people without WETH to buyTokens', async function () {
          await instanceWhitelistedHexTechPresale.grantRole(ethers.utils.id("WHITELIST_ROLE"),addr1.address);
          expect(await instanceWhitelistedHexTechPresale.hasRole(ethers.utils.id("WHITELIST_ROLE"), addr1.address)).to.be.true;

          const availableTokensICO = await instanceWhitelistedHexTechPresale.getAvailableTokensICO();
          const amountBuy = ethers.utils.parseUnits('1','ether');
          const amountApproved = ethers.utils.parseUnits('100','ether');
          await instanceWETHToken.connect(addr1).approve(instanceWhitelistedHexTechPresale.address,amountApproved);

          await expect(instanceWhitelistedHexTechPresale.connect(addr1).buyTokens(amountBuy)).to.be.revertedWith("ERC20: transfer amount exceeds balance");
          expect(await instanceWhitelistedHexTechPresale.getAvailableTokensICO()).to.be.equal(availableTokensICO);
        });

        it('should not allow to contribute above hardcap', async function () {
          const amountBuy = ethers.utils.parseUnits('2','ether');
          const amountApproved = ethers.utils.parseUnits('100','ether');
          const addresses = [addr1, addr2, addr3, addr4, addr5];

          const presaleResult = await instanceWhitelistedHexTechPresale.presaleResult();
          console.log(presaleResult);

          for (const addr of addresses) {
            await instanceWhitelistedHexTechPresale.grantRole(ethers.utils.id("WHITELIST_ROLE"),addr.address);
            expect(await instanceWhitelistedHexTechPresale.hasRole(ethers.utils.id("WHITELIST_ROLE"), addr.address)).to.be.true;
            await instanceWETHToken.mint(addr.address, amountBuy);
            await instanceWETHToken.connect(addr).approve(instanceWhitelistedHexTechPresale.address,amountApproved);
            await instanceWhitelistedHexTechPresale.connect(addr).buyTokens(amountBuy);
          }

          const presaleResultAgain = await instanceWhitelistedHexTechPresale.presaleResult();
          console.log(presaleResultAgain);
          
          await expect(instanceWhitelistedHexTechPresale.buyTokens(ethers.utils.parseUnits('0.02','ether'))).to.be.revertedWith('hardcap has been reached');          
        });
      });

      describe('icoNotActive() modifier', function () {

        it('should not allow owner to change rate when ico is active', async function () {
          await expect(instanceWhitelistedHexTechPresale.setRate(400)).to.be.revertedWith('Pre-Sale: ICO should not be active');
        });

        it('should not allow owner to change availableTokensICO when ico is active', async function () {
          await expect(instanceWhitelistedHexTechPresale.setAvailableTokensICO(ethers.utils.parseUnits('4000','ether'))).to.be.revertedWith('Pre-Sale: ICO should not be active');
        });

        it('should not allow user to claimTokens when ico is active', async function () {
          await expect(instanceWhitelistedHexTechPresale.connect(addr1).claimToken()).to.be.revertedWith('Pre-Sale: ICO should not be active');
        });

        it('should not allow user to claimRefund when ico is active', async function () {
          await expect(instanceWhitelistedHexTechPresale.connect(addr1).claimRefund()).to.be.revertedWith('Pre-Sale: ICO should not be active');
        });
      });

      describe('stopICO()', function () {

        it('should set endICO to 0', async function () {

          await instanceWhitelistedHexTechPresale.stopICO();
          expect(await instanceWhitelistedHexTechPresale.endICO()).to.be.equal(0);
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
              await instanceWhitelistedHexTechPresale.grantRole(ethers.utils.id("WHITELIST_ROLE"),addr.address);
              await instanceWETHToken.mint(addr.address, amountBuy);
              await instanceWETHToken.connect(addr).approve(instanceWhitelistedHexTechPresale.address,amountApproved);
              await instanceWhitelistedHexTechPresale.connect(addr).buyTokens(amountBuy);
            }

            await instanceWhitelistedHexTechPresale.stopICO();

          });

          it('should set presaleResult to true', async function () {
            expect(await instanceWhitelistedHexTechPresale.presaleResult()).to.be.true;
          });

          describe('presaleResult == true', function () {

            it('should allow claimToken', async function () {
              const tokenBought = await instanceWhitelistedHexTechPresale.TokenBought(addr1.address);
              await instanceWhitelistedHexTechPresale.connect(addr1).claimToken();

              expect(await instanceWhitelistedHexTechPresale.Claimed(addr1.address)).to.be.true;
              expect(await instanceHexTechToken.balanceOf(addr1.address)).to.be.equal(tokenBought);
            });

            it('should not allow claimToken if you already claimed', async function () {
              const tokenBought = await instanceWhitelistedHexTechPresale.TokenBought(addr1.address);
              await instanceWhitelistedHexTechPresale.connect(addr1).claimToken();

              await expect(instanceWhitelistedHexTechPresale.connect(addr1).claimToken()).to.be.revertedWith("Pre-Sale: You did claim your tokens!");
              expect(await instanceHexTechToken.balanceOf(addr1.address)).to.be.equal(tokenBought);
            });

            it('should not allow claimToken if you did not buyToken during presale', async function () {
              await expect(instanceWhitelistedHexTechPresale.connect(addr4).claimToken()).to.be.revertedWith("Pre-Sale: You didn't buy any tokens!");
            });

            it('should not allow claimRefund', async function () {
              await expect(instanceWhitelistedHexTechPresale.connect(addr4).claimRefund()).to.be.revertedWith("Pre-Sale has concluded: Cannot claim refund");
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
              await instanceWhitelistedHexTechPresale.grantRole(ethers.utils.id("WHITELIST_ROLE"),addr.address);
              await instanceWETHToken.mint(addr.address, amountBuy);
              await instanceWETHToken.connect(addr).approve(instanceWhitelistedHexTechPresale.address,amountApproved);
              await instanceWhitelistedHexTechPresale.connect(addr).buyTokens(amountBuy);
            }

            await instanceWhitelistedHexTechPresale.stopICO();

          });

          it('should keep presaleResult to false', async function () {
            
            expect(await instanceWhitelistedHexTechPresale.presaleResult()).to.be.false;
          });

          describe('presaleResult == false', function () {

            it('should allow claimRefund', async function () {
              const coinPaid = await instanceWhitelistedHexTechPresale.CoinPaid(addr1.address);
              await instanceWhitelistedHexTechPresale.connect(addr1).claimRefund();

              expect(await instanceWhitelistedHexTechPresale.Claimed(addr1.address)).to.be.true;
              expect(await instanceWETHToken.balanceOf(addr1.address)).to.be.equal(coinPaid);
            });

            it('should not allow claimRefund if you already claimed', async function () {
              const coinPaid = await instanceWhitelistedHexTechPresale.CoinPaid(addr1.address);
              await instanceWhitelistedHexTechPresale.connect(addr1).claimRefund();

              await expect(instanceWhitelistedHexTechPresale.connect(addr1).claimRefund()).to.be.revertedWith("Pre-Sale: You did claim your refund!");
              expect(await instanceWETHToken.balanceOf(addr1.address)).to.be.equal(coinPaid);
            });

            it('should not allow claimRefund if you did not buyToken during presale', async function () {
              await expect(instanceWhitelistedHexTechPresale.connect(addr4).claimRefund()).to.be.revertedWith("Pre-Sale: You didn't buy any tokens!");
            });

            it('should not allow claimToken', async function () {
              await expect(instanceWhitelistedHexTechPresale.connect(addr4).claimToken()).to.be.revertedWith("Pre-Sale has not concluded: Cannot claim token");
            });
          });
        });
      });
    });
  });
});
