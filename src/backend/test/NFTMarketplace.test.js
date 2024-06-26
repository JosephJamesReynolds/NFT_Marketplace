const { expect } = require("chai");

const toWei = (num) => ethers.utils.parseEther(num.toString()); // 1 ether == 10^18 wei;
const fromWei = (num) => ethers.utils.formatEther(num);

describe("NFTMarketplace", function () {
  let deployer, addr1, addr2, nft, marketplace;
  let feePercent = 1;
  let URI = "Sample URI";
  beforeEach(async function () {
    // Get contract factories
    const NFT = await ethers.getContractFactory("NFT");
    const Marketplace = await ethers.getContractFactory("Marketplace");
    // Get Signers
    [deployer, addr1, addr2, _] = await ethers.getSigners();
    // Deploy contracts
    nft = await NFT.deploy();
    marketplace = await Marketplace.deploy(feePercent);
  });
  describe("Deployment", function () {
    it("Should track name and symbol of the NFT collection", async function () {
      expect(await nft.name()).to.equal("Joey NFT");
      expect(await nft.symbol()).to.equal("JOE");
    });
    it("Should track feeAccount and feePercent of the marketplace", async function () {
      expect(await marketplace.feeAccount()).to.equal(deployer.address);
      expect(await marketplace.feePercent()).to.equal(feePercent);
    });
  });

  describe("Minting NFTs", function () {
    it("Should track each minted NFT", async function () {
      // addr1 mints NFT
      await nft.connect(addr1).mint(URI);
      expect(await nft.tokenCount()).to.equal(1);
      expect(await nft.balanceOf(addr1.address)).to.equal(1);
      expect(await nft.tokenURI(1)).to.equal(URI);
      // addr2 mints NFT
      await nft.connect(addr2).mint(URI);
      expect(await nft.tokenCount()).to.equal(2);
      expect(await nft.balanceOf(addr2.address)).to.equal(1);
      expect(await nft.tokenURI(2)).to.equal(URI);
    });
  });
  describe("Making marketplace items", function () {
    beforeEach(async function () {
      // addr1 mints NFT
      await nft.connect(addr1).mint(URI);
      // addr1 approves marketplace to spend NFT
      await nft.connect(addr1).setApprovalForAll(marketplace.address, true);
    });
    it("Should track newly created item, transfer NFT from seller to marketplace and emit offered event", async function () {
      // addr1 offers their nft at a price of 1 ether
      await expect(
        marketplace.connect(addr1).makeItem(nft.address, 1, toWei(1))
      )
        .to.emit(marketplace, "Offered")
        .withArgs(1, nft.address, 1, toWei(1), addr1.address);
      // Owner of NFT should now be in the marketplace
      expect(await nft.ownerOf(1)).to.equal(marketplace.address);
      // Item count should now equal 1
      expect(await marketplace.itemCount()).to.equal(1);
      // Get item from items mapping then check fields to ensure they are correct
      const item = await marketplace.items(1);
      expect(item.itemId).to.equal(1);
      expect(item.nft).to.equal(nft.address);
      expect(item.tokenId).to.equal(1);
      expect(item.price).to.equal(toWei(1));
      expect(item.sold).to.equal(false);
    });

    it("should fail if price is set to 0", async function () {
      await expect(
        marketplace.connect(addr1).makeItem(nft.address, 1, 0)
      ).to.be.revertedWith("Price must be greater than 0");
    });
  });

  describe("Buying marketplace items", function () {
    let price = 2;
    let totalPriceInWei;
    beforeEach(async function () {
      // addr1 mints NFT
      await nft.connect(addr1).mint(URI);
      // addr1 approves marketplace to spend NFT
      await nft.connect(addr1).setApprovalForAll(marketplace.address, true);
      // addr1 makes their NFT a marketplace item
      await marketplace.connect(addr1).makeItem(nft.address, 1, toWei(price));
    });
    it("Should update item as sold, pay seller, transfer NFT to buyer, charge fees and emit bought event", async function () {
      const sellerInitalEthBal = await addr1.getBalance();
      const feeAccountInitalEthBal = await deployer.getBalance();
      // fetch items total price (market fee plus item price)
      totalPriceInWei = await marketplace.getTotalPrice(1);
      // addr 2 purchases item
      await expect(
        marketplace.connect(addr2).purchaseItem(1, { value: totalPriceInWei })
      )
        .to.emit(marketplace, "Bought")
        .withArgs(
          1,
          nft.address,
          1,
          toWei(price),
          addr1.address,
          addr2.address
        );

      const sellerFinalEthBal = await addr1.getBalance();
      const feeAccountFinalEthBal = await deployer.getBalance();
      // Seller should receive payment for the price of the NFT sold
      expect(+fromWei(sellerFinalEthBal)).to.equal(
        +price + +fromWei(sellerInitalEthBal)
      );
      // Calculate fee
      const fee = (feePercent / 100) * price;
      // Fee account should receive fee
      expect(+fromWei(feeAccountFinalEthBal)).to.equal(
        +fee + +fromWei(feeAccountInitalEthBal)
      );
      // Buyer should now own the NFT
      expect(await nft.ownerOf(1)).to.equal(addr2.address);
      // Item should now be marked as sold
      expect((await marketplace.items(1)).sold).to.equal(true);
    });
    it("Should fail for invalid item ids, sold items and when not enough ether is paid", async function () {
      // Fails for invalid item ids
      await expect(
        marketplace.connect(addr2).purchaseItem(2, { value: totalPriceInWei })
      ).to.be.revertedWith("item does not exist");
      await expect(
        marketplace.connect(addr2).purchaseItem(0, { value: totalPriceInWei })
      ).to.be.revertedWith("item does not exist");
      // Fails when not enough ether is paid with the transaction
      await expect(
        marketplace.connect(addr2).purchaseItem(1, { value: toWei(price) })
      ).to.be.revertedWith(
        "Not enough ether to cover item price and market fee"
      );
      // addr2 purchases item 1
      await marketplace
        .connect(addr2)
        .purchaseItem(1, { value: totalPriceInWei });
      // deployer tries to purchase item 1 after it has been sold
      await expect(
        marketplace
          .connect(deployer)
          .purchaseItem(1, { value: totalPriceInWei })
      ).to.be.revertedWith("Item is already sold");
    });
  });
});
