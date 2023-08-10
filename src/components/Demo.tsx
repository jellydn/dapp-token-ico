/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Web3Provider } from "@ethersproject/providers";
import { useWeb3React, UnsupportedChainIdError } from "@web3-react/core";
import {
  NoEthereumProviderError,
  UserRejectedRequestError as UserRejectedRequestErrorInjected,
} from "@web3-react/injected-connector";
import { UserRejectedRequestError as UserRejectedRequestErrorWalletConnect } from "@web3-react/walletconnect-connector";
import React from "react";

import { injected, POLLING_INTERVAL } from "../dapp/connectors";
import { useEagerConnect, useInactiveListener } from "../dapp/hooks";
import logger from "../logger";
import { Header } from "./Header";

function getErrorMessage(error?: Error) {
  if (error instanceof NoEthereumProviderError) {
    return "No Ethereum browser extension detected, install MetaMask on desktop or visit from a dApp browser on mobile.";
  }

  if (error instanceof UnsupportedChainIdError) {
    return "You're connected to an unsupported network.";
  }

  if (error instanceof UserRejectedRequestErrorInjected || error instanceof UserRejectedRequestErrorWalletConnect) {
    return "Please authorize this website to access your Ethereum account.";
  }

  logger.error(error);
  return "An unknown error occurred. Check the console for more details.";
}

export function getLibrary(provider: any): Web3Provider {
  const library = new Web3Provider(provider);
  library.pollingInterval = POLLING_INTERVAL;
  return library;
}

export default function Demo() {
  const context = useWeb3React<Web3Provider>();
  const { connector, activate, deactivate, active, error } = context;

  // Handle logic to recognize the connector currently being activated
  const [activatingConnector, setActivatingConnector] = React.useState<any>();
  React.useEffect(() => {
    if (activatingConnector && activatingConnector === connector) {
      setActivatingConnector(undefined);
    }
  }, [activatingConnector, connector]);

  // Handle logic to eagerly connect to the injected ethereum provider, if it exists and has granted access already
  const triedEager = useEagerConnect();

  // Handle logic to connect in reaction to certain events on the injected ethereum provider, if it exists
  useInactiveListener(!triedEager || Boolean(activatingConnector));

  const activating = injected === activatingConnector;
  const connected = injected === connector;
  const disabled = !triedEager || Boolean(activatingConnector) || connected || Boolean(error);
  return (
    <Header>
      <div className="flex flex-row mr-4 ml-4 w-full">
        <button
          type="button"
          className="btn btn-primary"
          disabled={disabled}
          onClick={async () => {
            setActivatingConnector(injected);
            await activate(injected);
          }}
        >
          <div>
            {activating && <p className="btn loading">loading...</p>}
            {connected && (
              <span role="img" aria-label="check">
                ✅
              </span>
            )}
          </div>
          Connect with MetaMask
        </button>
        <div>
          {(active || error) && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                deactivate();
              }}
            >
              Deactivate
            </button>
          )}

          {Boolean(error) && <h4 style={{ marginTop: "1rem", marginBottom: "0" }}>{getErrorMessage(error)}</h4>}
        </div>
      </div>
    </Header>
  );
}
