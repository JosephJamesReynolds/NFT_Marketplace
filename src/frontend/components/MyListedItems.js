import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useSelector, useDispatch } from "react-redux";
import { loadAccount } from "./store/interactions";

function renderSoldItems(items, scrollableText) {
  return (
    <>
      <h2 className="text-4xl font-bold">Sold</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 py-3">
        {items.map((item, idx) => (
          <div key={idx}>
            <div className="bg-white shadow rounded-lg">
              <img className="w-full" src={item.image} alt={item.name} />
              <div className="p-4">
                <strong>Name:</strong>{" "}
                <div style={scrollableText}>{item.name}</div>
                <br />
                <strong>Description:</strong>{" "}
                <div style={scrollableText}>{item.description}</div>
                <br />
                <strong>Price:</strong>{" "}
                {ethers.utils.formatEther(item.totalPrice)} ETH
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default function MyListedItems() {
  //REDUX
  const dispatch = useDispatch();
  const marketplace = useSelector((state) => state.marketplace.contract);
  const nft = useSelector((state) => state.nft.contracts);
  const account = useSelector((state) => state.provider.account);

  //REACT STATE
  const [loading, setLoading] = useState(true);
  const [listedItems, setListedItems] = useState([]);
  const [soldItems, setSoldItems] = useState([]);

  const scrollableText = {
    overflowX: "auto",
    whiteSpace: "nowrap",
  };

  const handleConnectWallet = async () => {
    await loadAccount(dispatch);
  };

  useEffect(() => {
    if (!marketplace || !account) {
      return;
    }
    const loadListedItems = async () => {
      if (!marketplace || !account) {
        console.log("Marketplace or account is not initialized");
        return;
      }
      // Load all sold items that the user listed
      const itemCount = await marketplace.itemCount();
      let listedItems = [];
      let soldItems = [];
      for (let indx = 1; indx <= itemCount; indx++) {
        const i = await marketplace.items(indx);
        if (i.seller.toLowerCase() === account.toLowerCase()) {
          // get uri url from nft contract
          const uri = await nft.tokenURI(i.tokenId);
          // use uri to fetch the nft metadata stored on ipfs
          const response = await fetch(uri);
          const metadata = await response.json();
          // get total price of item (item price + fee)
          const totalPrice = await marketplace.getTotalPrice(i.itemId);
          // define listed item object
          let item = {
            totalPrice,
            price: i.price,
            itemId: i.itemId,
            name: metadata.name,
            description: metadata.description,
            image: metadata.image,
          };
          listedItems.push(item);
          // Add listed item to sold items array if sold
          if (i.sold) soldItems.push(item);
        }
      }
      setLoading(false);
      setListedItems(listedItems);
      setSoldItems(soldItems);
    };
    loadListedItems();
  }, [marketplace, nft, account]);

  if (loading) {
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
            Please{" "}
            <button
              onClick={handleConnectWallet}
              className="bg-blue-500 text-white px-2 py-1 rounded transition duration-500 ease-in-out hover:bg-blue-700"
            >
              connect your wallet
            </button>{" "}
            to get started
          </h2>
        </div>
      </main>
    );
  } else {
    return (
      <div className="flex justify-center">
        {listedItems.length > 0 ? (
          <div className="px-5 py-3 container">
            <h2 className="text-4xl font-bold">Listed</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 py-3">
              {listedItems.map((item, idx) => (
                <div key={idx}>
                  <div className="bg-white shadow rounded-lg">
                    <img className="w-full" src={item.image} alt={item.name} />
                    <div className="p-4">
                      <strong>Name:</strong>{" "}
                      <div style={scrollableText}>{item.name}</div>
                      <br />
                      <strong>Description:</strong>{" "}
                      <div style={scrollableText}>{item.description}</div>
                      <br />
                      <strong>Price:</strong>{" "}
                      {ethers.utils.formatEther(item.totalPrice)} ETH
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {soldItems.length > 0 && renderSoldItems(soldItems, scrollableText)}
          </div>
        ) : (
          <main className="py-4">
            <h2 className="text-4xl font-bold">No listed assets</h2>
          </main>
        )}
      </div>
    );
  }
}
