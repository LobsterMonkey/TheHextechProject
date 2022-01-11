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
interface IUniswapV2Factory {

    event PairCreated(address indexed token0, address indexed token1, address pair, uint);

    function feeTo() external view returns (address);
    function feeToSetter() external view returns (address);

    function getPair(address tokenA, address tokenB) external view returns (address pair);
    function allPairs(uint) external view returns (address pair);
    function allPairsLength() external view returns (uint);

    function createPair(address tokenA, address tokenB) external returns (address pair);

    function setFeeTo(address) external;
    function setFeeToSetter(address) external;
}

interface IUniswapV2Pair {

    event Approval(address indexed owner, address indexed spender, uint value);
    event Transfer(address indexed from, address indexed to, uint value);

    function name() external pure returns (string memory);
    function symbol() external pure returns (string memory);
    function decimals() external pure returns (uint8);
    function totalSupply() external view returns (uint);
    function balanceOf(address owner) external view returns (uint);
    function allowance(address owner, address spender) external view returns (uint);

    function approve(address spender, uint value) external returns (bool);
    function transfer(address to, uint value) external returns (bool);
    function transferFrom(address from, address to, uint value) external returns (bool);

    function DOMAIN_SEPARATOR() external view returns (bytes32);
    function PERMIT_TYPEHASH() external pure returns (bytes32);
    function nonces(address owner) external view returns (uint);

    function permit(address owner, address spender, uint value, uint deadline, uint8 v, bytes32 r, bytes32 s) external;

    event Burn(address indexed sender, uint amount0, uint amount1, address indexed to);
    event Swap(
        address indexed sender,
        uint amount0In,
        uint amount1In,
        uint amount0Out,
        uint amount1Out,
        address indexed to
    );
    event Sync(uint112 reserve0, uint112 reserve1);

    function MINIMUM_LIQUIDITY() external pure returns (uint);
    function factory() external view returns (address);
    function token0() external view returns (address);
    function token1() external view returns (address);
    function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast);
    function price0CumulativeLast() external view returns (uint);
    function price1CumulativeLast() external view returns (uint);
    function kLast() external view returns (uint);

    function burn(address to) external returns (uint amount0, uint amount1);
    function swap(uint amount0Out, uint amount1Out, address to, bytes calldata data) external;
    function skim(address to) external;
    function sync() external;

    function initialize(address, address) external;
}

interface IUniswapV2Router01 {

    function factory() external pure returns (address);
    function WETH() external pure returns (address);

    function addLiquidity(
        address tokenA,
        address tokenB,
        uint amountADesired,
        uint amountBDesired,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline
    ) external returns (uint amountA, uint amountB, uint liquidity);
    function addLiquidityETH(
        address token,
        uint amountTokenDesired,
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline
    ) external payable returns (uint amountToken, uint amountETH, uint liquidity);
    function removeLiquidity(
        address tokenA,
        address tokenB,
        uint liquidity,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline
    ) external returns (uint amountA, uint amountB);
    function removeLiquidityETH(
        address token,
        uint liquidity,
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline
    ) external returns (uint amountToken, uint amountETH);
    function removeLiquidityWithPermit(
        address tokenA,
        address tokenB,
        uint liquidity,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline,
        bool approveMax, uint8 v, bytes32 r, bytes32 s
    ) external returns (uint amountA, uint amountB);
    function removeLiquidityETHWithPermit(
        address token,
        uint liquidity,
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline,
        bool approveMax, uint8 v, bytes32 r, bytes32 s
    ) external returns (uint amountToken, uint amountETH);
    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);
    function swapTokensForExactTokens(
        uint amountOut,
        uint amountInMax,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);
    function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline)
        external
        payable
        returns (uint[] memory amounts);
    function swapTokensForExactETH(uint amountOut, uint amountInMax, address[] calldata path, address to, uint deadline)
        external
        returns (uint[] memory amounts);
    function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline)
        external
        returns (uint[] memory amounts);
    function swapETHForExactTokens(uint amountOut, address[] calldata path, address to, uint deadline)
        external
        payable
        returns (uint[] memory amounts);

    function quote(uint amountA, uint reserveA, uint reserveB) external pure returns (uint amountB);
    function getAmountOut(uint amountIn, uint reserveIn, uint reserveOut) external pure returns (uint amountOut);
    function getAmountIn(uint amountOut, uint reserveIn, uint reserveOut) external pure returns (uint amountIn);
    function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts);
    function getAmountsIn(uint amountOut, address[] calldata path) external view returns (uint[] memory amounts);
}

interface IUniswapV2Router02 is IUniswapV2Router01 {

    function removeLiquidityETHSupportingFeeOnTransferTokens(
        address token,
        uint liquidity,
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline
    ) external returns (uint amountETH);
    function removeLiquidityETHWithPermitSupportingFeeOnTransferTokens(
        address token,
        uint liquidity,
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline,
        bool approveMax, uint8 v, bytes32 r, bytes32 s
    ) external returns (uint amountETH);

    function swapExactTokensForTokensSupportingFeeOnTransferTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external;
    function swapExactETHForTokensSupportingFeeOnTransferTokens(
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external payable;
    function swapExactTokensForETHSupportingFeeOnTransferTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external;
}

interface IHexTechToken is IERC20 {

