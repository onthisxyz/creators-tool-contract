// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./interfaces/IAcross.sol";
import "./interfaces/IAcrossFees.sol";
import "./structs/Structs.sol";

// https://onthis.xyz
/*
 .d88b.  d8b   db d888888b db   db d888888b .d8888. 
.8P  Y8. 888o  88    88    88   88    88    88   YP 
88    88 88V8o 88    88    88ooo88    88     8bo.   
88    88 88 V8o88    88    88   88    88       Y8b. 
`8b  d8' 88  V888    88    88   88    88    db   8D 
 `Y88P'  VP   V8P    YP    YP   YP Y888888P  8888Y  
*/

contract Shortcut is OwnableUpgradeable {
    event Message(bytes msg);

    uint256 public constant SHORTCUT_COMPLEXITY = 1;
    uint256 public constant SHORTCUT_BASE_FEE = 1000;
    address public constant BRIDGE = 0x5c7BCd6E7De5423a257D81B442095A1a6ced35C5;
    address public constant WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    address public constant FEE_DESTINATION =
        0x857eFc6c1280778b20B14af709C857E8164E731D;

    DexType public dex;
    uint256 public chainId;
    uint256 public poolFee;
    address public router;
    address public tokenOut;
    address public swapHandler;
    address public acrossFeeContract;

    bool private isDisabled;

    uint256[50] private _gap;

    function initialize(
        ShortcutParams calldata params,
        address _swapHandler,
        address acrossFee
    ) public initializer {
        __Ownable_init();
        chainId = params.chainId;
        dex = params.dex;
        tokenOut = params.tokenOut;
        router = params.router;
        poolFee = params.fee;
        swapHandler = _swapHandler;
        acrossFeeContract = acrossFee;
    }

    function _chargeFee(uint256 amount) internal returns (uint256) {
        uint256 fee = (amount * SHORTCUT_COMPLEXITY) / SHORTCUT_BASE_FEE;

        payable(FEE_DESTINATION).transfer(fee);
        return fee;
    }

    function disableShortcut() public onlyOwner {
        isDisabled = true;
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

    receive() external payable {
        require(!isDisabled, "Shortcut: contract disabled");

        uint256 chargedFees = _chargeFee(msg.value);
        uint256 valueAfterFees = msg.value - chargedFees;
        int64 relayerFeePct = IAcrossFees(acrossFeeContract).getHighRelayersFee(
            valueAfterFees
        );

        bytes memory message = abi.encode(
            msg.sender,
            router,    
            tokenOut,   
            poolFee,   
            dex        
        );
        
        IAcross(BRIDGE).deposit{value: valueAfterFees}(
            swapHandler,
            WETH,
            valueAfterFees,
            chainId,
            relayerFeePct,
            uint32(block.timestamp),
            message,
            type(uint256).max
        );

        emit Message(message);
    }
}
