import { ethers, upgrades } from "hardhat";
import * as hre from "hardhat";

const deployOpHandler = async () => {
  const [owner] = await ethers.getSigners();
  
  const BridgedAndSwapOpHandler = await ethers.getContractFactory("BridgedAndSwapOpHandler", owner);
  const BridgedAndSwapOpHandlerContract = await upgrades.deployProxy(BridgedAndSwapOpHandler, []);
  await BridgedAndSwapOpHandlerContract.deployed();
  console.log("BridgedAndSwapOpHandlerContract deployed to:", BridgedAndSwapOpHandlerContract.address);

};

deployOpHandler();
