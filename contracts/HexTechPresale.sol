// SPDX-License-Identifier: MIT

/**
 *                                                                                @
 *                                                                               @@@
 *                          @@@@@@@                     @@@@@@@@                @ @ @
 *                   @@@@@@@@@@@@@@@@@@@@         @@@@@@@@@@@@@@@@@@@@           @@@
 *                @@@@@@@@@@@@@@@@@@@@@@@@@@@  @@@@@@@@@@@@@@@@@@@@@@@@@@         @
 *
 *    @@@@@@@@     @@@@@@@@@    @@@@@@@@@@    @@@@@@@       @@@      @@@@@  @@     @@@@@@@@@@
 *    @@@@@@@@@@   @@@@@@@@@@   @@@@@@@@@@   @@@@@@@@@      @@@       @@@   @@@    @@@@@@@@@@
 *    @@@     @@@  @@@     @@@  @@@     @@  @@@     @@@    @@@@@      @@@   @@@@   @@@     @@
 *    @@@     @@@  @@@     @@@  @@@         @@@            @@@@@      @@@   @@@@   @@@
 *    @@@@@@@@@@   @@@@@@@@@@   @@@    @@    @@@@@@@      @@@ @@@     @@@   @@@@   @@@    @@
 *    @@@@@@@@     @@@@@@@@     @@@@@@@@@     @@@@@@@     @@@ @@@     @@@   @@@@   @@@@@@@@@
 *    @@@          @@@   @@@    @@@    @@          @@@   @@@   @@@    @@@   @@@@   @@@    @@
 *    @@@  @@@@    @@@   @@@    @@@                 @@@  @@@   @@@    @@@   @@@@   @@@
 *    @@@   @@@    @@@    @@@   @@@     @@  @@@     @@@  @@@@@@@@@    @@@   @@     @@@     @@
 *    @@@    @@    @@@    @@@   @@@@@@@@@@   @@@@@@@@    @@@   @@@    @@@      @@  @@@@@@@@@@
 *   @@@@@     @  @@@@@   @@@@  @@@@@@@@@@    @@@@@@    @@@@@ @@@@@  @@@@@@@@@@@@  @@@@@@@@@@
 *
 *                @@@@@@@@@@@@@@@@@@@@@@@@@@  @@@@@@@@@@@@@@@@@@@@@@@@@@@@
 *                   @@@@@@@@@@@@@@@@@@@@        @@@@@@@@@@@@@@@@@@@@@
 *                        @@@@@@@@@@                 @@@@@@@@@@@@
 *
 */

import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

pragma solidity ^0.8.0;
interface IHexTechToken is IERC20 {

    function mint(address to, uint256 amount) external;

}

