import React, { useState, useEffect, useCallback } from "react";
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
  const [loading, setLoading] = useState(true);

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
  }, [marketplace, nft, account]);

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
        className="py-4 px-4 sm:px-0"
        style={{ fontSize: "24px", fontFamily: "Arial, sans-serif" }}
      >
        <div style={{ margin: "20px 0" }}>
          <h2 style={{ fontSize: "36px" }}>
            Welcome to Joseph's NFT Marketplace.
          </h2>
          <h2 style={{ marginTop: "20px", fontSize: "30px" }}>
            <button
              onClick={handleConnectWallet}
              className="bg-blue-500 text-white px-4 py-2 rounded transition duration-500 ease-in-out hover:bg-blue-700"
              style={{ fontSize: "inherit" }}
            >
              Connect your wallet
            </button>{" "}
            <span className="inline-block mt-2 sm:mt-0">to get started.</span>
          </h2>
        </div>
      </main>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {(isBuying || isSuccess || (!isSuccess && showAlert)) && (
        <div className="mb-4">
          <Alert
            message={
              isBuying
                ? "Purchase Pending..."
                : isSuccess
                ? "Purchase Successful"
                : "Purchase Failed"
            }
            transactionHash={isSuccess ? transactionHash : null}
            variant={isBuying ? "info" : isSuccess ? "success" : "danger"}
            setShowAlert={setShowAlert}
          />
        </div>
      )}

      {items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col"
            >
              <div className="aspect-w-1 aspect-h-1 w-full">
                <img
                  className="w-full h-full object-cover"
                  src={item.image}
                  alt={item.name}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/path/to/fallback/image.jpg";
                  }}
                />
              </div>
              <div className="p-4 flex-grow flex flex-col justify-between">
                <div>
                  <strong>Name:</strong>{" "}
                  <div className="font-bold text-xl mb-2 truncate">
                    {item.name}
                  </div>
                  <strong>Description:</strong>{" "}
                  <p className="text-gray-700 text-sm mb-4 overflow-hidden line-clamp-3">
                    {item.description}
                  </p>
                  <strong>Price:</strong>{" "}
                  <div className="text-lg font-semibold text-blue-600 mb-4">
                    {ethers.utils.formatEther(item.totalPrice)} ETH
                  </div>
                </div>
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
                  className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
                >
                  Buy Now
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">
            No listed assets
          </h1>
        </div>
      )}
    </div>
  );
};

export default Home;
