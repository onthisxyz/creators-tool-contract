// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import ".././interfaces/IWeth.sol";
import "../structs/Structs.sol";

// https://onthis.xyz
/*
 .d88b.  d8b   db d888888b db   db d888888b .d8888. 
.8P  Y8. 888o  88    88    88   88    88    88   YP 
88    88 88V8o 88    88    88ooo88    88     8bo.   
88    88 88 V8o88    88    88   88    88       Y8b. 
`8b  d8' 88  V888    88    88   88    88    db   8D 
 `Y88P'  VP   V8P    YP    YP   YP Y888888P  8888Y  
*/

contract BridgedAndSwapOpHandler is OwnableUpgradeable {
    address public constant WETH = 0x4200000000000000000000000000000000000006;

    uint256[50] private _gap;

    function initialize() public initializer {
        __Ownable_init();
    }

    function handleV3AcrossMessage(
        address,
        uint256 amount,
        address,
        bytes memory message
    ) external {
        (
            address maker,
            address router,
            address tokenOut,
            uint24 fee,
            uint256 dexType
        ) = abi.decode(message, (address, address, address, uint24, uint256));

        IWeth(WETH).approve(router, amount);

        if (DexType(dexType) == DexType.V3_UNI_FORK) {
            _swapAtV3Forked(tokenOut, amount, fee, maker, router);
        }

        if (DexType(dexType) == DexType.V2_UNI_FORK) {
            _swapAtV2Forked(tokenOut, amount, maker, router);
        }
        
    }

    function withdrawTokens(
        address token,
        address to,
        uint256 amount
    ) external onlyOwner {
        if (token == address(0)) {
            payable(to).transfer(amount);
        } else {
            IERC20(token).transfer(to, amount);
        }
    }

    function _swapAtV3Forked(
        address tokenOut,
        uint256 amountIn,
        uint24 poolFee,
        address maker,
        address router
    ) private {
        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter
            .ExactInputSingleParams({
                tokenIn: WETH,
                tokenOut: tokenOut,
                fee: poolFee,
                recipient: maker,
                deadline: block.timestamp,
                amountIn: amountIn,
                amountOutMinimum: 0,
                sqrtPriceLimitX96: 0
            });

        try ISwapRouter(router).exactInputSingle(params) {} catch {
            IERC20(WETH).transfer(maker, amountIn);
        }
    }

    function _swapAtV2Forked(
        address tokenOut,
        uint256 amountIn,
        address maker,
        address router
    ) private {
        address[] memory path = new address[](2);
        path[0] = WETH;
        path[1] = tokenOut;

        try
            IUniswapV2Router02(router)
                .swapExactTokensForTokensSupportingFeeOnTransferTokens(
                    amountIn,
                    0,
                    path,
                    maker,
                    block.timestamp + 3600
                )
        {} catch {
            IERC20(WETH).transfer(maker, amountIn);
        }
    }

    receive() external payable {}
}
