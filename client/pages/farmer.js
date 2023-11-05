import { Contract, utils } from "ethers";
import React, { useEffect, useState } from "react";
import { NFT_CONTRACT_ADDRESS, ABI } from "../constants";
// styles and html components
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import styles from "../styles/Home.module.css";
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';


export default function Farmer(props) {

  const [loading, setLoading] = useState(false);
  const [tokens, setTokens] = useState([]);
  const [prevIndex, setPrevIndex] = useState(null);
  const [selectedTokenId, setSelectedTokenId] = useState('');
  // variables related to mint of token
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');

  const bakerAddress = "0xbb08598F0D75c9Ff8f84d82EC324b0F1B79B7aCf";


  const getContract = async (needSigner = false) => {
    if (needSigner) {
      const signer = props.provider.getSigner();
      return new Contract(NFT_CONTRACT_ADDRESS, ABI, signer);
    }
    return new Contract(NFT_CONTRACT_ADDRESS, ABI, props.provider);
  }

  const getTokens = async () => {
    const transparency = await getContract(true);
    const tokens = await transparency.getTokenIds();
    var res = [];

    for (var i = 0; i < tokens.length; i++) {
      var id = tokens[i].toNumber();
      if (id != 0) {
        const attrs = await transparency.getTokenAttrs(tokens[i]);
        res.push({
          tokenId: id,
          product: attrs[3],
          quantity: attrs[2],
          unit: attrs[4],
          state: attrs[5]
        });
      }
    }

    setTokens(res);
    setLoading(false);
  }

  const mintFarmer = async () => {
    try {
      let tokenId = Date.now();
      const transparency = await getContract(true);
      const tx = await transparency.mint(0, tokenId, quantity, productName, unit);

      setLoading(true);
      await tx.wait();

    } catch (error) {
      console.log(error);
      window.alert("There was an error with the mint!");
    }
  }

  const handleMint = event => {

    event.preventDefault();

    mintFarmer();

    setPrevIndex(null);
    setSelectedTokenId('');
    setQuantity('');
    setProductName('');
    setUnit('');
  }

  const transferBaker = async () => {
    try {
      const transparency = await getContract(true);
      const tx = await transparency.transferToBaker(utils.getAddress(bakerAddress), selectedTokenId);

      setLoading(true);
      await tx.wait();

    } catch (error) {
      console.log(error);
      window.alert("There was an error with transfer");
    }
  }

  const onClickTokenSelect = (tokenId, index) => {
    if (prevIndex == index) {
      setPrevIndex(null);
      setSelectedTokenId('');
    } else {
      setPrevIndex(index);
      setSelectedTokenId(tokenId);
    }
  }

  const translateState = (state) => {
    switch (state) {
      case 0:
        return "New";
      case 1:
        return "Delivered";
      case 2:
        return "Accepted";
      case 3:
        return "Rejected";
    }
  }

  useEffect(() => {

    const transparency = new Contract(NFT_CONTRACT_ADDRESS, ABI, props.provider);

    var currentAccount;
    props.provider.send("eth_requestAccounts", []).then(function (result) {
      currentAccount = utils.getAddress(result[0]);
    });

    async function fetchTokens() {
      setLoading(true);
      await getTokens();
    }
    fetchTokens();

    transparency.on(transparency.filters.Transaction(currentAccount, null, 0), async (_from, _tokenId, _state) => {
      setLoading(true);
      await getTokens();
    });

    transparency.on(transparency.filters.Transaction(bakerAddress, null, [1, 3]), async (_from, _tokenId, _state) => {
      setLoading(true);
      await getTokens();
    });

    return () => {
      props.provider.removeAllListeners();
    }

  }, [props])


  return (
    <div>
      <div className={styles.main}>
        <div className={styles.title}>
          <img width={100} height={100} src="/farmerColor.png" alt="farmer icon" />
          <h2>Farmer User Account</h2>
        </div>

        <Table striped bordered hover className={styles.table}>
          <thead>
            <tr>
              <th>Select</th>
              <th>Token ID</th>
              <th>Product Name</th>
              <th>Quantity</th>
              <th>Unit</th>
              <th>State</th>
            </tr>
          </thead>
          <tbody>

            {loading ?
              <tr>
                <td style={{ '--bs-table-accent-bg': 'white', 'textAlign': 'center' }} colSpan='6'>
                  <img src="./loading.gif" alt="loading..." />
                  <p className={styles.p_no_margin}>Loading, wait some seconds...</p>
                </td>
              </tr>
              :
              tokens.map((item, index) => (
                <tr key={index}>
                  <td>
                    <Form.Check
                      type='radio'
                      id={item.tokenId}
                      value={item.tokenId}
                      name="selectedToken"
                      checked={prevIndex == index}
                      readOnly
                      onClick={event => onClickTokenSelect(event.target.value, index)}
                    />
                  </td>
                  <td>{item.tokenId}</td>
                  <td>{item.product}</td>
                  <td>{item.quantity}</td>
                  <td>{item.unit}</td>
                  <td>{translateState(item.state)}</td>
                </tr>
              ))
            }

          </tbody>
        </Table>


        <div className={styles.flexContainer}>
          <div className={styles.form}>
            <Form onSubmit={handleMint}>
              <h4>Mint</h4>
              <Form.Group className="mb-3" controlId="productName">
                <Form.Label>Product Name</Form.Label>
                <Form.Control
                  placeholder="Enter name of product"
                  value={productName}
                  onChange={event => setProductName(event.target.value)}
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="quantity">
                <Form.Label>Quantity</Form.Label>
                <Form.Control
                  placeholder="Enter quantity"
                  value={quantity}
                  onChange={event => setQuantity(event.target.value)}
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="unit">
                <Form.Select
                  value={unit}
                  onChange={event => setUnit(event.target.value)}>
                  <option>Select unit</option>
                  <option value="Kgs">Kgs</option>
                  <option value="L">L</option>
                  <option value="Unit">Unit</option>
                </Form.Select>
              </Form.Group>
              {
                <Button variant="primary" type="submit" disabled={productName == '' || quantity == '' || unit == ''}>
                  Mint
                </Button>
              }

            </Form>
          </div>

          <div className={styles.form}>
            <h4>Transfers</h4>
            {
              <div>
                <p>Select first the token to transfer</p>
                <Button variant="primary" onClick={transferBaker} disabled={selectedTokenId == ''}>
                  Transfer to baker
                </Button>
              </div>
            }
          </div>
        </div>

      </div>
    </div>
  )
}
