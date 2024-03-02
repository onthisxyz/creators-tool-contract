import { ethers, upgrades } from "hardhat";
import * as hre from "hardhat";

const deployArbHandler = async () => {
  const [owner] = await ethers.getSigners();
  
  const BridgedAndSwapArbHandler = await ethers.getContractFactory("BridgedAndSwapArbHandler", owner);
  const BridgedAndSwapArbHandlerContract = await upgrades.deployProxy(BridgedAndSwapArbHandler, []);
  await BridgedAndSwapArbHandlerContract.deployed();
  console.log("BridgedAndSwapArbHandler deployed to:", BridgedAndSwapArbHandlerContract.address);

};

deployArbHandler();
