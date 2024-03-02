/* eslint-disable */

import {
  impersonateAccount,
  setBalance,
} from "@nomicfoundation/hardhat-network-helpers";
import { ethers } from "hardhat";
import {
  ERC20__factory,
  IWeth__factory,
  BridgedAndSwapArbHandler,
  BridgedAndSwapArbHandler__factory,
} from "../../typechain-types";
import { Signer } from "ethers";
import { expect } from "chai";

const CAMELOT_V2_ROUTER = "0xc873fEcbd354f5A56E00E710B90EF4201db2448d";
const CAMELOT_V3_ROUTER = "0x1F721E2E82F6676FCE4eA07A5958cF098D339e18";
const UNISWAP_V3 = "0xE592427A0AEce92De3Edee1F18E0157C05861564";
const PANCAKE_V2 = "0x8cFe327CEc66d1C090Dd72bd0FF11d690C33a2Eb";
const PANCAKE_V3 = "0x1b81D678ffb9C0263b24A97847620C99d213eB14";
const SUSHI_V2 = "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506";
const SUSHI_V3 = "0x8A21F6768C1f8075791D08546Dadf6daA0bE820c";

const IMPERSONATE_ADDRESS = "0xf4f2b2f9da0546A57DBD01f96Dc7e9956DbA6aFb";
const ARB_WETH = "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1";

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
  V3_
}

