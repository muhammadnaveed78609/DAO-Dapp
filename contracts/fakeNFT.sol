//SPDX-License-Identifier: MIT
pragma solidity >=0.5.0 <0.9.0;

contract fakeNFT {
    /// @dev Maintain a mapping of Fake TokenID to Owner addresses
    mapping(uint => address) public tokens;
    uint public price = 0.1 ether;

    /// @dev purchase() accepts ETH and marks the owner of the given tokenId as the caller address
    /// @param _tokensId - the fake NFT token Id to purchase
    function purchase(uint _tokensId) external payable {
        require(msg.value == price, "You cannot sent correct price ");
        tokens[_tokensId] = msg.sender;
    }

    /// @dev getPrice() returns the price of one NFT
    function getprice() external view returns (uint) {
        return price;
    }

    /// @dev available() checks whether the given tokenId has already been sold or not
    /// @param _tokenId - the tokenId to check for
    function available(uint _tokenId) external view returns (bool) {
        // address(0) = 0x0000000000000000000000000000000000000000
        // This is the default value for addresses in Solidity
        if (tokens[_tokenId] == address(0)) {
            return true;
        } else {
            return false;
        }
    }
}
