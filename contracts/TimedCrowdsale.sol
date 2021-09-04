// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./Crowdsale.sol";

/**
 * @title TimedCrowdsale
 * @dev Borrow from https://github.dev/OpenZeppelin/openzeppelin-contracts/blob/docs-v2.x/contracts/crowdsale/validation/TimedCrowdsale.sol
 * @dev Crowdsale accepting contributions only within a time frame.
 */
abstract contract TimedCrowdsale is Crowdsale {
	uint256 private _openingTime;
	uint256 private _closingTime;

	/**
	 * Event for crowdsale extending
	 * @param newClosingTime new closing time
	 * @param prevClosingTime old closing time
	 */
	event TimedCrowdsaleExtended(
		uint256 prevClosingTime,
		uint256 newClosingTime
	);

	/**
	 * @dev Reverts if not in crowdsale time range.
	 */
	modifier onlyWhileOpen() {
		require(isOpen(), "TimedCrowdsale: not open");
		_;
	}

	/**
	 * @dev Constructor, takes crowdsale opening and closing times.
	 * @param openingTime Crowdsale opening time
	 * @param closingTime Crowdsale closing time
	 */
	constructor(uint256 openingTime, uint256 closingTime) {
		// solhint-disable-next-line not-rely-on-time
		require(
			openingTime >= block.timestamp,
			"TimedCrowdsale: opening time is before current time"
		);
		// solhint-disable-next-line max-line-length
		require(
			closingTime > openingTime,
			"TimedCrowdsale: opening time is not before closing time"
		);

		_openingTime = openingTime;
		_closingTime = closingTime;
	}

	/**
	 * @return the crowdsale opening time.
	 */
	function openingTime() public view returns (uint256) {
		return _openingTime;
	}

	/**
	 * @return the crowdsale closing time.
	 */
	function closingTime() public view returns (uint256) {
		return _closingTime;
	}

	/**
	 * @return true if the crowdsale is open, false otherwise.
	 */
	function isOpen() public view returns (bool) {
		// solhint-disable-next-line not-rely-on-time
		return
			block.timestamp >= _openingTime && block.timestamp <= _closingTime;
	}

	/**
	 * @dev Checks whether the period in which the crowdsale is open has already elapsed.
	 * @return Whether crowdsale period has elapsed
	 */
	function hasClosed() public view returns (bool) {
		// solhint-disable-next-line not-rely-on-time
		return block.timestamp > _closingTime;
	}

	/**
	 * @dev Extend parent behavior requiring to be within contributing period.
	 * @param beneficiary Token purchaser
	 * @param weiAmount Amount of wei contributed
	 */
	function _preValidatePurchase(address beneficiary, uint256 weiAmount)
		internal
		view
		virtual
		override
		onlyWhileOpen
	{
		super._preValidatePurchase(beneficiary, weiAmount);
	}

	/**
	 * @dev Extend crowdsale.
	 * @param newClosingTime Crowdsale closing time
	 */
	function _extendTime(uint256 newClosingTime) internal {
		require(!hasClosed(), "TimedCrowdsale: already closed");
		// solhint-disable-next-line max-line-length
		require(
			newClosingTime > _closingTime,
			"TimedCrowdsale: new closing time is before current closing time"
		);

		emit TimedCrowdsaleExtended(_closingTime, newClosingTime);
		_closingTime = newClosingTime;
	}
}
