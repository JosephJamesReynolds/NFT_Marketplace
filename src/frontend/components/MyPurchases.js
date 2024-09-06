import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { loadAccount } from "./store/interactions";
import { ethers } from "ethers";

export default function MyPurchases() {
  // REDUX STATE
  const dispatch = useDispatch();
  const marketplace = useSelector((state) => state.marketplace.contract);
  const nft = useSelector((state) => state.nft.contracts);
  const account = useSelector((state) => state.provider.account);

  // REACT STATE
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleConnectWallet = async () => {
    await loadAccount(dispatch);
  };

  useEffect(() => {
    const loadPurchasedItems = async () => {
      if (!marketplace || !nft || !account) {
        setLoading(false);
        return;
      }
      try {
        const filter = marketplace.filters.Bought(
          null,
          null,
          null,
          null,
          null,
          account
        );
        const results = await marketplace.queryFilter(filter);
        const purchases = await Promise.all(
          results.map(async (i) => {
            i = i.args;
            const uri = await nft.tokenURI(i.tokenId);
            const response = await fetch(uri);
            const metadata = await response.json();
            const totalPrice = await marketplace.getTotalPrice(i.itemId);
            let purchasedItem = {
              totalPrice,
              price: i.price,
              itemId: i.itemId,
              name: metadata.name,
              description: metadata.description,
              image: metadata.image,
            };
            return purchasedItem;
          })
        );
        setPurchases(purchases);
      } catch (error) {
        console.error("Failed to load purchases:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPurchasedItems();
  }, [marketplace, nft, account]);

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
      <h1 className="text-2xl sm:text-4xl font-bold mb-6 text-center">
        My Collection
      </h1>
      {purchases.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {purchases.map((item, idx) => (
            <div
              key={idx}
              className="bg-white shadow rounded-lg overflow-hidden flex flex-col"
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
                  <div className="font-bold text-lg mb-2 truncate">
                    {item.name}
                  </div>
                  <strong>Description:</strong>{" "}
                  <p className="text-gray-600 text-sm mb-4 overflow-hidden line-clamp-3">
                    {item.description}
                  </p>
                  <strong>Price:</strong>{" "}
                  <div className="text-lg font-semibold text-blue-600">
                    {ethers.utils.formatEther(item.totalPrice)} ETH
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-xl sm:text-3xl text-gray-600">
            No purchases yet
          </h2>
        </div>
      )}
    </div>
  );
}
