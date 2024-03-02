/* eslint-disable */

import {
  impersonateAccount,
  setBalance,
} from "@nomicfoundation/hardhat-network-helpers";
import { ethers } from "hardhat";
import {
  ShortcutsConstructor,
  ShortcutsConstructor__factory,
  Shortcut,
  Shortcut__factory,
  ERC20__factory,
  IWeth__factory,
  BridgedAndSwapArbHandler,
  BridgedAndSwapArbHandler__factory,
  AcrossFees,
  AcrossFees__factory,
} from "../../typechain-types";
import { Signer } from "ethers";
import { expect } from "chai";

const IMPERSONATE_ADDRESS = "0xf4f2b2f9da0546A57DBD01f96Dc7e9956DbA6aFb";

const CAMELOT_ROUTER = "0xc873fEcbd354f5A56E00E710B90EF4201db2448d";
const OP_UNISWAP_ROUTER = "0x1F98431c8aD98523631AE4a59f267346ea31F984";
const POL_SUSHI_ROUTER = "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506";
const BASE_UNISWAP = "0x33128a8fC17869897dcE68Ed026d694621f6FDfD";
const ZK_PANCAKE = "0xd03D8D566183F0086d8D09A84E1e30b58Dd5619d";

enum DexType {
  V2_UNI_FORK,
  V3_UNI_FORK,
  V2_CAMELOT,
  V3_CAMELOT
}
async function getWeth(impersonatedSigner: Signer, address: string) {
  return new ethers.Contract(address, IWeth__factory.abi, impersonatedSigner);
}
async function getErc20(impersonatedSigner: Signer, address: string) {
  return new ethers.Contract(address, ERC20__factory.abi, impersonatedSigner);
}
async function getShortcut(impersonatedSigner: Signer, address: string) {
  return new ethers.Contract(
    address,
    Shortcut__factory.abi,
    impersonatedSigner
  );
}

const IMPLEMENTATION_PARAMS = {
  router: ethers.constants.AddressZero,
  tokenOut: ethers.constants.AddressZero,
  chainId: 0,
  fee: 0,
  dex: 0,
};

