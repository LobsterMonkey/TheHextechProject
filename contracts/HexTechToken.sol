// SPDX-License-Identifier: MIT

pragma solidity 0.8.6;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";

contract HexTechToken is ERC20, AccessControlEnumerable {

    using SafeMath for uint256;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
         _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
    }

    function mint(address to, uint amount) external onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }

    function burn(address account, uint amount) external onlyRole(BURNER_ROLE) {
        _burn(account, amount);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual override {
        
        if (from != address(0) && to != address(0) && !hasRole(MINTER_ROLE, _msgSender())) {
            //transfer
            uint256 tokensToBurn = amount.div(100);
            amount = amount.sub(tokensToBurn);

            _burn(_msgSender(), tokensToBurn);
        }

        super._beforeTokenTransfer(from, to, amount);
    }
}
