import { ethers, upgrades } from "hardhat";
import * as hre from "hardhat";

const deployPolHandler = async () => {
  const [owner] = await ethers.getSigners();
  
  const BridgedAndSwapPolHandler = await ethers.getContractFactory("BridgedAndSwapPolHandler", owner);
  const BridgedAndSwapPolHandlerContract = await upgrades.deployProxy(BridgedAndSwapPolHandler, []);
  await BridgedAndSwapPolHandlerContract.deployed();
  console.log("BridgedAndSwapPolHandlerContract deployed to:", BridgedAndSwapPolHandlerContract.address);

};

deployPolHandler();
//0xf4f2b2f9da0546A57DBD01f96Dc7e9956DbA6aFb