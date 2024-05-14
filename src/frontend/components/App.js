import { HashRouter, Routes, Route } from "react-router-dom";

import { useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { Spinner } from "react-bootstrap";

//Components
import Navigation from "./Navbar";
import Home from "./Home.js";
import Create from "./Create.js";
import MyListedItems from "./MyListedItems.js";
import MyPurchases from "./MyPurchases.js";
import History from "./History.js";

import "./App.css";

import {
  loadProvider,
  loadNetwork,
  loadAccount,
  loadNFT,
  loadMarketplace,
} from "./store/interactions";

function App() {
  const dispatch = useDispatch();

  const loadBlockchainData = async () => {
    // Initiate provider
    const provider = await loadProvider(dispatch);

    // Fetch current network's chainId (e.g. for hardhat: 31337, kovan: 42, etc.)
    const chainId = await loadNetwork(provider, dispatch);

    // Reload page when network changes
    window.ethereum.on("chainChanged", () => {
      window.location.reload();
    });

    // Fetch current account from Metamask when changed
    window.ethereum.on("accountsChanged", async () => {
      await loadAccount(dispatch);
    });

    // Initiate contracts
    await loadNFT(provider, chainId, dispatch);
    await loadMarketplace(provider, chainId, dispatch);
  };

  useEffect(() => {
    loadBlockchainData();
  }, []);

  return (
    <HashRouter>
      <div className="App">
        <>
          <Navigation web3Handler={loadBlockchainData} />
        </>
        <div>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/create" element={<Create />} />
            <Route path="/my-listed-items" element={<MyListedItems />} />
            <Route path="/my-purchases" element={<MyPurchases />} />
            <Route path="/my-history" element={<History />} />
          </Routes>
        </div>
      </div>
    </HashRouter>
  );
}

export default App;
