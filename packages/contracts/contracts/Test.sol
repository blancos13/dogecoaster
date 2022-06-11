// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Test is ERC20, Ownable, AccessControl {
    bytes32 public constant TEST_ROLE = keccak256("TEST_ROLE"); // Either an arcade game, or the arcade prize nft contract

    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(TEST_ROLE, msg.sender);
    }

    function transfer() public pure {
        revert("TEST is not transferrable");
    }

    function transferFrom() public pure {
        revert("TEST is not transferrable");
    }

    function claimTest(address userAddress, uint256 amount) public onlyRole(TEST_ROLE) {
        // to do
        _mint(userAddress, amount);
    }

    function burnTest(address userAddress, uint256 amount) public onlyRole(TEST_ROLE) {
        _burn(userAddress, amount);
    }

    function buyTest() public payable {
        _mint(msg.sender, msg.value);
    }

    function stringToBytes(string memory _a) public pure returns (bytes memory) {
        return (bytes(_a));
    }
}