describe("Across bridges test", function () {
  let impersonatedSigner: Signer;
  let bridgeAndSwap: BridgedAndSwapArbHandler;

  beforeEach(async () => {
    await impersonateAccount(IMPERSONATE_ADDRESS);
    setBalance(IMPERSONATE_ADDRESS, 1000 * 10 ** 18);
    impersonatedSigner = await ethers.getSigner(IMPERSONATE_ADDRESS);

    bridgeAndSwap = await new BridgedAndSwapArbHandler__factory(
      impersonatedSigner
    ).deploy();
    await bridgeAndSwap.initialize();
  });

  it("Allows oracle to call swapHadnler (CAMELOT V2)", async function () {
    const encodedMessage = ethers.utils.defaultAbiCoder.encode(
      ["address", "address", "address", "uint256", "uint256"],
      [
        IMPERSONATE_ADDRESS,
        CAMELOT_V2_ROUTER,
        "0x9E64D3b9e8eC387a9a58CED80b71Ed815f8D82B5", //smol
        0,
        DexType.V2_CAMELOT,
      ]
    );

    const WETH = await getWeth(impersonatedSigner, ARB_WETH);
    const erc20 = await getErc20(impersonatedSigner, ARB_WETH);
    await WETH.deposit({ value: ethers.utils.parseEther("1") });

    await erc20.transfer(bridgeAndSwap.address, ethers.utils.parseEther("1"));

    await bridgeAndSwap.handleV3AcrossMessage(
      IMPERSONATE_ADDRESS,
      ethers.utils.parseEther("1"),
      IMPERSONATE_ADDRESS,
      encodedMessage
    );
  });

  it("Allows oracle to call swapHandler (CAMELOT V3)", async function () {
    const encodedMessage = ethers.utils.defaultAbiCoder.encode(
      ["address", "address", "address", "uint256", "uint256"],
      [
        IMPERSONATE_ADDRESS,
        CAMELOT_V3_ROUTER,
        "0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a", //gmx
        0,
        DexType.V3_CAMELOT,
      ]
    );

    const WETH = await getWeth(impersonatedSigner, ARB_WETH);
    const erc20 = await getErc20(impersonatedSigner, ARB_WETH);
    await WETH.deposit({ value: ethers.utils.parseEther("1") });

    await erc20.transfer(bridgeAndSwap.address, ethers.utils.parseEther("1"));

    await bridgeAndSwap.handleV3AcrossMessage(
      IMPERSONATE_ADDRESS,
      ethers.utils.parseEther("1"),
      IMPERSONATE_ADDRESS,
      encodedMessage
    );
  });
  it("Allows oracle to call swapHandler (UNISWAP V3)", async function () {
    const encodedMessage = ethers.utils.defaultAbiCoder.encode(
      ["address", "address", "address", "uint256", "uint256"],
      [
        IMPERSONATE_ADDRESS,
        UNISWAP_V3,
        "0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a", //gmx
        10000,
        DexType.V3_UNI_FORK,
      ]
    );

    const WETH = await getWeth(impersonatedSigner, ARB_WETH);
    const erc20 = await getErc20(impersonatedSigner, ARB_WETH);
    await WETH.deposit({ value: ethers.utils.parseEther("1") });

    await erc20.transfer(bridgeAndSwap.address, ethers.utils.parseEther("1"));

    await bridgeAndSwap.handleV3AcrossMessage(
      IMPERSONATE_ADDRESS,
      ethers.utils.parseEther("1"),
      IMPERSONATE_ADDRESS,
      encodedMessage
    );
  });

  it("Allows oracle to call swapHandler (SUSHI V2)", async function () {
    const encodedMessage = ethers.utils.defaultAbiCoder.encode(
      ["address", "address", "address", "uint256", "uint256"],
      [
        IMPERSONATE_ADDRESS,
        SUSHI_V2,
        "0x539bdE0d7Dbd336b79148AA742883198BBF60342", //magic
        0,
        DexType.V2_UNI_FORK,
      ]
    );

    const WETH = await getWeth(impersonatedSigner, ARB_WETH);
    const erc20 = await getErc20(impersonatedSigner, ARB_WETH);
    await WETH.deposit({ value: ethers.utils.parseEther("1") });

    await erc20.transfer(bridgeAndSwap.address, ethers.utils.parseEther("1"));

    await bridgeAndSwap.handleV3AcrossMessage(
      IMPERSONATE_ADDRESS,
      ethers.utils.parseEther("1"),
      IMPERSONATE_ADDRESS,
      encodedMessage
    );
  });
  it("Allows oracle to call swapHandler (SUSHI V3)", async function () {
    const encodedMessage = ethers.utils.defaultAbiCoder.encode(
      ["address", "address", "address", "uint256", "uint256"],
      [
        IMPERSONATE_ADDRESS,
        SUSHI_V3,
        "0x912CE59144191C1204E64559FE8253a0e49E6548", //arb
        3000,
        DexType.V3_UNI_FORK,
      ]
    );

    const WETH = await getWeth(impersonatedSigner, ARB_WETH);
    const erc20 = await getErc20(impersonatedSigner, ARB_WETH);
    await WETH.deposit({ value: ethers.utils.parseEther("1") });

    await erc20.transfer(bridgeAndSwap.address, ethers.utils.parseEther("1"));

    await bridgeAndSwap.handleV3AcrossMessage(
      IMPERSONATE_ADDRESS,
      ethers.utils.parseEther("1"),
      IMPERSONATE_ADDRESS,
      encodedMessage
    );
  });
  it("Allows oracle to call swapHandler (PANCAKE V3)", async function () {
    const encodedMessage = ethers.utils.defaultAbiCoder.encode(
      ["address", "address", "address", "uint256", "uint256"],
      [
        IMPERSONATE_ADDRESS,
        PANCAKE_V3,
        "0xa61F74247455A40b01b0559ff6274441FAfa22A3", //arb
        2500,
        DexType.V3_UNI_FORK,
      ]
    );

    const WETH = await getWeth(impersonatedSigner, ARB_WETH);
    const erc20 = await getErc20(impersonatedSigner, ARB_WETH);
    await WETH.deposit({ value: ethers.utils.parseEther("1") });

    await erc20.transfer(bridgeAndSwap.address, ethers.utils.parseEther("1"));

    await bridgeAndSwap.handleV3AcrossMessage(
      IMPERSONATE_ADDRESS,
      ethers.utils.parseEther("1"),
      IMPERSONATE_ADDRESS,
      encodedMessage
    );
  });
  it("Allows oracle to call swapHandler (PANCAKE V2)", async function () {
    const encodedMessage = ethers.utils.defaultAbiCoder.encode(
      ["address", "address", "address", "uint256", "uint256"],
      [
        IMPERSONATE_ADDRESS,
        PANCAKE_V2,
        "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", //usdc
        0,
        DexType.V2_UNI_FORK,
      ]
    );

    const WETH = await getWeth(impersonatedSigner, ARB_WETH);
    const erc20 = await getErc20(impersonatedSigner, ARB_WETH);
    await WETH.deposit({ value: ethers.utils.parseEther("0.01") });

    await erc20.transfer(bridgeAndSwap.address, ethers.utils.parseEther("0.01"));

    await bridgeAndSwap.handleV3AcrossMessage(
      IMPERSONATE_ADDRESS,
      ethers.utils.parseEther("0.01"),
      IMPERSONATE_ADDRESS,
      encodedMessage
    );
  });

});
