import Head from "next/head";
import Image from "next/image";
import { Inter } from "@next/font/google";
import styles from "../styles/Home.module.css";
import React, { useState, useRef, useEffect } from "react";
import { Contract, utils, providers } from "ethers";
import Web3Modal from "web3modal";
import { formatEther } from "ethers/lib/utils";
import {
  abi_FalconDAO,
  abi_fakeNFT,
  FAKENFT,
  FALCONDEVDAO,
} from "../../constant/constant";
const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const web3ModalRef = useRef();
  const [walletConnect, setWalletConnect] = useState(false);
  const [Treasurybalance, setTreasurybalance] = useState("0");
  const [selectedTab, setselectedTab] = useState("");
  const [proposals, setProposls] = useState([]);
  const [Owner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(false);
  const [UserNFTBalance, setUserNFTBalance] = useState(0);
  const [NumberOfProposal, setNumberOfProposal] = useState("0");
  const [fake__nftTokenId, setfake__nftTokenId] = useState();
  // Helper function to fetch a Provider/Signer instance from Metamask
  const getProviderorSigner = async (needsigner = false) => {
    const provider = await web3ModalRef.current.connect();
    const web3provider = new providers.Web3Provider(provider);
    if (!needsigner) {
      const signer = web3provider.getSigner();
      return signer;
    }
    return web3provider;
  };
  // Helper function to return a DAO Contract instance
  // given a Provider/Signer
  const getDaoContractInstance = (ProviderorSigner) => {
    return new Contract(FALCONDEVDAO, abi_FalconDAO, ProviderorSigner);
  };
  // Helper function to return a FakeNFT Contract instance
  // given a Provider/Signer
  const getFakeNftContractInstance = (ProviderorSigner) => {
    return new Contract(FAKENFT, abi_fakeNFT, ProviderorSigner);
  };

  // Helper function to connect wallet
  const ConnectWallet = async () => {
    try {
      await getProviderorSigner();
      setWalletConnect(true);
    } catch (error) {
      console.error(error);
    }
  };

  /**
   * getOwner: gets the contract owner by connected address
   */
  const getDAOOwner = async () => {
    const signer = await getProviderorSigner(true);
    const contract = getDaoContractInstance(signer);
    const owner_add = await contract.owner();
    const signer_add = await signer.getAddress();
    if (owner_add.toLowerCase() === signer_add.toLowerCase()) {
      setIsOwner(true);
    }
  };

  /**
   * withdrawCoins: withdraws ether by calling
   * the withdraw function in the contract
   */
  const getwithdrawCoins = async () => {
    try {
      const provider = await getProviderorSigner();
      const contract = getDaoContractInstance(provider);
      const _withdrawcoins = await contract.withdraw();
      setLoading(true);
      await _withdrawcoins.wait();
      setLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  // Reads the balance of the user's CryptoDevs NFTs and sets the `nftBalance` state variable
  const getUserNFTBalance = async () => {
    try {
      const signer = await getProviderorSigner(true);
      const contract = getFakeNftContractInstance(signer);
      const balance = await contract.balanceof(signer.getAddress());
      setUserNFTBalance(balance);
    } catch (error) {
      console.error(error);
      window.alert(error);
    }
  };
  // Reads the number of proposals in the DAO contract and sets the `numProposals` state variable
  const getnumProposals = async () => {
    try {
      const provider = await getProviderorSigner();
      const contract = getDaoContractInstance(provider);
      const numProposals = await contract.num_of_proposals();
      setNumberOfProposal(numProposals.toString());
    } catch (error) {
      console.error(error);
    }
  };
  // Calls the `createProposal` function in the contract, using the tokenId from `fakeNftTokenId`
  const createProposal = async () => {
    try {
      const signer = await getProviderorSigner(true);
      const contract = getDaoContractInstance(signer);
      const _createProposal = await contract.createProposal(fake__nftTokenId);
      setLoading(true);
      await _createProposal.wait();
      await getnumProposals();
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  };
  // Reads the ETH balance of the DAO contract and sets the `treasuryBalance` state variable
  const getDAOTreasuryBalance = async () => {
    try {
      const provider = await getProviderorSigner();
      const balance = await provider.balanceof(FALCONDEVDAO);
      setTreasurybalance(balance.toString());
    } catch (error) {
      console.error(error);
    }
  };

  /**
   * withdrawCoins: withdraws ether by calling
   * the withdraw function in the contract
   */
  const withdrawDAOEthe = async () => {
    try {
      const signer = await getProviderorSigner(true);
      const contract = getDaoContractInstance(signer);
      const withdrawcoins = await contract.withdraw();
      setLoading(true);
      await withdrawcoins.wait();
      setLoading(false);
      getDAOTreasuryBalance();
    } catch (error) {
      console.error(error);
      window.alert(error);
    }
  };
  // Helper function to fetch and parse one proposal from the DAO contract
  // Given the Proposal ID
  // and converts the returned data into a Javascript object with values we can use
  const fetchProposalById = async (id) => {
    try {
      const provider = await getProviderorSigner();
      const contract = getDaoContractInstance(provider);
      const proposal = await contract.proposals(id);
      const parsedProposal = {
        proposalid: id,
        NftTokenId: proposal.NFTtokenId.toString(),
        deadline: new Date(parseInt(proposal.deadline.toString())),
        yesvote: proposal.yesvote.toStirng(),
        novote: proposal.novotes.toString(),
        executed: proposal.executed.toString(),
      };
      return parsedProposal;
    } catch (error) {
      console.error(error);
      window.alert(error);
    }
  };
  // Runs a loop `numProposals` times to fetch all proposals in the DAO
  // and sets the `proposals` state variable
  const fetchallproposals = async () => {
    const proposal_arr = [];
    for (let i = 0; i < NumberOfProposal; i++) {
      const proposals = await fetchProposalById(i);
      proposal_arr.push(proposals);
    }
    setProposls(proposal_arr);
    return proposal_arr;
  };
  // Calls the `voteOnProposal` function in the contract, using the passed
  // proposal ID and Vote
  const voteOnProposal = async (proposalIndex, _vote) => {
    try {
      const signer = await getProviderorSigner(true);
      const contract = getDaoContractInstance(signer);
      let vote = _vote == "YES" ? 0 : 1;
      const _voteOnProposal = await contract.voteOnProposal(
        proposalIndex,
        vote
      );
      setLoading(true);
      await _voteOnProposal.wait();
      setLoading(false);
    } catch (error) {
      console.error(error);
      window.alert(error);
    }
  };
  // Calls the `executeProposal` function in the contract, using
  // the passed proposal ID
  const executeProposal = async (_proposalIndex) => {
    try {
      const signer = await getProviderorSigner();
      const contract = getDaoContractInstance(signer);
      const _executeProposal = await contract.executeProposal(_proposalIndex);
      setLoading(true);
      await _executeProposal.wait();
      setLoading(false);
      await fetchallproposals();
      getDAOTreasuryBalance();
    } catch (error) {
      console.error(error);
      window.alert(error);
    }
  };
  // piece of code that runs everytime the value of `walletConnected` changes
  // so when a wallet connects or disconnects
  // Prompts user to connect wallet if not connected
  // and then calls helper functions to fetch the
  // DAO Treasury Balance, User NFT Balance, and Number of Proposals in the DAO
  useEffect(() => {
    if (!walletConnect) {
      web3ModalRef.current = new Web3Modal({
        network: "goerli",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      ConnectWallet().then(() => {
        getDAOTreasuryBalance();
        getUserNFTBalance();
        getDAOOwner();
        getnumProposals();
      });
    }
  }, walletConnect);
  // Piece of code that runs everytime the value of `selectedTab` changes
  // Used to re-fetch all proposals in the DAO when user switches
  // to the 'View Proposals' tab
  useEffect(() => {
    if (selectedTab === "View Proposals") {
      fetchallproposals();
    }
  }, [selectedTab]);
  // Render the contents of the appropriate tab based on `selectedTab`
  const renderTabs = () => {
    if (selectedTab == "Create Proposal") {
      return renderViewProposalsTab();
    } else if (selectedTab === "View Proposals") {
      return renderCreateProposalTab();
    }
    return null;
  };
  const renderCreateProposalTab = () => {
    if (loading) {
      <div className={styles.description}>
        Loading... Waiting for transaction...
      </div>;
    } else if (UserNFTBalance == 0) {
      <div className={styles.description}>
        You do not own any Falcon NFTs. <br />
        <b>You cannot create or vote on proposals</b>
      </div>;
    } else {
      return (
        <div className={styles.container}>
          <label>Fake NFT Token ID to Purchase: </label>
          <input
            placeholder="0"
            type="number"
            onChange={(e) => setfake__nftTokenId(e.target.value)}
          />
          <button className={styles.button2} onClick={createProposal}>
            Create
          </button>
        </div>
      );
    }
  };
  // Renders the 'View Proposals' tab content
  const renderViewProposalsTab = () => {
    if (loading) {
      return (
        <div className={styles.description}>
          Loading... Waiting for transaction...
        </div>
      );
    } else if (proposals.length == 0) {
      return (
        <div className={styles.description}>No proposals have been created</div>
      );
    } else {
      return (
        <div>
          {proposals.map((p, index) => (
            <div key={index} className={styles.proposalCard}>
              <p>Proposal ID: {p.proposalid}</p>
              <p>Fake User NFT Balance: {p.NftTokenId}</p>
              <p>Deadline: {p.deadline.toLocaleString()}</p>
              <p>Yes Votes: {p.yesvote}</p>
              <p>No Votes: {p.novote}</p>
              <p>Executes?: {p.executed.toStirng()}</p>
              {p.deadline.getTime() > Date.now() && !p.executed ? (
                <div className={styles.flex}>
                  <button
                    className={styles.button2}
                    onClick={() => voteOnProposal(p.proposalId, "YES")}
                  >
                    Vote YES
                  </button>
                  <button
                    className={styles.button2}
                    onClick={() => voteOnProposal(p.proposalId, "NO")}
                  >
                    Vote NAY
                  </button>
                </div>
              ) : p.deadline.getTime() < Date.now() && !p.executed ? (
                <div className={styles.flex}>
                  <button
                    className={styles.button2}
                    onClick={() => executeProposal(p.proposalId)}
                  >
                    Execute Proposal
                    {p.yayVotes > p.nayVotes ? "(YES)" : "(NO)"}
                  </button>
                </div>
              ) : (
                <div className={styles.description}>Proposal Executed</div>
              )}
            </div>
          ))}
        </div>
      );
    }
  };
  return (
    <>
      <div className={styles.headdiv}>
        <Head>
          <title>Falcon DAO</title>
          <meta name="description" content="CryptoDevs DAO" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <div className={styles.falcon}>Falcon IT Consulting</div>
        <div className={styles.main}>
          <div className={styles.main1}>
            <div className={styles.parentdiv}>
              <h1 className={styles.title}>Welcome Falcon Devs!</h1>
              <div className={styles.description}>Welcome to the DAO!</div>
              <div className={styles.description}>
                Your CryptoDevs NFT Balance: {UserNFTBalance}
                <br />
                Treasury Balance: {formatEther(Treasurybalance)} ETH
                <br />
                Total Number of Proposals: {NumberOfProposal}
              </div>
              <div className={styles.flex}>
                <button
                  className={styles.button2}
                  onClick={() => setselectedTab("Create Proposal")}
                >
                  Create Proposal
                </button>
                <button
                  className={styles.button}
                  onClick={() => setselectedTab("View Proposals")}
                >
                  View Proposals
                </button>
              </div>
              {renderTabs()}
              {Owner ? (
                <div>
                  {loading ? (
                    <button className={styles.button}>Loading...</button>
                  ) : (
                    <button className={styles.button} onClick={withdrawDAOEthe}>
                      Withdraw DAO ETH
                    </button>
                  )}
                </div>
              ) : (
                ""
              )}
            </div>
          </div>
          <div>
            <img className={styles.image} src="/Falcon.svg" />
          </div>
        </div>
        <footer className={styles.footer}>
          Made with &#10084; by Falcon Devs
        </footer>
      </div>
    </>
  );
}
