// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IWeeeToken {
    function claimWeee(address userAddress, uint256 amount) external;

    function burnWeee(address userAddress, uint256 amount) external;
}
