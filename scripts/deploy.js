const { ethers } = require("hardhat");
const { NFT_CONTRACT_ADD, ICO_CONTRACT_ADD } = require("../constant/constant");
const Deployment = async () => {
  //FAKENFT contract deployment
  const contract = await ethers.getContractFactory("fakeNFT");
  const fakeNFT = await contract.deploy();
  await fakeNFT.deployed();

  //FalconDevsDAO contract deployment
  const _NFT_CONTRACT_ADD = NFT_CONTRACT_ADD;
  const _ICO_CONTRACT_ADD = ICO_CONTRACT_ADD;
  const DOAcontract = await ethers.getContractFactory("FalconDevsDAO");
  const FalconDevsDAO = await DOAcontract.deploy(
    _NFT_CONTRACT_ADD,
    _ICO_CONTRACT_ADD
  );
  await FalconDevsDAO.deployed();
  console.log("Contract Address is : ", fakeNFT.address);
  console.log("Contract Address is : ", FalconDevsDAO.address);
};

Deployment()
  .then(() => process.exit(1))
  .catch((error) => {
    console.error(error);
    process.exit(0);
  });