    function mint(address to, uint256 amount) external;

}

contract HexTechPresale is ReentrancyGuard, Context, Ownable {
    /* AggregatorV3Interface internal priceFeed; */

    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    uint256 public rate;
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

    // PancakeSwap(Uniswap) Router and Pair Address
    IUniswapV2Router02 public immutable uniswapV2Router;

    event TokensPurchased(address indexed purchaser, address indexed beneficiary, uint256 value, uint256 amount);

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

        // PancakeSwap Router address:
        // (BSC testnet) 0xD99D1c33F9fC3444f8101754aBC46c52416550D1
        // (BSC mainnet) V2 0x10ED43C718714eb63d5aA57B78B54704E256024E
        IUniswapV2Router02 _uniswapV2Router = IUniswapV2Router02(0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff);
        uniswapV2Router = _uniswapV2Router;
        /* priceFeed = AggregatorV3Interface(0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526); */

        // Grant the contract deployer the default admin role: it will be able
        // to grant and revoke any roles

    }

    receive() external payable {

    }
    fallback() external payable {

    }

    //Start Pre-Sale
    function startICO(uint _endBlock, uint _minPurchase, uint _maxPurchase, uint _availableTokens, uint256 _softCap, uint256 _hardCap, uint256 _poolPercent) external onlyOwner icoNotActive() {

        require(startICOBlock == 0, 'Presale has already started');
        require(_endBlock > block.number, 'Pre-Sale: duration should be > 0');
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

        token.mint(address(this), _availableTokens);
    }

    function stopICO() external onlyOwner icoActive() {

        endICO = 0;

    }

    function getCurrentBlock() public view returns (uint256) {
        return block.number;
    }
    
    function getEndICOBlock() public view returns (uint256) {
        require(endICO > 0, "Error: Presale has finished already");
        
        return endICO;
    }
    
    function getStartICOBlock() public view returns (uint256) {
        require(startICOBlock > 0, "Error: Presale has not started yet");
        
        return startICOBlock;
    }

    //Pre-Sale
    function buyTokens(uint256 amount) public nonReentrant icoActive {

        address beneficiary = msg.sender;

        require(amount < weth.allowance(beneficiary, address(this)), 'You need to approve WETH');

        uint256 weiAmount = amount;
        _preValidatePurchase(beneficiary, weiAmount);
        uint256 tokens = _getTokenAmount(weiAmount);

        weiRaised = weiRaised.add(weiAmount);
        availableTokensICO = availableTokensICO.sub(tokens);

        Claimed[beneficiary] = false;
        CoinPaid[beneficiary] = CoinPaid[beneficiary].add(weiAmount);
        TokenBought[beneficiary] = TokenBought[beneficiary].add(tokens);

        require(weth.transferFrom(beneficiary, address(this), weiAmount), 'Transfer failed');

        emit TokensPurchased(_msgSender(), beneficiary, weiAmount, tokens);        
    }

    function _preValidatePurchase(address beneficiary, uint256 weiAmount) internal virtual view {

        require(beneficiary != address(0), "Pre-Sale: beneficiary is the zero address");
        require(weiAmount != 0, "Pre-Sale: weiAmount is 0");
        require(weiAmount >= minPurchase, 'You have to send at least: minPurchase');
        require(weiAmount <= maxPurchase, 'You have to send max: maxPurchase');
        require(CoinPaid[beneficiary].add(weiAmount) <= maxPurchase, 'You cannot contribute more than maxPurchase');
        require(weiRaised.add(weiAmount) <= hardCap, 'The hardcap has been reached');

        this;
    }

    function claimToken() public icoNotActive() {

        address beneficiary = msg.sender;

        require(weiRaised >= softCap, "Softcap not reached");
        require(presaleResult == true, "Pre-Sale has not concluded: Cannot claim token");
        require(Claimed[beneficiary] == false, "Pre-Sale: You did claim your tokens!");
        require(TokenBought[beneficiary] > 0, "Pre-Sale: You didn't buy any tokens!");
        Claimed[beneficiary] = true;

        _processPurchase(beneficiary, TokenBought[beneficiary]);

    }

    function claimRefund() public icoNotActive() {

        address beneficiary = msg.sender;

        require(weiRaised < softCap, "Softcap reached");
        require(presaleResult == false, "Pre-Sale has concluded: Cannot claim refund");
        require(Claimed[beneficiary] == false, "Pre-Sale: You did claim your refund!");
        require(CoinPaid[beneficiary] > 0, "Pre-Sale: You didn't buy any tokens!");
        Claimed[beneficiary] = true;

        weth.transfer(beneficiary, CoinPaid[beneficiary]);
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
        weth.transfer(wallet, weth.balanceOf(this));
        } else {
        // Transfer out hex token as sale failed
        token.transfer(wallet, token.balanceOf(this));
        }
    }

    function getToken() public view returns (IERC20) {

        return token;
    }


    function getWallet() public view returns (address) {

        return wallet;
    }


    function getRate() public view returns (uint256) {

        return rate;
    }

    function setRate(uint256 newRate) public onlyOwner icoNotActive() {

        rate = newRate;
    }

    function setAvailableTokensICO(uint256 amount) public onlyOwner icoNotActive() {

        availableTokensICO = amount;
    }

    function getAvailableTokensICO() public view returns (uint256) {

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