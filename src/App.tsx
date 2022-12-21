import { Web3ReactProvider } from "@web3-react/core";
import React from "react";
import { Toaster } from "react-hot-toast";
import { QueryClient, QueryClientProvider } from "react-query";

import "./App.css";
import ICOToken from "./ICOToken";
import Demo from "./components/Demo";
import { getLibrary } from "./components/Demo";

const crowdsaleAddress = import.meta.env.VITE_CROWDSALE_ADDRESS;

const queryClient = new QueryClient();

function App() {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <QueryClientProvider client={queryClient}>
        <div className="App">
          <Demo />
          <ICOToken crowdsaleAddress={crowdsaleAddress} />

          <footer className="p-10 footer bg-base-200 text-base-content">
            <div>
              <p>
                ProductsWay
                <br />
                Built with love from{" "}
                <a className="link" href="https://github.com/jellydn">
                  jellydn
                </a>
              </p>
            </div>
            <div>
              <span className="footer-title">Document</span>
              <a
                href="https://vitejs.dev/guide/features.html"
                target="_blank"
                rel="noopener noreferrer"
                className="link link-hover"
              >
                Vite Docs
              </a>
              <a href="https://hardhat.org/" target="_blank" rel="noopener noreferrer" className="link link-hover">
                Hardhat
              </a>
              <a href="https://daisyui.com/" target="_blank" rel="noopener noreferrer" className="link link-hover">
                daisyUI
              </a>
              <a
                href="https://github.com/NoahZinsmeister/web3-react"
                target="_blank"
                rel="noopener noreferrer"
                className="link link-hover"
              >
                Web3 React
              </a>
            </div>
            <div>
              <span className="footer-title">1-click Deployment</span>
              <a
                className="pl-2"
                href="https://vercel.com/new/git/external?repository-url=https://github.com/jellydn/dapp-starter/"
              >
                <img src="https://vercel.com/button" alt="Deploy with Vercel" />
              </a>
            </div>
          </footer>
        </div>
        <Toaster position="top-right" />
      </QueryClientProvider>
    </Web3ReactProvider>
  );
}

export default App;
