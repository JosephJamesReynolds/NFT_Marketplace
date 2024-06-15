// Adjusted Home.js with loading logic and spinner from MyPurchases

import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { useSelector, useDispatch } from "react-redux";
import { buyItem, loadAccount } from "./store/interactions";
import Alert from "./Alert";

const Home = () => {
  // REDUX STATE
  const provider = useSelector((state) => state.provider.connection);
  const account = useSelector((state) => state.provider.account);
  const marketplace = useSelector((state) => state.marketplace.contract);
  const nft = useSelector((state) => state.nft.contracts);
  const isBuying = useSelector((state) => state.marketplace.buying.isBuying);
  const isSuccess = useSelector((state) => state.marketplace.buying.isSuccess);
  const transactionHash = useSelector(
    (state) => state.marketplace.buying.transactionHash
  );
  const dispatch = useDispatch();

  // REACT STATE
  const [items, setItems] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [loading, setLoading] = useState(true); // Added loading state

  const handleConnectWallet = async () => {
    await loadAccount(dispatch);
  };

  const loadMarketplaceItems = useCallback(async () => {
    if (!marketplace || !nft || !account) {
      setLoading(false);
      return;
    }
    try {
      const itemCount = await marketplace.itemCount();
      let items = [];
      for (let i = 1; i <= itemCount; i++) {
        const item = await marketplace.items(i);
        if (!item.sold) {
          const uri = await nft.tokenURI(item.tokenId);
          const response = await fetch(uri);
          const metadata = await response.json();
          const totalPrice = await marketplace.getTotalPrice(item.itemId);
          items.push({
            totalPrice: totalPrice,
            itemId: item.itemId,
            seller: item.seller,
            name: metadata.name,
            description: metadata.description,
            image: metadata.image,
          });
        }
      }
      setItems(items);
    } catch (error) {
      console.error("Failed to load marketplace items:", error);
    } finally {
      setLoading(false);
    }
  }, [marketplace, nft, account]); // Dependencies

  useEffect(() => {
    loadMarketplaceItems();
  }, [loadMarketplaceItems]);
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!account) {
    return (
      <main
        className="py-4"
        style={{ fontSize: "24px", fontFamily: "Arial, sans-serif" }}
      >
        <div style={{ margin: "20px 0" }}>
          <h2 style={{ fontSize: "36px" }}>
            Welcome to Joseph's NFT Marketplace.
          </h2>
          <h2 style={{ marginTop: "20px", fontSize: "30px" }}>
            <button
              onClick={handleConnectWallet}
              className="bg-blue-500 text-white px-2 py-1 rounded transition duration-500 ease-in-out hover:bg-blue-700"
            >
              Connect your wallet
            </button>{" "}
            to get started.
          </h2>
        </div>
      </main>
    );
  } else {
    return (
      <div className="flex justify-center">
        {isBuying ? (
          <Alert
            message={"Purchase Pending..."}
            transactionHash={null}
            variant={"info"}
            setShowAlert={setShowAlert}
          />
        ) : isSuccess && showAlert ? (
          <Alert
            message={"Purchase Successful"}
            transactionHash={transactionHash}
            variant={"success"}
            setShowAlert={setShowAlert}
          />
        ) : !isSuccess && showAlert ? (
          <Alert
            message={"Purchase Failed"}
            transactionHash={null}
            variant={"danger"}
            setShowAlert={setShowAlert}
          />
        ) : (
          <></>
        )}
        {items.length > 0 ? (
          <div className="px-5 container">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 py-5">
              {items.map((item, idx) => (
                <div key={idx} className="overflow-hidden rounded shadow-lg">
                  <img className="w-full" src={item.image} alt={item.name} />
                  <div className="px-6 py-4">
                    <div className="font-bold text-xl mb-2">{item.name}</div>
                    <p className="text-gray-700 text-base">
                      {item.description}
                    </p>
                  </div>
                  <div className="px-6 pt-4 pb-2">
                    <button
                      onClick={async () => {
                        setShowAlert(false);
                        await buyItem(
                          provider,
                          marketplace,
                          item.itemId,
                          account,
                          dispatch
                        );
                        await loadMarketplaceItems();
                        setShowAlert(true);
                      }}
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                      Buy for {ethers.utils.formatEther(item.totalPrice)} ETH
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <main className="p-4">
            <h1 className="text-4xl font-bold">No listed assets</h1>
          </main>
        )}
      </div>
    );
  }
};

export default Home;
