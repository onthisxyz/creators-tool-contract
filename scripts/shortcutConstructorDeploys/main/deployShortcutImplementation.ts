import { ethers, upgrades } from "hardhat";
import * as hre from "hardhat";

const IMPLEMENTATION_PARAMS = {
  router: ethers.constants.AddressZero,
  tokenOut: ethers.constants.AddressZero,
  chainId: 0,
  fee: 0,
  dex: 0,
};

const deployShortcutImplementation = async () => {
  const [owner] = await ethers.getSigners();

  const Shortcut = await ethers.getContractFactory("Shortcut", owner);
  const ShortcutContract = await upgrades.deployProxy(Shortcut, [
    IMPLEMENTATION_PARAMS,
    ethers.constants.AddressZero,
    ethers.constants.AddressZero,
  ]);
  await ShortcutContract.deployed();
  console.log("ShortcutContract deployed to:", ShortcutContract.address);
};

deployShortcutImplementation();
