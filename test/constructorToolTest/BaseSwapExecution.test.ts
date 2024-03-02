/* eslint-disable */

import {
  impersonateAccount,
  setBalance,
} from "@nomicfoundation/hardhat-network-helpers";
import { ethers } from "hardhat";
import {
  ERC20__factory,
  IWeth__factory,
  BridgedAndSwapBaseHandler,
  BridgedAndSwapBaseHandler__factory,
} from "../../typechain-types";
import { Signer } from "ethers";

const UNISWAP_V3 = "0x2626664c2603336E57B271c5C0b26F421741e481";
const SUSHI_SWAP_V2 = "0x6BDED42c6DA8FBf0d2bA55B2fa120C5e0c8D7891";
const PANCAKE_V3 = "0x678Aa4bF4E210cf2166753e054d5b7c31cc7fa86";
const PANCAKE_V2 = "0x8cFe327CEc66d1C090Dd72bd0FF11d690C33a2Eb";
const IMPERSONATE_ADDRESS = "0xf4f2b2f9da0546A57DBD01f96Dc7e9956DbA6aFb";
const BASE_WETH = "0x4200000000000000000000000000000000000006";

async function getWeth(impersonatedSigner: Signer, address: string) {
  return new ethers.Contract(address, IWeth__factory.abi, impersonatedSigner);
}

async function getErc20(impersonatedSigner: Signer, address: string) {
  return new ethers.Contract(address, ERC20__factory.abi, impersonatedSigner);
}

enum DexType {
  V2_UNI_FORK,
  V3_UNI_FORK,
  V2_CAMELOT,
  V3_CAMELOT,
}

describe("Across bridges test", function () {
  let impersonatedSigner: Signer;
  let bridgedAndSwapBaseHandler: BridgedAndSwapBaseHandler;

  beforeEach(async () => {
    await impersonateAccount(IMPERSONATE_ADDRESS);
    setBalance(IMPERSONATE_ADDRESS, 1000 * 10 ** 18);
    impersonatedSigner = await ethers.getSigner(IMPERSONATE_ADDRESS);

    bridgedAndSwapBaseHandler = await new BridgedAndSwapBaseHandler__factory(
      impersonatedSigner
    ).deploy();
    await bridgedAndSwapBaseHandler.initialize();
  });

  it("Allows oracle to call swapHadnler (UNISWAP V3)", async function () {
    const encodedMessage = ethers.utils.defaultAbiCoder.encode(
      ["address", "address", "address", "uint256", "uint256"],
      [
        IMPERSONATE_ADDRESS,
        UNISWAP_V3,
        "0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed", // DEGEN
        3000,
        DexType.V3_UNI_FORK,
      ]
    );

    const WETH = await getWeth(impersonatedSigner, BASE_WETH);
    const erc20 = await getErc20(impersonatedSigner, BASE_WETH);

    await WETH.deposit({ value: ethers.utils.parseEther("1") });

    await erc20.transfer(
      bridgedAndSwapBaseHandler.address,
      ethers.utils.parseEther("1")
    );

    await bridgedAndSwapBaseHandler.handleV3AcrossMessage(
      IMPERSONATE_ADDRESS,
      ethers.utils.parseEther("1"),
      IMPERSONATE_ADDRESS,
      encodedMessage
    );
  });

  it("Allows oracle to call swapHadnler (SUSHI SWAP V2)", async function () {
    const encodedMessage = ethers.utils.defaultAbiCoder.encode(
      ["address", "address", "address", "uint256", "uint256"],
      [
        IMPERSONATE_ADDRESS,
        SUSHI_SWAP_V2,
        "0xAC1Bd2486aAf3B5C0fc3Fd868558b082a531B2B4", // TOSHI
        0,
        DexType.V2_UNI_FORK,
      ]
    );

    const WETH = await getWeth(impersonatedSigner, BASE_WETH);
    const erc20 = await getErc20(impersonatedSigner, BASE_WETH);

    await WETH.deposit({ value: ethers.utils.parseEther("1") });

    await erc20.transfer(
      bridgedAndSwapBaseHandler.address,
      ethers.utils.parseEther("1")
    );

    await bridgedAndSwapBaseHandler.handleV3AcrossMessage(
      IMPERSONATE_ADDRESS,
      ethers.utils.parseEther("1"),
      IMPERSONATE_ADDRESS,
      encodedMessage
    );
  });

  it("Allows oracle to call swapHadnler (PANCAKE V3)", async function () {
    const encodedMessage = ethers.utils.defaultAbiCoder.encode(
      ["address", "address", "address", "uint256", "uint256"],
      [
        IMPERSONATE_ADDRESS,
        PANCAKE_V3,
        "0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22", // cbETH
        500,
        DexType.V3_UNI_FORK,
      ]
    );

    const WETH = await getWeth(impersonatedSigner, BASE_WETH);
    const erc20 = await getErc20(impersonatedSigner, BASE_WETH);

    await WETH.deposit({ value: ethers.utils.parseEther("1") });

    await erc20.transfer(
      bridgedAndSwapBaseHandler.address,
      ethers.utils.parseEther("1")
    );

    await bridgedAndSwapBaseHandler.handleV3AcrossMessage(
      IMPERSONATE_ADDRESS,
      ethers.utils.parseEther("1"),
      IMPERSONATE_ADDRESS,
      encodedMessage
    );
  });
  it("Allows oracle to call swapHadnler (PANCAKE V2)", async function () {
    const encodedMessage = ethers.utils.defaultAbiCoder.encode(
      ["address", "address", "address", "uint256", "uint256"],
      [
        IMPERSONATE_ADDRESS,
        PANCAKE_V2,
        "0x071267674754F086DC6fDf5cb03288db4074F434", // bdrip
        0,
        DexType.V2_UNI_FORK,
      ]
    );

    const WETH = await getWeth(impersonatedSigner, BASE_WETH);
    const erc20 = await getErc20(impersonatedSigner, BASE_WETH);

    await WETH.deposit({ value: ethers.utils.parseEther("1") });

    await erc20.transfer(
      bridgedAndSwapBaseHandler.address,
      ethers.utils.parseEther("1")
    );

    await bridgedAndSwapBaseHandler.handleV3AcrossMessage(
      IMPERSONATE_ADDRESS,
      ethers.utils.parseEther("1"),
      IMPERSONATE_ADDRESS,
      encodedMessage
    );
  });
});