contract HexTechPresale is ReentrancyGuard, Context, Ownable {

    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    uint256 public rate;
    uint256 private ratePrecision = 1000000;
    IHexTechToken private token;
    address private wallet;

    // Testnet: 0x0aECd741C69bBAa3920D4C6a32A2b01087677EE6
    // Mainnet: 0x55d398326f99059fF775485246999027B3197955 (BSC_USD)
    address public wethAddress;
    IERC20 private weth;

    uint256 public softCap;
    uint256 public hardCap;

    uint256 public poolPercent;

    uint256 public weiRaised;
    uint256 public endICO;
    uint256 public startICOBlock = 0;

    uint public minPurchase;
    uint public maxPurchase;
    uint public availableTokensICO;

    mapping (address => bool) public Claimed;
    mapping (address => uint256) public CoinPaid;
    mapping (address => uint256) public TokenBought;

    bool public presaleResult;

    event TokensPurchased(address indexed beneficiary, uint256 value, uint256 amount);
    event ICOStarted(uint startICOBlock, uint endBlock, uint minPurchase, uint maxPurchase, uint availableTokens, uint availableTokensICO, uint256 softCap, uint256 hardCap, uint256 poolPercent);
    event ICOEnded(uint endICO);
    event TokensClaimed(address indexed beneficiary, uint256 amount);
    event RefundClaimed(address indexed beneficiary, uint256 amount);
    event WethOrSaleTokenWithdrawn(address indexed wallet, IERC20 token, uint256 amount);

    constructor (uint256 _rate, address _wallet, IHexTechToken _token, address _wethAddress) {

        require(_rate > 0, "Pre-Sale: rate is 0");
        require(_wallet != address(0), "Pre-Sale: wallet is the zero address");
        require(address(_token) != address(0), "Pre-Sale: token is the zero address");
    
        rate = _rate;
        wallet = _wallet;
        token = _token;

        wethAddress = _wethAddress;

        // WETH Token
        IERC20 _weth = IERC20(_wethAddress);
        weth = _weth;

    }

    //Start Pre-Sale
    function startICO(uint _endBlock, uint _minPurchase, uint _maxPurchase, uint _availableTokens, uint256 _softCap, uint256 _hardCap, uint256 _poolPercent) external onlyOwner icoNotActive() {

        require(startICOBlock == 0, 'Presale has already started');
        require(_endBlock > block.number, 'Pre-Sale: duration should be > 0');
        require(_endBlock.sub(block.number) <= 200000, 'Pre-Sale: duration is too long');
        require(_availableTokens > 0, 'Pre-Sale: availableTokens should be > 0');
        require(_poolPercent > 0 && _poolPercent <= 100, 'Pre-Sale: poolPercent should be > 0 and <= 100');
        require(_minPurchase > 0, 'Pre-Sale: _minPurchase should > 0');
        require(_maxPurchase > _minPurchase, 'Pre-Sale: _maxPurchase should be > _minPurchase');
        require(_softCap > 0, 'Pre-Sale: _softCap should be > 0');
        require(_hardCap > _softCap, 'Pre-Sale: _hardCap should be > _softCap');

        startICOBlock = block.number;
        endICO = _endBlock;
        poolPercent = _poolPercent;
        availableTokensICO = _availableTokens.mul(_poolPercent).div(10**2);

        minPurchase = _minPurchase;
        maxPurchase = _maxPurchase;

        softCap = _softCap;
        hardCap = _hardCap;

        // Mint the tokens used in the presale to the presale contract
        token.mint(address(this), availableTokensICO);

        // Mint the rest to the wallet, as they are not used in the presale contract
        token.mint(wallet, _availableTokens.sub(availableTokensICO));

        emit ICOStarted(startICOBlock, endICO, minPurchase, maxPurchase, _availableTokens, availableTokensICO, softCap, hardCap, poolPercent);
    }

    function stopICO() external onlyOwner icoActive() {

        endICO = 0;

        emit ICOEnded(endICO);

    }

    function getCurrentBlock() external view returns (uint256) {
        return block.number;
    }
    
    function getEndICOBlock() external view returns (uint256) {
        require(endICO > 0, "Error: Presale has finished already");
        
        return endICO;
    }
    
    function getStartICOBlock() external view returns (uint256) {
        require(startICOBlock > 0, "Error: Presale has not started yet");
        
        return startICOBlock;
    }

    //Pre-Sale
    function buyTokens(uint256 amount) external nonReentrant icoActive {

        address beneficiary = _msgSender();

        uint256 weiAmount = amount;
        _preValidatePurchase(beneficiary, weiAmount);
        uint256 tokens = _getTokenAmount(weiAmount);

        weiRaised = weiRaised.add(weiAmount);
        availableTokensICO = availableTokensICO.sub(tokens);

        CoinPaid[beneficiary] = CoinPaid[beneficiary].add(weiAmount);
        TokenBought[beneficiary] = TokenBought[beneficiary].add(tokens);

        require(weth.transferFrom(beneficiary, address(this), weiAmount), 'Transfer failed');

        emit TokensPurchased(beneficiary, weiAmount, tokens);        
    }

    function _preValidatePurchase(address beneficiary, uint256 weiAmount) internal virtual view {

        require(weiAmount >= minPurchase, 'You have to send at least: minPurchase');
        require(weiAmount <= maxPurchase, 'You have to send max: maxPurchase');
        require(CoinPaid[beneficiary].add(weiAmount) <= maxPurchase, 'You cannot contribute more than maxPurchase');
        require(weiRaised.add(weiAmount) <= hardCap, 'The hardcap has been reached');

        this;
    }

    function claimToken() external icoNotActive() {

        address beneficiary = _msgSender();

        require(weiRaised >= softCap, "Softcap not reached");
        require(Claimed[beneficiary] == false, "Pre-Sale: You did claim your tokens!");
        require(TokenBought[beneficiary] > 0, "Pre-Sale: You didn't buy any tokens!");
        Claimed[beneficiary] = true;

        _processPurchase(beneficiary, TokenBought[beneficiary]);

        emit TokensClaimed(beneficiary, TokenBought[beneficiary]);
    }

    function claimRefund() external icoNotActive() {

        address beneficiary = _msgSender();

        require(CoinPaid[beneficiary] > 0, "Pre-Sale: You didn't buy any tokens!");
        require(weiRaised < softCap, "Softcap reached");
        require(Claimed[beneficiary] == false, "Pre-Sale: You did claim your refund!");
        
        Claimed[beneficiary] = true;

        weth.transfer(beneficiary, CoinPaid[beneficiary]);

        emit RefundClaimed(beneficiary, CoinPaid[beneficiary]);
    }

    function _deliverTokens(address beneficiary, uint256 tokenAmount) internal {

        token.transfer(beneficiary, tokenAmount);
    }


    function _processPurchase(address beneficiary, uint256 tokenAmount) internal {

        _deliverTokens(beneficiary, tokenAmount);
    }


    function _getTokenAmount(uint256 weiAmount) internal view returns (uint256) {

        return weiAmount.mul(rate);
    }

    function withdraw() external onlyOwner {

        require(address(this).balance > 0, 'Pre-Sale: Contract has no money');
        payable(wallet).transfer(address(this).balance);
    }

    function withdrawWethOrSaleToken() external onlyOwner icoNotActive {
        if(weiRaised >= softCap) {
            // Transfer out weth as sale is successful
            uint256 withdrawWethAmount = weth.balanceOf(address(this));
            weth.transfer(wallet, withdrawWethAmount);

            emit WethOrSaleTokenWithdrawn(wallet, weth, withdrawWethAmount);

        } else {
            // Transfer out hex token as sale failed
            uint256 withdrawTokenAmount = token.balanceOf(address(this));
            token.transfer(wallet, withdrawTokenAmount);

            emit WethOrSaleTokenWithdrawn(wallet, token, withdrawTokenAmount);
        }
    }

    function getToken() external view returns (IERC20) {

        return token;
    }


    function getWallet() external view returns (address) {

        return wallet;
    }


    function getRate() external view returns (uint256) {

        return rate;
    }

    function setRate(uint256 newRate) external onlyOwner icoNotActive() {

        rate = newRate;
    }

    function getAvailableTokensICO() external view returns (uint256) {

        return availableTokensICO;
    } 

    modifier icoActive() {

        require(endICO > 0 && block.number <= endICO, "Pre-Sale: ICO must be active");
        _;
    }

    modifier icoNotActive() {

        require(endICO < block.number, 'Pre-Sale: ICO should not be active');
        _;
    }

}