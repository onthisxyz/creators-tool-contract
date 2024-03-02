// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";
import "./interfaces/IAcross.sol";
import "./Shortcut.sol";
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

contract ShortcutsConstructor is OwnableUpgradeable {
    event NewShortcutCreated(ShortcutParams params, address shortcut);

    error NotSupportedRouter(address router);
    error NotSupportedChainId(uint256 chainId);
    error TokenAlreadyUsed(address token, uint256 chainId);
    error IncorrectTokenOut();

    Shortcut public shortcutFactory;
    // chainId => bool
    mapping(uint256 => bool) public supportedChainIds;
    // shortcut address => DexType
    mapping(address => DexType) public registeredShortcuts;
    // chainId => address
    mapping(uint256 => address) public swapHandlers;
    // tokenToSwap => chainId => isCreated
    mapping(address => mapping(uint256 => bool)) public isDestTokenOutUsed;
    // swapRouter address => chainId => bool
    mapping(address => mapping(uint256 => bool)) public isSupportedRouter;

    address public implementaion;
    address public feeOracle;

    uint256[50] private _gap;

    function initialize(
        address _implementaion,
        address _feeOracle
    ) public initializer {
        __Ownable_init();
        implementaion = _implementaion;
        feeOracle = _feeOracle;
    }

    modifier SupportedChainId(uint256 chainId) {
        if (supportedChainIds[chainId] == false) {
            revert NotSupportedChainId(chainId);
        }
        _;
    }

    function addNewChainId(uint256 _chainId) external onlyOwner {
        supportedChainIds[_chainId] = true;
    }

    function changeImplementation(address newImplementation) public onlyOwner {
        implementaion = newImplementation;
    }

    function changeFeeOracle(address newFeeOracle) public onlyOwner {
        feeOracle = newFeeOracle;
    }

    function enableTokenOutReusage(
        address tokenOut,
        uint256 chainId
    ) external onlyOwner SupportedChainId(chainId) {
        isDestTokenOutUsed[tokenOut][chainId] = false;
    }

    function addNewDexRouter(
        uint256 chainId,
        address router
    ) external onlyOwner SupportedChainId(chainId) {
        isSupportedRouter[router][chainId] = true;
    }

    function addNewSwapHandler(
        uint256 chainId,
        address swapHandler
    ) external onlyOwner SupportedChainId(chainId) {
        swapHandlers[chainId] = swapHandler;
    }

    function createShortcut(
        ShortcutParams calldata params
    ) public SupportedChainId(params.chainId) {
        if (isDestTokenOutUsed[params.tokenOut][params.chainId]) {
            revert TokenAlreadyUsed(params.tokenOut, params.chainId);
        }
        if (!isSupportedRouter[params.router][params.chainId]) {
            revert NotSupportedRouter(params.router);
        }
        if (params.tokenOut == address(0)) {
            revert IncorrectTokenOut();
        }

        address instance = payable(Clones.clone(implementaion));

        Shortcut(payable(instance)).initialize(
            params,
            swapHandlers[params.chainId],
            feeOracle
        );
        Shortcut(payable(instance)).transferOwnership(this.owner());

        isDestTokenOutUsed[params.tokenOut][params.chainId] = true;
        emit NewShortcutCreated(params, instance);
    }
}
