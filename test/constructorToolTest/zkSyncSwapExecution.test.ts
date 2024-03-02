/* eslint-disable */

import {
  impersonateAccount,
  setBalance,
} from "@nomicfoundation/hardhat-network-helpers";
import { ethers } from "hardhat";
import {
  ERC20__factory,
  IWeth__factory,
  BridgedAndSwapZkSyncHandler,
  BridgedAndSwapZkSyncHandler__factory,
} from "../../typechain-types";
import { Signer } from "ethers";

const MUTE_V2 = "0x8B791913eB07C32779a16750e3868aA8495F5964";

const IMPERSONATE_ADDRESS = "0xf4f2b2f9da0546A57DBD01f96Dc7e9956DbA6aFb";
const ZKSYNC_WETH = "0x5AEa5775959fBC2557Cc8789bC1bf90A239D9a91";

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
  let BridgedAndSwapZkSyncHandler: BridgedAndSwapZkSyncHandler;

  beforeEach(async () => {
    await impersonateAccount(IMPERSONATE_ADDRESS);
    setBalance(IMPERSONATE_ADDRESS, 1000 * 10 ** 18);
    impersonatedSigner = await ethers.getSigner(IMPERSONATE_ADDRESS);

    BridgedAndSwapZkSyncHandler = await new BridgedAndSwapZkSyncHandler__factory(
      impersonatedSigner
    ).deploy();
    await BridgedAndSwapZkSyncHandler.initialize();
  });

  it("Allows oracle to call swapHadnler (SUSHISWAP V2)", async function () {
    const encodedMessage = ethers.utils.defaultAbiCoder.encode(
      ["address", "address", "address", "uint256", "uint256"],
      [
        IMPERSONATE_ADDRESS,
        MUTE_V2,
        "0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4", // uni
        0,
        DexType.V2_UNI_FORK,
      ]
    );

    const WETH = await getWeth(impersonatedSigner, ZKSYNC_WETH);
    const erc20 = await getErc20(impersonatedSigner, ZKSYNC_WETH);
    await WETH.deposit({ value: ethers.utils.parseEther("1") });
    
    await erc20.transfer(
      BridgedAndSwapZkSyncHandler.address,
      ethers.utils.parseEther("1")
    );
    
    await BridgedAndSwapZkSyncHandler.handleV3AcrossMessage(
      IMPERSONATE_ADDRESS,
      ethers.utils.parseEther("1"),
      IMPERSONATE_ADDRESS,
      encodedMessage
    );
  });
});
