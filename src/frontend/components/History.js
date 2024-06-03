import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { ethers } from "ethers";
import { loadAllItemsPurchased } from "./store/interactions";

const History = () => {
  // REDUX
  const dispatch = useDispatch();
  const provider = useSelector((state) => state.provider.connection);
  const marketplace = useSelector((state) => state.marketplace.contract);
  const transactions = useSelector((state) => state.marketplace.items);

  useEffect(() => {
    if (provider && marketplace) {
      loadAllItemsPurchased(provider, marketplace, dispatch);
    }
  }, [provider, marketplace, dispatch]);

  return (
    <div>
      {provider && marketplace ? (
        <div className=" w-full overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-center text-s font-bold text-gray-500 uppercase tracking-wider">
                  Transaction Hash
                </th>
                <th className="px-6 py-3 text-center text-s font-bold text-gray-500 uppercase tracking-wider">
                  NFT ID
                </th>
                <th className="px-6 py-3 text-center text-s font-bold text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-center text-s font-bold text-gray-500 uppercase tracking-wider">
                  Buyer
                </th>
                <th className="px-6 py-3 text-center text-s font-bold text-gray-500 uppercase tracking-wider">
                  Seller
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions &&
                transactions.map((transaction, index) => {
                  if (
                    !transaction.itemId ||
                    !transaction.price ||
                    !transaction.buyer ||
                    !transaction.seller
                  ) {
                    return null;
                  }

                  return (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {transaction.hash.slice(0, 5) +
                          "..." +
                          transaction.hash.slice(61, 66)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {transaction.itemId.toString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {ethers.utils.formatUnits(
                          transaction.price.toString(),
                          "ether"
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {transaction.buyer.slice(0, 5) +
                          "..." +
                          transaction.buyer.slice(38, 42)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {transaction.seller.slice(0, 5) +
                          "..." +
                          transaction.seller.slice(38, 42)}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
};

export default History;
