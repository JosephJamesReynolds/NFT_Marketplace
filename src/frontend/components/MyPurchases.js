import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { ethers } from "ethers";

export default function MyPurchases() {
  const [loading, setLoading] = useState(true);
  const [purchases, setPurchases] = useState([]);

  // Access state from Redux store
  const marketplace = useSelector((state) => state.marketplace.contract);
  const nft = useSelector((state) => state.nft.contracts);
  const account = useSelector((state) => state.provider.account);

  // Add loading states for marketplace, nft, and account
  const [marketplaceLoaded, setMarketplaceLoaded] = useState(false);
  const [nftLoaded, setNftLoaded] = useState(false);
  const [accountLoaded, setAccountLoaded] = useState(false);

  useEffect(() => {
    if (marketplace) setMarketplaceLoaded(true);
    if (nft) setNftLoaded(true);
    if (account) setAccountLoaded(true);
  }, [marketplace, nft, account]);

  useEffect(() => {
    // Only run if marketplace, nft, and account are loaded
    if (!marketplaceLoaded || !nftLoaded || !accountLoaded) {
      return;
    }
    const loadPurchasedItems = async () => {
      if (!marketplace) {
        console.log("Marketplace contract is not loaded");
        return;
      }
      // Fetch purchased items from marketplace by quering Offered events with the buyer set as the user
      const filter = marketplace.filters.Bought(
        null,
        null,
        null,
        null,
        null,
        account
      );
      const results = await marketplace.queryFilter(filter);
      //Fetch metadata of each nft and add that to listedItem object.
      const purchases = await Promise.all(
        results.map(async (i) => {
          // fetch arguments from each result
          i = i.args;
          // get uri url from nft contract
          const uri = await nft.tokenURI(i.tokenId);
          // use uri to fetch the nft metadata stored on ipfs
          const response = await fetch(uri);
          const metadata = await response.json();
          // get total price of item (item price + fee)
          const totalPrice = await marketplace.getTotalPrice(i.itemId);
          // define listed item object
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
      setLoading(false);
      setPurchases(purchases);
    };

    loadPurchasedItems();
  }, [marketplaceLoaded, nftLoaded, accountLoaded]); // Depend on loading states instead

  if (loading)
    return (
      <main className="py-4">
        <h2>Loading...</h2>
      </main>
    );
  return (
    <div className="flex justify-center">
      {purchases.length > 0 ? (
        <div className="px-5 container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 py-5">
            {purchases.map((item, idx) => (
              <div key={idx} className="overflow-hidden">
                <div className="max-w-sm rounded overflow-hidden shadow-lg">
                  <img
                    className="w-full"
                    src={item.image}
                    alt="Sunset in the mountains"
                  />
                  <div className="px-6 py-4">
                    <div className="font-bold text-xl mb-2">
                      {ethers.utils.formatEther(item.totalPrice)} ETH
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <main className="py-4">
          <h2>No purchases</h2>
        </main>
      )}
    </div>
  );
}
