/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { formatUnits, formatEther, parseEther } from "@ethersproject/units";
import { useWeb3React } from "@web3-react/core";
import { BigNumber, ethers } from "ethers";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useQuery } from "react-query";

import ITManTokenArtifacts from "./artifacts/contracts/ITManToken.sol/ITManToken.json";
import ITManTokenCrowdsaleArtifacts from "./artifacts/contracts/ITManTokenCrowdsale.sol/ITManTokenCrowdsale.json";
import logger from "./logger";
import { type ITManToken, type ITManTokenCrowdsale } from "./types";

type Props = {
  readonly crowdsaleAddress: string;
};

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Window {
    ethereum: ethers.providers.ExternalProvider;
  }
}

const providerUrl = import.meta.env.VITE_PROVIDER_URL;

function TokenInfo({ tokenAddress }: { readonly tokenAddress: string }) {
  const { library } = useWeb3React();

  const fetchTokenInfo = async () => {
    logger.warn("fetchTokenInfo");
    const provider = library || new ethers.providers.Web3Provider(window.ethereum || providerUrl);
    const tokenContract = new ethers.Contract(tokenAddress, ITManTokenArtifacts.abi, provider) as ITManToken;
    const name = await tokenContract.name();
    const symbol = await tokenContract.symbol();
    const decimals = await tokenContract.decimals();
    const totalSupply = await tokenContract.totalSupply();
    logger.warn("token info", { name, symbol, decimals });
    return {
      name,
      symbol,
      decimals,
      totalSupply,
    };
  };

  const { error, isLoading, data } = useQuery(["token-info", tokenAddress], fetchTokenInfo, {
    enabled: tokenAddress !== "",
  });

  if (error) return <div>failed to load</div>;
  if (isLoading) return <div>loading...</div>;

  return (
    <div className="flex flex-col">
      <button type="button" className="btn">
        {data?.name}
        <div className="ml-2 badge">{data?.symbol}</div>
        <div className="ml-2 badge badge-info">{data?.decimals}</div>
      </button>

      <div className="shadow stats">
        <div className="stat">
          <div className="stat-title">Total Supply</div>
          <div className="stat-value">{formatUnits(data?.totalSupply ?? 0)}</div>
        </div>
      </div>
    </div>
  );
}

async function requestAccount() {
  if (window.ethereum?.request) return window.ethereum.request({ method: "eth_requestAccounts" });

  throw new Error("Missing install Metamask. Please access https://metamask.io/ to install extension on your browser");
}

function ICOToken({ crowdsaleAddress }: Props) {
  const { library, chainId, account } = useWeb3React();
  const [tokenAddress, setTokenAddress] = useState("");
  const [availableForSale, setAvailableForSale] = useState("0");
  const [price, setPrice] = useState("0");
  const [closingTime, setClosingTime] = useState("0");
  const [amount, setAmount] = useState(1);

  // Fetch crowdsale token info
  const fetchCrowdsaleTokenInfo = () => {
    logger.warn("fetchCrowdsaleTokenInfo");
    const provider = library || new ethers.providers.Web3Provider(window.ethereum || providerUrl);
    const contract = new ethers.Contract(
      crowdsaleAddress,
      ITManTokenCrowdsaleArtifacts.abi,
      provider,
    ) as ITManTokenCrowdsale;
    contract.token().then(setTokenAddress).catch(logger.error);
    contract
      .remainingTokens()
      .then((total) => {
        setAvailableForSale(BigNumber.from(total).toString());
      })
      .catch(logger.error);
    contract
      .rate()
      .then((rate) => {
        setPrice(BigNumber.from(rate).toString());
      })
      .catch(logger.error);
    contract
      .closingTime()
      .then((time) => {
        setClosingTime(BigNumber.from(time).toString());
      })
      .catch(logger.error);
  };

  useEffect(() => {
    try {
      fetchCrowdsaleTokenInfo();
    } catch (error) {
      logger.error(error);
    }
  }, [library]);

  // Buy token base on quantity
  const buyTokens = async () => {
    const provider = library || new ethers.providers.Web3Provider(window.ethereum || providerUrl);
    const signer = provider.getSigner();
    try {
      if (!account) {
        await requestAccount();
        return;
      }

      const txPrams = {
        to: crowdsaleAddress,
        value: ethers.BigNumber.from(parseEther(String(1 / Number(price)))).mul(amount),
        gasLimit: 5000000,
      };
      logger.warn({ txPrams });
      const transaction = await signer.sendTransaction(txPrams);
      toast
        .promise(transaction.wait(), {
          loading: `Transaction submitted. Wait for confirmation...`,
          success: <b>Transaction confirmed!</b>,
          error: <b>Transaction failed!.</b>,
        })
        .catch(logger.error);

      // Refetch total token after processing
      transaction
        .wait()
        .then(() => {
          fetchCrowdsaleTokenInfo();
        })
        .catch(logger.error);
    } catch (error) {
      logger.error(error);
    }
  };

  const totalCost = (1 / Number(price)) * amount;
  return (
    <div className="relative py-3 sm:mx-auto sm:max-w-5xl">
      {chainId !== 3 && (
        <>
          <div className="alert">
            <div className="flex-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="#ff5722"
                className="mx-2 w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                />
              </svg>
              <label>Please connect to the Ropsten testnet for testing.</label>
            </div>
          </div>
          <div className="divider" />
        </>
      )}

      <div className="flex items-center py-10 px-4 w-full bg-cover card bg-base-200">
        <TokenInfo tokenAddress={tokenAddress} />

        <div className="text-center shadow-2xl card">
          <div className="card-body">
            <h2 className="card-title">ITMan Token</h2>
            {Number(closingTime) > 0 && (
              <div className="alert">
                <div className="flex-1">
                  Closing time
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="#2196f3"
                    className="mx-2 w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <label>{new Date(Number(closingTime) * 1000).toLocaleString()}</label>
                </div>
              </div>
            )}
            <div className="shadow stats">
              <div className="stat">
                <div className="stat-title">Available for sale</div>
                <div className="stat-value">{formatUnits(availableForSale, "ether")}</div>
              </div>
              <div className="stat">
                <div className="stat-title">Price</div>
                <div className="stat-value">{formatUnits(price, "wei")} Wei</div>
              </div>
              <div className="stat">
                <div className="stat-title">Order Quantity</div>
                <div className="stat-value">{amount}</div>
              </div>
            </div>

            <input
              type="range"
              max="1000"
              value={amount}
              className="range range-accent"
              onChange={(evt) => {
                setAmount(evt.target.valueAsNumber);
              }}
            />
            <div>
              <div className="justify-center card-actions">
                <button type="button" className="btn btn-outline btn-accent" onClick={buyTokens}>
                  Buy Now
                </button>
              </div>
              <div className="badge badge-md">Total: {totalCost} ETH</div>
            </div>
          </div>
        </div>

        <div className="divider" />

        <div className="justify-center items-center py-4 px-4 mx-auto max-w-2xl text-xl border-orange-500 md:flex lg:flex">
          <div className="p-2 font-semibold">
            <a
              href={`https://ropsten.etherscan.io/address/${tokenAddress}`}
              target="_blank"
              className="py-1 px-4 ml-2 text-white bg-orange-500 rounded-full shadow focus:outline-none"
              rel="noreferrer"
            >
              View Token on Etherscan
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ICOToken;
