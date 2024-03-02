import { ethers, upgrades } from "hardhat";
import * as hre from "hardhat";

const deployAcrossFeeOracle = async () => {
  const [owner] = await ethers.getSigners();

  const AcrossFees = await ethers.getContractFactory("AcrossFees", owner);
  const AcrossFeesContract = await upgrades.deployProxy(AcrossFees, []);
  await AcrossFeesContract.deployed();
  console.log("AcrossFeesContract deployed to:", AcrossFeesContract.address);
};

deployAcrossFeeOracle();
