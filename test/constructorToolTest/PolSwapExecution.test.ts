/* eslint-disable */

import {
  impersonateAccount,
  setBalance,
} from "@nomicfoundation/hardhat-network-helpers";
import { ethers } from "hardhat";
import {
  ERC20__factory,
  IWeth__factory,
  BridgedAndSwapPolHandler,
  BridgedAndSwapPolHandler__factory,
} from "../../typechain-types";
import { Signer } from "ethers";

const UNISWAP_V3 = "0xE592427A0AEce92De3Edee1F18E0157C05861564";
const SUSHI_V2 = "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506";

const IMPERSONATE_ADDRESS = "0xf4f2b2f9da0546A57DBD01f96Dc7e9956DbA6aFb";
const POL_WETH = "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619";

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
  let BridgedAndSwapPolHandler: BridgedAndSwapPolHandler;

  beforeEach(async () => {
    await impersonateAccount(IMPERSONATE_ADDRESS);
    setBalance(IMPERSONATE_ADDRESS, 1000 * 10 ** 18);
    impersonatedSigner = await ethers.getSigner(IMPERSONATE_ADDRESS);

    BridgedAndSwapPolHandler = await new BridgedAndSwapPolHandler__factory(
      impersonatedSigner
    ).deploy();
    await BridgedAndSwapPolHandler.initialize();
  });

  it("Allows oracle to call swapHadnler (UNISWAP V3)", async function () {
    const encodedMessage = ethers.utils.defaultAbiCoder.encode(
      ["address", "address", "address", "uint256", "uint256"],
      [
        IMPERSONATE_ADDRESS,
        UNISWAP_V3,
        "0xb33EaAd8d922B1083446DC23f610c2567fB5180f", // uni
        3000,
        DexType.V3_UNI_FORK,
      ]
    );

    const erc20 = await getErc20(impersonatedSigner, POL_WETH);

    await erc20.transfer(
      BridgedAndSwapPolHandler.address,
      ethers.utils.parseEther("0.0001")
    );

    await BridgedAndSwapPolHandler.handleV3AcrossMessage(
      IMPERSONATE_ADDRESS,
      ethers.utils.parseEther("0.0001"),
      IMPERSONATE_ADDRESS,
      encodedMessage
    );
  });
  it("Allows oracle to call swapHadnler (SUSHISWAP V2)", async function () {
    const encodedMessage = ethers.utils.defaultAbiCoder.encode(
      ["address", "address", "address", "uint256", "uint256"],
      [
        IMPERSONATE_ADDRESS,
        SUSHI_V2,
        "0xD6DF932A45C0f255f85145f286eA0b292B21C90B", // uni
        0,
        DexType.V2_UNI_FORK,
      ]
    );

    const erc20 = await getErc20(impersonatedSigner, POL_WETH);

    await erc20.transfer(
      BridgedAndSwapPolHandler.address,
      ethers.utils.parseEther("0.0001")
    );

    await BridgedAndSwapPolHandler.handleV3AcrossMessage(
      IMPERSONATE_ADDRESS,
      ethers.utils.parseEther("0.0001"),
      IMPERSONATE_ADDRESS,
      encodedMessage
    );
  });
});
