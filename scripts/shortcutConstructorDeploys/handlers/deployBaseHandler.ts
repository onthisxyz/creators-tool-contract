import { ethers, upgrades } from "hardhat";
import * as hre from "hardhat";

const deployBaseHandler = async () => {
  const [owner] = await ethers.getSigners();
  
  const BridgedAndSwapBaseHandler = await ethers.getContractFactory("BridgedAndSwapBaseHandler", owner);
  const BridgedAndSwapBaseHandlerContract = await upgrades.deployProxy(BridgedAndSwapBaseHandler, []);
  await BridgedAndSwapBaseHandlerContract.deployed();
  console.log("BridgedAndSwapBaseHandlerContract deployed to:", BridgedAndSwapBaseHandlerContract.address);

};

deployBaseHandler();
