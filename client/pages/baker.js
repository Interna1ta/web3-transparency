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
  const [productPrice, setProductPrice] = useState('');
  // helpers variables for forms
  const [isNew, setIsNew] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);

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

  const getState = async (tokenId) => {
    try {
      const transparency = await getContract();
      return await transparency.getState(tokenId);
    } catch (error) {
      console.log(error);
      window.alert("There was an error when getting the state of the token");
    }
  }

  const accept = async (tokenId) => {
    try {
      const transparency = await getContract(true);
      const tx = await transparency.accept(tokenId);

      setLoading(true);
      await tx.wait();

    } catch (error) {
      console.log(error);
      window.alert("There was an error when accepting token");
    }
  }

  const reject = async (tokenId) => {
    try {
      const transparency = await getContract(true);
      const tx = await transparency.reject(tokenId);

      setLoading(true);
      await tx.wait();

    } catch (error) {
      console.log(error);
      window.alert("There was an error when accepting token");
    }
  }

  const mintBaker = async () => {
    try {
      const transparency = await getContract(true);
      const tx = await transparency.mint(selectedTokenId, Date.now(), quantity, productName, unit);

      setLoading(true);
      await tx.wait();

    } catch (error) {
      console.log(error);
      window.alert("There was an error with the minting of the token");
    }
  }

  const handleMint = event => {

    event.preventDefault();

    mintBaker();

    setPrevIndex(null);
    setSelectedTokenId('');
    setProductName('');
    setQuantity('');
    setUnit('');
  }

  const putOnSale = async () => {
    try {
      const transparency = await getContract(true);
      const tx = await transparency.putOnSale(selectedTokenId, utils.parseEther(productPrice));

      setLoading(true);
      await tx.wait();

    } catch (error) {
      console.log(error);
      window.alert("There was an error with the on sale");
    }
  }

  const handlePutOnSale = event => {

    event.preventDefault();

    putOnSale();

    setPrevIndex(null);
    setSelectedTokenId('');
    setProductPrice('');
  }

  const onClickTokenSelect = (tokenId, index) => {
    if (prevIndex == index) {
      setPrevIndex(null);
      setSelectedTokenId('');
    } else {
      setPrevIndex(index);
      setSelectedTokenId(tokenId);

      getState(tokenId).then(function (state) {
        if (state == 0) {
          setIsNew(true);
          setIsAccepted(false);
        } else if (state == 2) {
          setIsNew(false);
          setIsAccepted(true);
        } else {
          setIsNew(false);
          setIsAccepted(false);
        }
      })
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

    transparency.on(transparency.filters.Transaction(currentAccount, null, [0, 1, 2, 3, 5]), async (_from, _tokenId, _state) => {
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
          <img width={100} height={100} src="./bakerColor.png" alt="baker icon" />
          <h2>Baker User Account</h2>
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
            {
              loading ?
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
                    <td>
                      {
                        item.state == 1 ?
                          <div>
                            <Button
                              className={styles.validateButton}
                              variant="primary"
                              value={item.tokenId}
                              onClick={event => accept(event.target.value)}
                            >Accept
                            </Button>
                            <Button
                              variant="danger"
                              value={item.tokenId}
                              onClick={event => reject(event.target.value)}
                            >Reject
                            </Button>
                          </div>
                          :
                          <p className={styles.p_no_margin}>{translateState(item.state)}</p>
                      }
                    </td>
                  </tr>
                ))
            }

          </tbody>
        </Table>


        <div className={styles.flexContainer}>
          <div className={styles.form}>
            <Form onSubmit={handleMint}>
              <h4>Mint</h4>
              {
                selectedTokenId != '' && isAccepted ?
                  <p>Token selected for minting</p>
                  : <p>Select an ACCEPTED token</p>
              }
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
            <h4>Sell</h4>
            {
              selectedTokenId != '' && isNew ?
                <p>Token selected for sale</p>
                :
                <p>Select an NEW token</p>
            }
            <Form onSubmit={handlePutOnSale}>
              <Form.Group className="mb-3" controlId="productName">
                <Form.Label>Price</Form.Label>
                <Form.Control
                  placeholder="Enter price of product"
                  value={productPrice}
                  onChange={event => setProductPrice(event.target.value)}
                />
              </Form.Group>
              {
                <Button variant="primary" type="submit" disabled={selectedTokenId == '' || productPrice == '' || !isNew}>
                  Put on sale
                </Button>
              }
            </Form>
          </div>
        </div>

      </div>
    </div>
  )
}
