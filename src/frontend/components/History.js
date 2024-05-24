import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import Table from "react-bootstrap/Table";
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
  }, [provider, marketplace]);

  console.log(transactions); // Check the content of the transactions array

  return (
    <div>
      {provider && marketplace ? (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Transaction Hash</th>
              <th>NFT ID</th>
              <th>Price</th>
              <th>Buyer</th>
              <th>Seller</th>
            </tr>
          </thead>
          <tbody>
            {transactions &&
              transactions.map((transaction, index) => {
                console.log(transaction);
                if (
                  !transaction.itemId ||
                  !transaction.price ||
                  !transaction.buyer ||
                  !transaction.seller
                ) {
                  return null; // or some placeholder component
                }

                return (
                  <tr key={index}>
                    <td>
                      {transaction.hash.slice(0, 5) +
                        "..." +
                        transaction.hash.slice(61, 66)}
                    </td>
                    <td>{transaction.itemId.toString()}</td>
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
                  </tr>
                );
              })}
          </tbody>
        </Table>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
};

export default History;
