//SPDX-License-Identifier: MIT
pragma solidity >=0.5.0 <0.9.0;
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * Interface for the FakeNFTMarketplace
 */
interface IfakeNFTMarket {
    function getprice() external view returns (uint256);

    function available(uint _tokenId) external payable returns (bool);

    function purchase(uint _tokenId) external payable;
}

/**
 * Minimal interface for CryptoDevsNFT containing only two functions
 * that we are interested in
 */
interface IFalconDevsdao {
    /// @dev balanceOf returns the number of NFTs owned by the given address
    /// @param _owner - address to fetch number of NFTs for
    /// @return Returns the number of NFTs owned
    function balanceof(address _owner) external view returns (uint);

    /// @dev tokenOfOwnerByIndex returns a tokenID at given index for owner
    /// @param _owner - address to fetch the NFT TokenID for
    /// @param index - index of NFT in owned tokens array to fetch
    /// @return Returns the TokenID of the NFT
    function tokenOfOwnerByIndex(
        address _owner,
        uint index
    ) external view returns (uint);
}

contract FalconDevsDAO is Ownable {
    // Create a struct named Proposal containing all relevant information
    struct Proposal {
        // nftTokenId - the tokenID of the NFT to purchase from FakeNFTMarketplace if the proposal passes
        uint NFTtokenId;
        // deadline - the UNIX timestamp until which this proposal is active. Proposal can be executed after the deadline has been exceeded.
        uint deadline;
        // yesVotes - number of yay votes for this proposal
        uint yesvote;
        // n0Votes - number of nay votes for this proposal
        uint novotes;
        // executed - whether or not this proposal has been executed yet. Cannot be executed before the deadline has been exceeded.
        bool executed;
        // voters - a mapping of CryptoDevsNFT tokenIDs to booleans indicating whether that NFT has already been used to cast a vote or not
        mapping(uint => bool) voters;
    }
    // Create a mapping of ID to Proposal
    mapping(uint => Proposal) public proposals;
    uint public num_of_proposals;

    //create instance of IfakeNFTMarket
    IfakeNFTMarket fakenftMarkeplace;
    //create instance of  IFalconDevsdao
    IFalconDevsdao FalconDevsdao;

    // Create a payable constructor which initializes the contract
    // instances for FakeNFTMarketplace and CryptoDevsNFT
    // The payable allows this constructor to accept an ETH deposit when it is being deployed
    constructor(address _nftmarketplace, address _falcondev) payable {
        fakenftMarkeplace = IfakeNFTMarket(_nftmarketplace);
        FalconDevsdao = IFalconDevsdao(_falcondev);
    }

    // Create a modifier which only allows a function to be
    // called by someone who owns at least 1 CryptoDevsNFT
    modifier nftHolderOnly() {
        require(FalconDevsdao.balanceof(msg.sender) > 0, "Not a DOA Member");
        _;
    }

    /// @dev createProposal allows a CryptoDevsNFT holder to create a new proposal in the DAO
    /// @param _nftTokenId - the tokenID of the NFT to be purchased from FakeNFTMarketplace if this proposal passes
    /// @return Returns the proposal index for the newly created proposal

    function createProposal(
        uint _nftTokenId
    ) external nftHolderOnly returns (uint) {
        require(fakenftMarkeplace.available(_nftTokenId), "NOT for Sale");
        Proposal storage proposal = proposals[num_of_proposals];
        proposal.NFTtokenId = _nftTokenId;
        proposal.deadline = block.timestamp + 5 minutes;
        num_of_proposals++;
        return num_of_proposals--;
    }

    // Create a modifier which only allows a function to be
    // called if the given proposal's deadline has not been exceeded yet
    modifier activeProposalOnly(uint _proposalsindex) {
        require(
            proposals[_proposalsindex].deadline > block.timestamp,
            "Deadline Exceeded"
        );
        _;
    }
    // Create an enum named Vote containing possible options for a vote
    enum Vote {
        yes, //0
        no //1
    }

    /// @dev voteOnProposal allows a CryptoDevsNFT holder to cast their vote on an active proposal
    /// @param proposalIndex - the index of the proposal to vote on in the proposals array
    /// @param vote - the type of vote they want to cast
    function voteOnProposal(
        uint proposalIndex,
        Vote vote
    ) external nftHolderOnly activeProposalOnly(proposalIndex) {
        Proposal storage proposal = proposals[proposalIndex];
        uint Nftvoter_balance = FalconDevsdao.balanceof(msg.sender);
        uint numvotes = 0;
        for (uint i = 0; i < Nftvoter_balance; i++) {
            uint tokenId = FalconDevsdao.tokenOfOwnerByIndex(msg.sender, i);
            if (proposal.voters[tokenId] == false) {
                numvotes++;
                proposal.voters[tokenId] == true;
            }
        }
        require(numvotes > 0, "Already voted");
        if (vote == Vote.yes) {
            proposal.yesvote += numvotes;
        } else {
            proposal.novotes += numvotes;
        }
    }

    // Create a modifier which only allows a function to be
    // called if the given proposals' deadline HAS been exceeded
    // and if the proposal has not yet been executed
    modifier inActiveProposal(uint proposalIndex) {
        require(
            proposals[proposalIndex].deadline <= block.timestamp,
            "Deadline Not Exceeded"
        );
        require(
            proposals[proposalIndex].executed == false,
            "Proposal Not executed"
        );
        _;
    }

    /// @dev executeProposal allows any CryptoDevsNFT holder to execute a proposal after it's deadline has been exceeded
    /// @param _proposalIndex - the index of the proposal to execute in the proposals array
    function executeProposal(
        uint _proposalIndex
    ) external nftHolderOnly inActiveProposal(_proposalIndex) {
        Proposal storage proposal = proposals[_proposalIndex];
        // If the proposal has more YAY votes than NAY votes
        // purchase the NFT from the FakeNFTMarketplac
        if (proposal.yesvote > proposal.novotes) {
            uint nftprice = fakenftMarkeplace.getprice();
            require(address(this).balance >= nftprice, "Not enough funds");
            fakenftMarkeplace.purchase{value: nftprice}(proposal.NFTtokenId);
        }
        proposal.executed = true;
    }

    /// @dev withdrawEther allows the contract owner (deployer) to withdraw the ETH from the contract
    function withdraw() external onlyOwner {
        uint amount = address(this).balance;
        require(amount > 0, "Balance Empty");
        payable(owner()).transfer(amount);
    }

    // The following two functions allow the contract to accept ETH deposits
    // directly from a wallet without calling a function
    receive() external payable {}

    fallback() external payable {}
}
