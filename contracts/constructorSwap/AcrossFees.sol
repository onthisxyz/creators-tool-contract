// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "./interfaces/IAcross.sol";
import "./structs/Structs.sol";

import "hardhat/console.sol";

// https://onthis.xyz
/*
 .d88b.  d8b   db d888888b db   db d888888b .d8888. 
.8P  Y8. 888o  88    88    88   88    88    88   YP 
88    88 88V8o 88    88    88ooo88    88     8bo.   
88    88 88 V8o88    88    88   88    88       Y8b. 
`8b  d8' 88  V888    88    88   88    88    db   8D 
 `Y88P'  VP   V8P    YP    YP   YP Y888888P  8888Y  
*/

contract AcrossFees is OwnableUpgradeable {
    uint256 public decimal1;
    uint256 public decimal2;
    uint256 public percent1;
    uint256 public percent2;

    uint256[50] private _gap;

    function initialize() public initializer {
        __Ownable_init();
        decimal1 = 16;
        decimal2 = 15;
        percent1 = 10;
        percent2 = 5;
    }

    function changeDecimal1(uint256 newDec1) public onlyOwner {
        decimal1 = newDec1;
    }

    function changeDecimal2(uint256 newDec2) public onlyOwner {
        decimal2 = newDec2;
    }

    function changePercent1(uint256 newPercent1) public onlyOwner {
        percent1 = newPercent1;
    }

    function changePercent2(uint256 newPercent2) public onlyOwner {
        percent2 = newPercent2;
    }

    function getHighRelayersFee(uint256 val) public view returns (int64) {
        if (val <= 0.1 ether) {
            return int64(int256((percent1 * 10 ** decimal1)));
        } else {
            return int64(int256((percent2 * 10 ** decimal2)));
        }
    }
}
