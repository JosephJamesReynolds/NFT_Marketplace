import axios from "axios";
import { useState } from "react";
import { ethers } from "ethers";
import { Row, Form, Button } from "react-bootstrap";
import Alert from "./Alert";

// Redux components
import { useDispatch } from "react-redux";
import { makeItem } from "./store/interactions";

//API keys
const privateApiKey = process.env.REACT_APP_PRIVATE_API_KEY || "";
const privateSecretApiKey = process.env.REACT_APP_PRIVATE_API_SECRET_KEY || "";

const Create = ({ marketplace, nft }) => {
  const dispatch = useDispatch();
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertVariant, setAlertVariant] = useState("danger");
  const [image, setImage] = useState("");
  const [price, setPrice] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  console.log(nft);

  // console.log(privateApiKey, privateSecretApiKey);

  const uploadToPinata = async (file) => {
    const url = "https://api.pinata.cloud/pinning/pinFileToIPFS";
    let data = new FormData();
    data.append("file", file);

    const response = await axios.post(url, data, {
      maxContentLength: "Infinity",
      headers: {
        "Content-Type": `multipart/form-data; boundary=${data._boundary}`,
        pinata_api_key: privateApiKey,
        pinata_secret_api_key: privateSecretApiKey,
      },
    });

    return response.data.IpfsHash;
  };

  const uploadToIPFS = async (event) => {
    event.preventDefault();
    const file = event.target.files[0];
    if (typeof file !== "undefined") {
      try {
        const ipfsHash = await uploadToPinata(file);
        console.log("IPFS hash", ipfsHash);
        setImage(`https://gateway.pinata.cloud/ipfs/${ipfsHash}`);
      } catch (error) {
        console.log("Pinata upload error", error);
      }
    }
  };
  const createNFT = async () => {
    if (!image || !price || !name || !description) return;
    try {
      const file = new Blob(
        [JSON.stringify({ image, price, name, description })],
        {
          type: "application/json",
        }
      );
      const ipfsHash = await uploadToPinata(file);
      mintThenList(ipfsHash);
      setAlertMessage("NFT creation successful");
      setAlertVariant("success");
    } catch (error) {
      console.log("IPFS uri upload error", error);
      setAlertMessage("NFT creation failed");
      setAlertVariant("danger");
    }
    setShowAlert(true);
  };

  const mintThenList = async (ipfsHash) => {
    if (!nft) {
      console.error("nft is undefined");
      return;
    }
    const uri = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
    // mint nft
    await (await nft.mint(uri)).wait();
    // get tokenId of new nft
    const id = await nft.tokenCount();
    // approve marketplace to spend nft
    await (await nft.setApprovalForAll(marketplace.address, true)).wait();
    // add nft to marketplace
    const listingPrice = ethers.utils.parseEther(price.toString());
    // Get the provider
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    // Dispatch the makeItem action
    dispatch(makeItem(provider, nft, marketplace, id, listingPrice, dispatch));
  };

  return (
    <div className="container-fluid mt-5">
      <div className="row">
        <main
          role="main"
          className="col-lg-12 mx-auto"
          style={{ maxWidth: "1000px" }}
        >
          <div className="content mx-auto">
            {showAlert && (
              <Alert
                message={alertMessage}
                transactionHash={null} // or the actual transaction hash if available
                variant={alertVariant}
                setShowAlert={setShowAlert}
              />
            )}
            <Row className="g-4">
              <Form.Control
                type="file"
                required
                name="file"
                onChange={uploadToIPFS}
              />
              <Form.Control
                onChange={(e) => setName(e.target.value)}
                size="lg"
                required
                type="text"
                placeholder="Name"
              />
              <Form.Control
                onChange={(e) => setDescription(e.target.value)}
                size="lg"
                required
                as="textarea"
                placeholder="Description"
              />
              <Form.Control
                onChange={(e) => setPrice(e.target.value)}
                size="lg"
                required
                type="number"
                placeholder="Price in ETH"
              />
              <div className="d-grid px-0">
                <Button onClick={createNFT} variant="primary" size="lg">
                  Create & List NFT!
                </Button>
              </div>
            </Row>
          </div>
        </main>
      </div>
    </div>
  );
};
export default Create;
