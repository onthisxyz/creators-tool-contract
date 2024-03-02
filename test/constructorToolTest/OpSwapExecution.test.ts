/* eslint-disable */

import {
  impersonateAccount,
  setBalance,
} from "@nomicfoundation/hardhat-network-helpers";
import { ethers } from "hardhat";
import {
  ERC20__factory,
  IWeth__factory,
  BridgedAndSwapOpHandler,
  BridgedAndSwapOpHandler__factory,
} from "../../typechain-types";
import { Signer } from "ethers";
import { expect } from "chai";

const UNISWAP_V3 = "0xE592427A0AEce92De3Edee1F18E0157C05861564";
const IMPERSONATE_ADDRESS = "0xf4f2b2f9da0546A57DBD01f96Dc7e9956DbA6aFb";
const OP_WETH = "0x4200000000000000000000000000000000000006";

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
  let bridgeAndSwap: BridgedAndSwapOpHandler;

  beforeEach(async () => {
    await impersonateAccount(IMPERSONATE_ADDRESS);
    setBalance(IMPERSONATE_ADDRESS, 1000 * 10 ** 18);
    impersonatedSigner = await ethers.getSigner(IMPERSONATE_ADDRESS);

    bridgeAndSwap = await new BridgedAndSwapOpHandler__factory(
      impersonatedSigner
    ).deploy();
    await bridgeAndSwap.initialize();
  });

  it("Allows oracle to call swapHadnler (UNISWAP V3)", async function () {
    const encodedMessage = ethers.utils.defaultAbiCoder.encode(
      ["address", "address", "address", "uint256", "uint256"],
      [
        IMPERSONATE_ADDRESS,
        UNISWAP_V3,
        "0x4200000000000000000000000000000000000042", //OP
        500,
        DexType.V3_UNI_FORK,
      ]
    );

    const WETH = await getWeth(impersonatedSigner, OP_WETH);
    const erc20 = await getErc20(impersonatedSigner, OP_WETH);
    await WETH.deposit({ value: ethers.utils.parseEther("1") });

    await erc20.transfer(bridgeAndSwap.address, ethers.utils.parseEther("1"));

    await bridgeAndSwap.handleV3AcrossMessage(
      IMPERSONATE_ADDRESS,
      ethers.utils.parseEther("1"),
      IMPERSONATE_ADDRESS,
      encodedMessage
    );
  });

});
