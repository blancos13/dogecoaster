// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IWeeeToken.sol";

contract Weee is ERC20, IWeeeToken, Ownable, AccessControl {
    bytes32 public constant MINTER_BURNER_ROLE = keccak256("MINTER_BURNER_ROLE"); // Either an arcade game, or the arcade prize nft contract

    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function transfer() public pure {
        revert("WEEE is not transferrable");
    }

    function transferFrom() public pure {
        revert("WEEE is not transferrable");
    }

    function claimWeee(address userAddress, uint256 amount) public override onlyRole(MINTER_BURNER_ROLE) {
        // to do
        _mint(userAddress, amount);
    }

    function burnWeee(address userAddress, uint256 amount) public override onlyRole(MINTER_BURNER_ROLE) {
        _burn(userAddress, amount);
    }

    function buyWeee() public payable {
        _mint(msg.sender, msg.value);
    }

    function withdrawSD(address payable _destination, uint256 _amount) public onlyOwner {
        (bool success, ) = _destination.call{value: _amount}("");
        require(success == true, "Couldn't transfer SD");
        return;
    }
}
