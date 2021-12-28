// SPDX-License-Identifier: MIT

pragma solidity 0.8.6;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract HexTechToken is ERC20 {

    constructor() ERC20("HexTech Token", "HEXTECH") {
    }

    function mint(address to, uint amount) external {
        _mint(to, amount);
    }
}
