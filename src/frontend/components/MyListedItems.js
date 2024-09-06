import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useSelector, useDispatch } from "react-redux";
import { loadAccount } from "./store/interactions";

function renderSoldItems(items) {
  return (
    <>
      <h2 className="text-2xl sm:text-4xl font-bold mb-6 mt-12">Sold</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="bg-white shadow rounded-lg overflow-hidden flex flex-col h-full"
          >
            <div className="aspect-w-1 aspect-h-1 w-full">
              <img
                className="w-full h-full object-cover"
                src={item.image}
                alt={item.name}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "path/to/fallback/image.jpg";
                }}
              />
            </div>
            <div className="p-4 flex-grow flex flex-col justify-between">
              <div>
                <strong>Name:</strong>{" "}
                <div className="overflow-hidden text-ellipsis whitespace-nowrap mb-2">
                  {item.name}
                </div>
                <strong>Description:</strong>{" "}
                <div className="overflow-hidden text-ellipsis whitespace-nowrap mb-2">
                  {item.description}
                </div>
              </div>
              <div>
                <strong>Price:</strong>{" "}
                <span className="text-blue-600 font-semibold">
                  {ethers.utils.formatEther(item.totalPrice)} ETH
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default function MyListedItems() {
  // REDUX STATE
  const dispatch = useDispatch();
  const marketplace = useSelector((state) => state.marketplace.contract);
  const nft = useSelector((state) => state.nft.contracts);
  const account = useSelector((state) => state.provider.account);

  // REACT STATE
  const [listedItems, setListedItems] = useState([]);
  const [soldItems, setSoldItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleConnectWallet = async () => {
    await loadAccount(dispatch);
  };

  useEffect(() => {
    const loadListedItems = async () => {
      if (!marketplace || !account) {
        setLoading(false);
        return;
      }
      try {
        const itemCount = await marketplace.itemCount();
        let listedItems = [];
        let soldItems = [];
        for (let indx = 1; indx <= itemCount; indx++) {
          const i = await marketplace.items(indx);
          if (i.seller.toLowerCase() === account.toLowerCase()) {
            const uri = await nft.tokenURI(i.tokenId);
            const response = await fetch(uri);
            const metadata = await response.json();
            const totalPrice = await marketplace.getTotalPrice(i.itemId);
            let item = {
              totalPrice,
              price: i.price,
              itemId: i.itemId,
              name: metadata.name,
              description: metadata.description,
              image: metadata.image,
            };
            listedItems.push(item);
            if (i.sold) soldItems.push(item);
          }
        }
        setListedItems(listedItems);
        setSoldItems(soldItems);
      } catch (error) {
        console.error("Failed to load items:", error);
      } finally {
        setLoading(false);
      }
    };
    loadListedItems();
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
      {account ? (
        listedItems.length > 0 ? (
          <>
            <h2 className="text-2xl sm:text-4xl font-bold mb-6">Listed</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {listedItems.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white shadow rounded-lg overflow-hidden flex flex-col h-full"
                >
                  <div className="aspect-w-1 aspect-h-1 w-full">
                    <img
                      className="w-full h-full object-cover"
                      src={item.image}
                      alt={item.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "path/to/fallback/image.jpg";
                      }}
                    />
                  </div>
                  <div className="p-4 flex-grow flex flex-col justify-between">
                    <div>
                      <strong>Name:</strong>{" "}
                      <div className="overflow-hidden text-ellipsis whitespace-nowrap mb-2">
                        {item.name}
                      </div>
                      <strong>Description:</strong>{" "}
                      <div className="overflow-hidden text-ellipsis whitespace-nowrap mb-2">
                        {item.description}
                      </div>
                    </div>
                    <div>
                      <strong>Price:</strong>{" "}
                      <span className="text-blue-600 font-semibold">
                        {ethers.utils.formatEther(item.totalPrice)} ETH
                      </span>{" "}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {soldItems.length > 0 && renderSoldItems(soldItems)}
          </>
        ) : (
          <h2 className="text-2xl sm:text-4xl font-bold">No listed assets</h2>
        )
      ) : (
        <main className="py-4">
          <h2 className="text-2xl sm:text-4xl font-bold">No listed assets</h2>
        </main>
      )}
    </div>
  );
}
