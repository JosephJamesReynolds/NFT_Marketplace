import React, { useEffect } from "react"; // Add this line
import { useSelector, useDispatch } from "react-redux";
import Table from "react-bootstrap/Table";
import { ethers } from "ethers";

import {
  loadAllItemsCreated,
  loadAllItemsPurchased,
} from "./store/interactions";

const History = () => {
  const dispatch = useDispatch();

  const provider = useSelector((state) => state.provider.connection);
  const marketplace = useSelector((state) => state.marketplace.contract);
  const nft = useSelector((state) => state.nft.contracts);
  const account = useSelector((state) => state.provider.account);

  const transactions = useSelector((state) => state.transactions);

  useEffect(() => {
    if (provider && marketplace) {
      loadAllItemsCreated(provider, marketplace, dispatch);
      loadAllItemsPurchased(provider, marketplace, dispatch);
    }
  }, [provider, marketplace, dispatch]);

  return (
    <Table striped bordered hover>
      <thead>
        <tr>
          <th>Transaction Hash</th>
          <th>NFT ID</th>
          <th>Price</th>
          <th>Buyer</th>
          <th>Seller</th>
          <th>Time</th>
        </tr>
      </thead>
      <tbody>
        {transactions &&
          transactions.length > 0 &&
          transactions.map((transaction, index) => (
            <tr key={index}>
              <td>
                {transaction.hash.slice(0, 5) +
                  "..." +
                  transaction.hash.slice(61, 66)}
              </td>
              <td>{transaction.nft.Id.toString()}</td>
              <td>
                {ethers.utils.formatUnits(
                  transaction.price.toString(),
                  "ether"
                )}
              </td>
              <td>
                {transaction.buyer.slice(0, 5) +
                  "..." +
                  transaction.buyer.slice(38, 42)}
              </td>
              <td>
                {transaction.seller.slice(0, 5) +
                  "..." +
                  transaction.seller.slice(38, 42)}
              </td>
              <td>
                {new Date(
                  Number(transaction.timestamp.toString() + "000")
                ).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                  second: "numeric",
                })}
              </td>
            </tr>
          ))}
      </tbody>
    </Table>
  );
};

export default History;
