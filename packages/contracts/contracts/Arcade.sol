// SPDX-License-Identifier:UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./interfaces/IWeeeToken.sol";

contract ArcadeNFT is Ownable, ERC721("ArcadeNFT", "ANFT") {
    uint256 tokenId;
    mapping(address => tokenMetaData[]) public ownershipRecord;
    mapping(uint256 => uint256) public idToCost;
    mapping(uint256 => string) public idToUri;

    event NewPurchase(address _user, uint256 _tokenId, uint256 _tokenCost);

    struct tokenMetaData {
        uint256 tokenId;
    }

    IWeeeToken public WeeeToken;

    constructor(address weeeAddress) {
        WeeeToken = IWeeeToken(weeeAddress);
    }

    function mint(uint256 weeeCost, string memory uri) public onlyOwner {
        _safeMint(address(this), tokenId);
        ownershipRecord[address(this)].push(tokenMetaData(tokenId));
        idToCost[tokenId] = weeeCost;
        idToUri[tokenId] = uri;
        tokenId = tokenId + 1;
    }

    function burn(uint256 tokenIdToBurn) public onlyOwner {
        address tokenOwner = ERC721.ownerOf(tokenIdToBurn);
        require(tokenOwner == address(this), "Cannot be burned: Someone already owns this token");
        _burn(tokenIdToBurn);
    }

    function updateUri(uint256 tokenIdToUpdate, string memory newUri) public onlyOwner {
        idToUri[tokenIdToUpdate] = newUri;
    }

    function buyNFT(uint256 tokenIdToBuy) public {
        address tokenOwner = ERC721.ownerOf(tokenId);
        require(tokenOwner == address(this), "Cannot buy this token: Owned by someone else");

        address sender = msg.sender;
        uint256 tokenCost = idToCost[tokenIdToBuy];

        WeeeToken.burnWeee(sender, tokenCost);

        safeTransferFrom(address(this), sender, tokenIdToBuy);

        emit NewPurchase(msg.sender, tokenIdToBuy, tokenCost);
    }
}
