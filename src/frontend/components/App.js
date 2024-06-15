import { HashRouter, Routes, Route } from "react-router-dom";

import { useDispatch } from "react-redux";
import { useEffect, useCallback } from "react";

//Components
import Navigation from "./Navbar";
import Intro from "./Intro";
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

  const loadBlockchainData = useCallback(async () => {
    // Initiate provider
    const provider = await loadProvider(dispatch);

    // Fetch current network's chainId
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
  }, [dispatch]);

  useEffect(() => {
    loadBlockchainData();
  }, [loadBlockchainData]);

  return (
    <HashRouter>
      <div className="App">
        <>
          <Navigation web3Handler={loadBlockchainData} />
        </>
        <div>
          <Routes>
            <Route path="/" element={<Intro />} />
            <Route path="/Home" element={<Home />} />
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
