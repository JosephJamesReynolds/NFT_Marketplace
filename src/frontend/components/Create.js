import axios from "axios";
import { useState } from "react";
import { ethers } from "ethers";
import { Row, Form, Button } from "react-bootstrap";
import Alert from "./Alert";

// Redux components
import { useSelector, useDispatch } from "react-redux";
import { makeItem } from "./store/interactions";

//API keys
const privateApiKey = process.env.REACT_APP_PRIVATE_API_KEY || "";
const privateSecretApiKey = process.env.REACT_APP_PRIVATE_API_SECRET_KEY || "";

const Create = () => {
  const provider = useSelector((state) => state.provider.connection);
  const nft = useSelector((state) => state.nft.contracts);
  const marketplace = useSelector((state) => state.marketplace.contract);
  const account = useSelector((state) => state.provider.account);
  const dispatch = useDispatch();
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertVariant, setAlertVariant] = useState("danger");
  const [image, setImage] = useState("");
  const [price, setPrice] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const uploadToPinata = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      formData,
      {
        maxContentLength: "Infinity", // this is needed to prevent axios from erroring out with large files
        headers: {
          "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
          pinata_api_key: privateApiKey,
          pinata_secret_api_key: privateSecretApiKey,
        },
      }
    );

    if (res.status !== 200) {
      throw new Error("Failed to upload file to Pinata");
    }

    return res.data.IpfsHash;
  };

  const uploadToIPFS = async (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onloadend = async () => {
      const ipfsHash = await uploadToPinata(new Blob([reader.result]));
      setImage(`https://ipfs.io/ipfs/${ipfsHash}`);
    };
    reader.readAsArrayBuffer(file);
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
      const listingPrice = ethers.utils.parseEther(price.toString());
      await makeItem(
        provider,
        nft,
        marketplace,
        ipfsHash,
        listingPrice,
        dispatch
      );

      setAlertMessage("NFT creation successful");
      setAlertVariant("success");
    } catch (error) {
      console.log("IPFS uri upload error", error);
      setAlertMessage("NFT creation failed");
      setAlertVariant("danger");
    }
    setShowAlert(true);
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