describe("Across bridges test", function () {
  let impersonatedSigner: Signer;
  let construtorSwap: ShortcutsConstructor;
  let swapBridge: Shortcut;
  let bridgeAndSwap: BridgedAndSwapArbHandler;
  let acrossFee: AcrossFees;

  beforeEach(async () => {
    await impersonateAccount(IMPERSONATE_ADDRESS);
    setBalance(IMPERSONATE_ADDRESS, 1000 * 10 ** 18);
    impersonatedSigner = await ethers.getSigner(IMPERSONATE_ADDRESS);

    swapBridge = await new Shortcut__factory(impersonatedSigner).deploy();
    bridgeAndSwap = await new BridgedAndSwapArbHandler__factory(
      impersonatedSigner
    ).deploy();
    acrossFee = await new AcrossFees__factory(impersonatedSigner).deploy();
    construtorSwap = await new ShortcutsConstructor__factory(
      impersonatedSigner
    ).deploy();

    await bridgeAndSwap.initialize();
    await acrossFee.initialize();
    await construtorSwap.initialize("0x55029f60f2351480a4a397E24B41fdF509052170",acrossFee.address);

    await swapBridge.initialize(
      IMPLEMENTATION_PARAMS,
      ethers.constants.AddressZero,
      ethers.constants.AddressZero,
    );

    await construtorSwap.addNewChainId(42161);
    await construtorSwap.addNewChainId(10);
    await construtorSwap.addNewChainId(137);
    await construtorSwap.addNewChainId(8453);
    await construtorSwap.addNewChainId(324);

    await construtorSwap.addNewDexRouter(42161, CAMELOT_ROUTER);
    await construtorSwap.addNewDexRouter(10, OP_UNISWAP_ROUTER);
    await construtorSwap.addNewDexRouter(137, POL_SUSHI_ROUTER);
    await construtorSwap.addNewDexRouter(8453, BASE_UNISWAP);
    await construtorSwap.addNewDexRouter(324, ZK_PANCAKE);

    await construtorSwap.addNewSwapHandler(42161, IMPERSONATE_ADDRESS);
    await construtorSwap.addNewSwapHandler(137, IMPERSONATE_ADDRESS);
    await construtorSwap.addNewSwapHandler(10, IMPERSONATE_ADDRESS);
    await construtorSwap.addNewSwapHandler(8453, IMPERSONATE_ADDRESS);
    await construtorSwap.addNewSwapHandler(324, IMPERSONATE_ADDRESS);
    

  });

  it.only("Allows to create a shortcut & use them for all 5 chains", async function () {
    // arbitrum shortcut
    const params = {
      router: CAMELOT_ROUTER,
      tokenOut: "0x9E64D3b9e8eC387a9a58CED80b71Ed815f8D82B5", // smol token
      chainId: 42161,
      fee: 0,
      dex: DexType.V2_CAMELOT,
    };
    const tx = await construtorSwap.createShortcut(params);
    const receipt = await tx.wait();
    const shortcutAddress = receipt.events?.filter(
      (e) => e.event == "NewShortcutCreated"
    )[0]?.args?.[1];
    const newShortcut = await getShortcut(impersonatedSigner, shortcutAddress);
    const newShortcutTestTx = {
      to: shortcutAddress,
      value: ethers.utils.parseEther("1"),
    };
    expect(await newShortcut.owner()).eq(IMPERSONATE_ADDRESS);
    expect(await impersonatedSigner.sendTransaction(newShortcutTestTx)).to.emit(
      newShortcut,
      "Message"
    );

    //optimism
    const params1 = {
      router: OP_UNISWAP_ROUTER,
      tokenOut: "0x4200000000000000000000000000000000000042", // op token
      chainId: 10,
      fee: 0,
      dex: 0,
    };
    const tx1 = await construtorSwap.createShortcut(params1);
    const receipt1 = await tx1.wait();
    const shortcutAddress1 = receipt1.events?.filter(
      (e) => e.event == "NewShortcutCreated"
    )[0]?.args?.[1];
    const newShortcut1 = await getShortcut(
      impersonatedSigner,
      shortcutAddress1
    );
    const newShortcutTestTx1 = {
      to: shortcutAddress1,
      value: ethers.utils.parseEther("1"),
    };
    expect(await newShortcut1.owner()).eq(IMPERSONATE_ADDRESS);
    await expect(
      await impersonatedSigner.sendTransaction(newShortcutTestTx1)
    ).to.emit(newShortcut1, "Message");

    //polygon
    const params2 = {
      router: POL_SUSHI_ROUTER,
      tokenOut: "0xD6DF932A45C0f255f85145f286eA0b292B21C90B", // aave token
      chainId: 137,
      fee: 0,
      dex: 0,
    };
    const tx2 = await construtorSwap.createShortcut(params2);
    const receipt2 = await tx2.wait();
    const shortcutAddress2 = receipt2.events?.filter(
      (e) => e.event == "NewShortcutCreated"
    )[0]?.args?.[1];
    const newShortcut2 = await getShortcut(
      impersonatedSigner,
      shortcutAddress2
    );
    const newShortcutTestTx2 = {
      to: shortcutAddress2,
      value: ethers.utils.parseEther("1"),
    };
    expect(await newShortcut2.owner()).eq(IMPERSONATE_ADDRESS);
    await expect(
      await impersonatedSigner.sendTransaction(newShortcutTestTx2)
    ).to.emit(newShortcut2, "Message");

    //base
    const params3 = {
      router: BASE_UNISWAP,
      tokenOut: "0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed", // degen token
      chainId: 8453,
      fee: 0,
      dex: 0,
    };
    const tx3 = await construtorSwap.createShortcut(params3);
    const receipt3 = await tx3.wait();
    const shortcutAddress3 = receipt3.events?.filter(
      (e) => e.event == "NewShortcutCreated"
    )[0]?.args?.[1];
    const newShortcut3 = await getShortcut(
      impersonatedSigner,
      shortcutAddress3
    );
    const newShortcutTestTx3 = {
      to: shortcutAddress3,
      value: ethers.utils.parseEther("1"),
    };
    expect(await newShortcut3.owner()).eq(IMPERSONATE_ADDRESS);
    await expect(impersonatedSigner.sendTransaction(newShortcutTestTx3)).to.emit(
      newShortcut3,
      "Message"
    );
      
    //zkSync
    const params4 = {
      router: BASE_UNISWAP,
      tokenOut: "0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4", // usdc token
      chainId: 8453,
      fee: 0,
      dex: 0,
    };
    const tx4 = await construtorSwap.createShortcut(params4);
    const receipt4 = await tx4.wait();
    const shortcutAddress4 = receipt4.events?.filter(
      (e) => e.event == "NewShortcutCreated"
    )[0]?.args?.[1];
    const newShortcut4 = await getShortcut(
      impersonatedSigner,
      shortcutAddress4
    );
    const newShortcutTestTx4 = {
      to: newShortcut4.address,
      value: ethers.utils.parseEther("1"),
    };
    expect(await newShortcut4.owner()).eq(IMPERSONATE_ADDRESS);
    await expect(impersonatedSigner.sendTransaction(newShortcutTestTx4)).to.emit(
      newShortcut4,
      "Message"
    );

    
  });
});
