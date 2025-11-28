import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { ethers } from "ethers";
import { loadAllItemsPurchased } from "./store/interactions";

const History = () => {
  const dispatch = useDispatch();
  const provider = useSelector((state) => state.provider.connection);
  const marketplace = useSelector((state) => state.marketplace.contract);
  const transactions = useSelector((state) => state.marketplace.items);

  useEffect(() => {
    if (provider && marketplace) {
      loadAllItemsPurchased(provider, marketplace, dispatch);
    }
  }, [provider, marketplace, dispatch]);

  const renderMobileCard = (transaction, index) => (
    <div key={index} className="bg-white shadow rounded-lg p-4 mb-4">
      <div className="mb-2">
        <span className="font-semibold">Transaction Hash:</span>{" "}
        <a
          className="text-blue-500 hover:underline"
          href={`https://sepolia.etherscan.io/tx/${transaction.hash}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {transaction.hash.slice(0, 5) +
            "..." +
            transaction.hash.slice(61, 66)}
        </a>
      </div>
      <div className="mb-2">
        <span className="font-semibold">NFT ID:</span>{" "}
        {transaction.itemId.toString()}
      </div>
      <div className="mb-2">
        <span className="font-semibold">Price:</span>{" "}
        {ethers.formatUnits(transaction.price.toString(), "ether")} ETH
      </div>
      <div className="mb-2">
        <span className="font-semibold">Buyer:</span>{" "}
        {transaction.buyer.slice(0, 5) +
          "..." +
          transaction.buyer.slice(38, 42)}
      </div>
      <div>
        <span className="font-semibold">Seller:</span>{" "}
        {transaction.seller.slice(0, 5) +
          "..." +
          transaction.seller.slice(38, 42)}
      </div>
    </div>
  );

  const renderDesktopTable = () => (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th
            scope="col"
            className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            Transaction Hash
          </th>
          <th
            scope="col"
            className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            NFT ID
          </th>
          <th
            scope="col"
            className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            Price
          </th>
          <th
            scope="col"
            className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            Buyer
          </th>
          <th
            scope="col"
            className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
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
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                  <a
                    className="text-blue-500 hover:underline"
                    href={`https://sepolia.etherscan.io/tx/${transaction.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {transaction.hash.slice(0, 5) +
                      "..." +
                      transaction.hash.slice(61, 66)}
                  </a>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                  {transaction.itemId.toString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                  {ethers.formatUnits(transaction.price.toString(), "ether")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                  {transaction.buyer.slice(0, 5) +
                    "..." +
                    transaction.buyer.slice(38, 42)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                  {transaction.seller.slice(0, 5) +
                    "..." +
                    transaction.seller.slice(38, 42)}
                </td>
              </tr>
            );
          })}
      </tbody>
    </table>
  );

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-2xl sm:text-3xl font-semibold mb-6 text-center">
        Transaction History
      </h2>
      <div className="hidden sm:block overflow-x-auto shadow-md rounded-lg">
        {renderDesktopTable()}
      </div>
      <div className="sm:hidden">
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
            return renderMobileCard(transaction, index);
          })}
      </div>
    </div>
  );
};

export default History;
