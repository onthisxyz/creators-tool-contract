import { ethers, upgrades } from "hardhat";
import * as hre from "hardhat";

const deployShortcutConstructor = async () => {
  const [owner] = await ethers.getSigners();

  const ShortcutsConstructor = await ethers.getContractFactory("ShortcutsConstructor", owner);
  const ShortcutsConstructorContract = await upgrades.deployProxy(ShortcutsConstructor, [
    "0x63Cd28e6afAC84860a0785c1b8d1026406929402",
    "0xC0A2d1b87f75fFa5CB6aA0Dc426B6BD29eAee11A"
  ]);
  await ShortcutsConstructorContract.deployed();
  console.log("ShortcutContract deployed to:", ShortcutsConstructorContract.address);

  await ShortcutsConstructorContract.addNewChainId(42161);
  await ShortcutsConstructorContract.addNewDexRouter(42161, "0xc873fEcbd354f5A56E00E710B90EF4201db2448d");
  await ShortcutsConstructorContract.addNewSwapHandler(42161, "0x165e8B425d1BeA781Dd3bC020DB85273Cb586313");
  console.log('finished')
};

deployShortcutConstructor();
