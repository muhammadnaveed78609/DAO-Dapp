import Head from "next/head";
import Image from "next/image";
import { Inter } from "@next/font/google";
import styles from "../styles/Home.module.css";
import React, { useState, useRef } from "react";
import { Contract, utils, providers } from "ethers";
import Web3Modal from "web3modal";
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
  const [Owner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(false);
  const [UserNFTBalance, setUserNFTBalance] = useState(0);
  const [NumberOfProposal, setNumberOfProposal] = useState("0");
  const [fake__nftTokenId, setfake__nftTokenId] = useState();
  // Helper function to fetch a Provider/Signer instance from Metamask
  const getProviderorSigner = async (needsigner = false) => {
    const provider = await web3ModalRef.current.connect();
    const web3provider = await providers.Web3Provider(provider);
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
    if (owner_add.toLowerCase() == signer_add.toLowerCase()) {
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
      const balance = await balance.balanceof(signer.getAddress());
      setUserNFTBalance(balance);
    } catch (error) {
      console.error(error);
      window.alert(error.data.message);
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
  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <div className={styles.description}>
          <p>
            Get started by editing&nbsp;
            <code className={styles.code}>pages/index.js</code>
          </p>
          <div>
            <a
              href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
              target="_blank"
              rel="noopener noreferrer"
            >
              By{" "}
              <Image
                src="/vercel.svg"
                alt="Vercel Logo"
                className={styles.vercelLogo}
                width={100}
                height={24}
                priority
              />
            </a>
          </div>
        </div>

        <div className={styles.center}>
          <Image
            className={styles.logo}
            src="/next.svg"
            alt="Next.js Logo"
            width={180}
            height={37}
            priority
          />
          <div className={styles.thirteen}>
            <Image
              src="/thirteen.svg"
              alt="13"
              width={40}
              height={31}
              priority
            />
          </div>
        </div>

        <div className={styles.grid}>
          <a
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
            className={styles.card}
            target="_blank"
            rel="noopener noreferrer"
          >
            <h2 className={inter.className}>
              Docs <span>-&gt;</span>
            </h2>
            <p className={inter.className}>
              Find in-depth information about Next.js features and&nbsp;API.
            </p>
          </a>

          <a
            href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
            className={styles.card}
            target="_blank"
            rel="noopener noreferrer"
          >
            <h2 className={inter.className}>
              Learn <span>-&gt;</span>
            </h2>
            <p className={inter.className}>
              Learn about Next.js in an interactive course with&nbsp;quizzes!
            </p>
          </a>

          <a
            href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
            className={styles.card}
            target="_blank"
            rel="noopener noreferrer"
          >
            <h2 className={inter.className}>
              Templates <span>-&gt;</span>
            </h2>
            <p className={inter.className}>
              Discover and deploy boilerplate example Next.js&nbsp;projects.
            </p>
          </a>

          <a
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
            className={styles.card}
            target="_blank"
            rel="noopener noreferrer"
          >
            <h2 className={inter.className}>
              Deploy <span>-&gt;</span>
            </h2>
            <p className={inter.className}>
              Instantly deploy your Next.js site to a shareable URL
              with&nbsp;Vercel.
            </p>
          </a>
        </div>
      </main>
    </>
  );
}
