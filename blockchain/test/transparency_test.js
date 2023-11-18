const { expect } = require("chai");
const { ethers } = require("hardhat");
const { constants } = require("@openzeppelin/test-helpers");
const { utils } = require("web3");

describe("TransparencySC", function () {
  let transparency;
  let farmer, baker, customer;

  const ownerAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
  // const bakerAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
  // const customerAddress = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC";

  before(async function () {
    var transparencyContract = await ethers.getContractFactory(
      "TransparencySC"
    );
    transparency = await transparencyContract.deploy(ownerAddress);
    // transparency = await transparencyContract.deploy(bakerAddress);
    // transparency = await transparencyContract.deploy(customerAddress);
    // await transparency.deployed();

    [farmer, baker, customer] = await ethers.getSigners();
    console.log("Farmer address: ", farmer.address);
    console.log("Baker address: ", baker.address);
    console.log("Customer address: ", customer.address);
    // to know all functions available for testing
    // console.log(Object.keys(transparency));
  });

  it("Farmer register", async function () {
    var regDate = Date.now();
    await transparency.registerUser(
      farmer.address,
      "Juan",
      "Spain",
      regDate,
      0
    );

    var user = await transparency.getUserData(farmer.address);
    expect(user[0]).to.equal("Juan");
    expect(user[1]).to.equal("Spain");
    expect(user[2]).to.equal(regDate);
    expect(user[3]).to.equal(0);
  });

  it("Farmer mint", async function () {
    await transparency.connect(farmer).mint(0, 1234, 2, "Harina", "Kgs");
    await transparency.connect(farmer).mint(0, 987, 1, "Agua", "L");

    var attrs = await transparency.getTokenAttrs(1234);
    expect(attrs[0]).to.equal(farmer.address);
    expect(attrs[1]).to.equal(constants.ZERO_ADDRESS);
    expect(attrs[2]).to.equal(2);
    expect(attrs[3]).to.equal("Harina");
    expect(attrs[4]).to.equal("Kgs");
    expect(attrs[5]).to.equal(0);
  });

  it("Transfer token from Farmer to Baker", async function () {
    // console.log(await transparency.connect(farmer).getTokenIds());
    expect(await transparency.ownerOf(987)).to.equal(farmer.address);
    await transparency.connect(farmer).transferToBaker(baker.address, 987);
    expect(await transparency.ownerOf(987)).to.equal(baker.address);
    // console.log(await transparency.connect(farmer).getTokenIds());
  });

  it("Accept token", async function () {
    await transparency.connect(baker).accept(987);
    var attr = await transparency.getTokenAttrs(987);
    expect(attr[5]).to.equal(2);
  });

  it("Baker mint", async function () {
    await transparency.registerUser(
      baker.address,
      "Baker",
      "USA",
      Date.now(),
      1
    );

    var tokens = await transparency.connect(baker).getTokenIds();
    // console.log(tokens);
    expect(tokens[0]).to.equal(987);

    await transparency.connect(baker).mint(987, 8754, 2, "Pan", "Unit");

    var attrs = await transparency.getTokenAttrs(8754);
    expect(attrs[0]).to.equal(baker.address);
    expect(attrs[1]).to.equal(987);
    expect(attrs[2]).to.equal(2);
    expect(attrs[3]).to.equal("Pan");
    expect(attrs[4]).to.equal("Unit");
    expect(attrs[5]).to.equal(0);

    var tokens = await transparency.connect(baker).getTokenIds();
    expect(tokens[0]).to.equal(0);
    expect(tokens[1]).to.equal(8754);
  });

  it("Baker put on sale", async function () {
    await transparency.connect(baker).putOnSale(8754, utils.toWei("0.1"));

    expect(await transparency.getPrice(8754)).to.equal(utils.toWei("0.1"));
  });

  it("Customer buy", async function () {
    const farmerBalance = await farmer.provider.getBalance(farmer.address);
    console.log("Farmer balance: ", farmerBalance.toString());
    const bakerBalance = await baker.provider.getBalance(baker.address);
    console.log("Baker balance: ", bakerBalance.toString());
    const customerBalance = await customer.provider.getBalance(customer.address);
    console.log("Customer balance: ", customerBalance.toString());

    const price = await transparency.getPrice(8754);
    const tx = await transparency.connect(customer).buy(8754, { value: price });

    const receipt = await tx.wait();
    console.log('effectiveGasPrice', receipt.effectiveGasPrice);
    const gasSpent = BigInt(receipt.cumulativeGasUsed) * BigInt(receipt.effectiveGasPrice);
    // const gasSpent = await receipt.gasUsed.mul(receipt.effectiveGasPrice);
    // const gasSpent = await receipt.gasUsed * parseFloat(utils.toWei(receipt.effectiveGasPrice, 'gwei'));
    // const gasSpent = await ethers.BigNumber.from(receipt.gasUsed).mul(receipt.effectiveGasPrice);

    expect(await farmer.provider.getBalance(farmer.address)).to.equal(
      farmerBalance.add(utils.parseEther("0.02"))
    );
    expect(await baker.provider.getBalance(baker.address)).to.equal(
      bakerBalance.add(utils.parseEther("0.08"))
    );
    expect(await customer.provider.getBalance(customer.address)).to.equal(
      customerBalance.sub(price).sub(gasSpent)
    );

    expect(await transparency.ownerOf(8754)).to.equal(customer.address);
  });

  it("Event of history", async function () {
    const events987 = await transparency.queryFilter(
      transparency.filters.Transaction(null, 987, null)
    );
    console.log("Events for token 987: ", events987);
    const events8754 = await transparency.queryFilter(
      transparency.filters.Transaction(null, 8754, null)
    );
    console.log("Events for token 8754: ", events8754);
  });
});
