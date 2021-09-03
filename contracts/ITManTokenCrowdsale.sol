// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./Crowdsale.sol";
import "./AllowanceCrowdsale.sol";

contract ITManTokenCrowdsale is AllowanceCrowdsale {
	constructor(
		uint256 _rate,
		address payable _wallet,
		ERC20 _token,
		address _tokenWallet
	)
		public
		Crowdsale(_rate, _wallet, _token)
		AllowanceCrowdsale(_tokenWallet)
	{}
}
