import { Contract, utils } from "ethers";
import React, { useEffect, useState } from "react";
import { NFT_CONTRACT_ADDRESS, ABI } from "../constants";
// styles and html components
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import styles from "../styles/Home.module.css";
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import Card from './card';

export default function Farmer(props) {

  // variables related to tables
  const [loadingAvailable, setLoadingAvailable] = useState(false);
  const [loadingBought, setLoadingBought] = useState(false);
  const [tokensAvailable, setTokensIdsAvailable] = useState([]);
  const [tokensBought, setTokensIdsBought] = useState([]);
  const [prevIndex, setPrevIndex] = useState(null);
  const [selectedTokenId, setSelectedTokenId] = useState('');
  // variables related to history
  const [boxCards, setBoxCards] = useState(null);
  const [cards, setCards] = useState([]);
  const [uniqueTokenIds, setUniqueTokenIds] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  var visitedMint = false;


  const getContract = async (needSigner = false) => {
    if (needSigner) {
      const signer = props.provider.getSigner();
      return new Contract(NFT_CONTRACT_ADDRESS, ABI, signer);
    }
    return new Contract(NFT_CONTRACT_ADDRESS, ABI, props.provider);
  }

  const getTokens = async (alsoBought = false) => {
    const transparency = await getContract();
    const tokens = await transparency.connect(NFT_CONTRACT_ADDRESS).getTokenIds();
    const tokensAvailable = await getAttrs([], transparency, tokens, false);
    setTokensIdsAvailable(tokensAvailable);
    setLoadingAvailable(false);

    if (alsoBought) {
      const transparency = await getContract(true);
      const tokens = await transparency.getTokenIds();
      const tokensBought = await getAttrs([], transparency, tokens, alsoBought);
      setTokensIdsBought(tokensBought);
      setLoadingBought(false);
    }
  }

  const getAttrs = async (aux, transparency, tokens, bought) => {
    for (var i = 0; i < tokens.length; i++) {
      var id = tokens[i].toNumber();
      if (id != 0) {
        const attrs = await transparency.getTokenAttrs(tokens[i]);
        if (bought) {
          aux.push({ tokenId: id, product: attrs[3], quantity: attrs[2], unit: attrs[4], state: attrs[5] });
        } else {
          const price = utils.formatEther(Number(await getPrice(id)));
          aux.push({ tokenId: id, product: attrs[3], quantity: attrs[2], unit: attrs[4], state: attrs[5], price: price });
        }
      }
    }
    return aux;
  }

  const getPrice = async (tokenId) => {
    try {
      const transparency = await getContract();
      return await transparency.getPrice(tokenId);
    } catch (error) {
      console.log(error);
      window.alert("There was an error getting the price of the token");
    }
  }

  const buy = async (tokenId) => {
    try {
      const transparency = await getContract(true);
      const price = await transparency.getPrice(tokenId);
      const tx = await transparency.buy(tokenId, { value: price });

      setLoadingAvailable(true);
      setLoadingBought(true);
      await tx.wait();

    } catch (error) {
      console.log(error);
      window.alert("There was an error when buying a token");
    }
  }

  const getHistory = async (arrayCards, events, pos, order) => {

    try {

      const transparency = await getContract();
      const event = events[pos];
      console.log(event);
      const user = await transparency.getUserData(event.args._from);

      const completeData = {
        operation: event.args._state,
        tokenId: event.args._tokenId,
        blockTimestamp: (await event.getBlock(event.blockNumber)).timestamp * 1000,
        blockNumber: event.blockNumber,
        txHash: event.transactionHash
      }

      if (event.args._state == 0) {

        const attrs = await transparency.getTokenAttrs(Number(event.args._tokenId));

        if (attrs[1] != 0) {
          const filter = transparency.filters.Transaction(null, Number(attrs[1]), null);
          const events = await transparency.queryFilter(filter, 0, 'latest');
          await getHistory(arrayCards, events, 0, order + events.length);
          if (selectedTokenId == event.args._tokenId) {
            visitedMint = true;
          }
        }

        completeData.attrs = { origin: attrs[1], quantity: attrs[2], product: attrs[3], unit: attrs[4], currentState: attrs[5] };
        completeData.user = { name: user[0], location: user[1], registeredDate: user[2], role: user[3] };
      } else {
        completeData.user = { name: user[0], location: user[1], registeredDate: user[2], role: user[3] };
      }

      if (pos == events.length - 1) {
        uniqueTokenIds.push(Number(event.args._tokenId));
        arrayCards.push(<Card key={order} group={event.args._tokenId} data={completeData} />);

        if (visitedMint) {
          setCards(arrayCards);
        }
        return arrayCards;
      }

      arrayCards.push(<Card key={order} group={event.args._tokenId} data={completeData} />);
      await getHistory(arrayCards, events, pos + 1, order + 1);

    } catch (error) {
      console.log(error);
      window.alert("There was an error getting the history");
    }
  }

  const showCards = () => {
    const tokenIds = uniqueTokenIds.reverse();
    var htmlElement = [];

    for (var i = 0; i < tokenIds.length; i++) {
      htmlElement.push(
        <Box key={i} className={styles.boxCustomer}>
          <h4 style={{ 'textAlign': 'center' }}>Token {tokenIds[i]}</h4>
          <hr style={{ 'marginBottom': '5%', 'marginTop': '0%' }}></hr>
          <Grid container direction="column">
            {cards.sort((a, b) => a.key > b.key ? 1 : -1).map((card, index) => (
              card.props.group == tokenIds[i] ?
                <Grid item key={index} width="100%">{card}</Grid>
                : null
            ))
            }
          </Grid>
        </Box>
      )
    }
    setUniqueTokenIds([]);
    return htmlElement;
  }

  const onClickTokenSelect = (tokenId, index) => {
    if (prevIndex == index) {
      setPrevIndex(null);
      setSelectedTokenId('');
      setBoxCards(null);
    } else {
      setPrevIndex(index);
      setSelectedTokenId(tokenId);
    }
  }

  useEffect(() => {

    const transparency = new Contract(NFT_CONTRACT_ADDRESS, ABI, props.provider);

    var currentAccount;
    props.provider.send("eth_requestAccounts", []).then(function (result) {
      currentAccount = utils.getAddress(result[0]);
    });

    async function fetchTokens() {
      setLoadingAvailable(true);
      setLoadingBought(true);
      await getTokens(true);
    }
    fetchTokens();

    transparency.on(transparency.filters.Transaction(null, null, [5]), async (_from, _tokenId, _state) => {
      setLoadingAvailable(true);
      await getTokens();
    });

    transparency.on(transparency.filters.Transaction(currentAccount, null, [6]), async (_from, _tokenId, _state) => {
      setLoadingAvailable(true);
      setLoadingBought(true);
      await getTokens(true);
    });

    return () => {
      props.provider.removeAllListeners();
    }

  }, [props])

  useEffect(() => {

    async function fetchHistory() {
      if (selectedTokenId != '') {
        const transparency = await getContract();
        const filter = transparency.filters.Transaction(null, Number(selectedTokenId), null);
        const events = await transparency.queryFilter(filter, 0, 'latest');
        setCards([]);
        setLoadingHistory(true);
        getHistory([], events, 0, 0);
      }
    }
    fetchHistory();

  }, [selectedTokenId])

  useEffect(() => {
    if (cards.length != 0) {
      const htmlElement = showCards();
      setLoadingHistory(false);
      setBoxCards(htmlElement);
    }
  }, [cards])


  return (
    <div>
      <div className={styles.main}>

        <div className={styles.title}>
          <img width={100} height={100} src="./customerColor.png" alt="customer icon" />
          <h2>Customer User Account</h2>
        </div>

        <h3 className={styles.subtitle}>Products Available</h3>
        <hr className={styles.hrCustomer}></hr>
        <Table striped bordered hover className={styles.table}>
          <thead>
            <tr>
              <th>View History</th>
              <th>Token ID</th>
              <th>Product Name</th>
              <th>Quantity</th>
              <th>Unit</th>
              <th>Price</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {
              loadingAvailable ?
                <tr>
                  <td style={{ '--bs-table-accent-bg': 'white', 'textAlign': 'center' }} colSpan='7'>
                    <img src="./loading.gif" alt="loading.." />
                    <p className={styles.p_no_margin}>Loading, wait some seconds...</p>
                  </td>
                </tr>
                :
                tokensAvailable.map((item, index) => (
                  <tr key={"available_" + index}>
                    <td>
                      {
                        <Form.Check
                          type='radio'
                          id={item.tokenId}
                          value={item.tokenId}
                          name="selectedToken"
                          checked={prevIndex == "available_" + index}
                          readOnly
                          onClick={event => onClickTokenSelect(event.target.value, "available_" + index)}
                        />
                      }
                    </td>
                    <td>{item.tokenId}</td>
                    <td>{item.product}</td>
                    <td>{item.quantity}</td>
                    <td>{item.unit}</td>
                    <td>{item.price}</td>
                    <td>
                      <Button value={item.tokenId} variant="primary" onClick={event => buy(event.target.value)}>
                        Buy
                      </Button>
                    </td>
                  </tr>
                ))}
          </tbody>
        </Table>

        <h3>My Bought Products</h3>
        <hr className={styles.hrCustomer}></hr>
        <Table striped bordered hover className={styles.table}>
          <thead>
            <tr>
              <th>View History</th>
              <th>Token ID</th>
              <th>Product Name</th>
              <th>Quantity</th>
              <th>Unit</th>
            </tr>
          </thead>
          <tbody>
            {
              loadingBought ?
                <tr>
                  <td style={{ '--bs-table-accent-bg': 'white', 'textAlign': 'center' }} colSpan='6'>
                    <img src="./loading.gif" alt="loading..." />
                    <p className={styles.p_no_margin}>Loading, wait some seconds...</p>
                  </td>
                </tr>
                :
                tokensBought.map((item, index) => (
                  <tr key={"bought_" + index}>
                    <td>
                      {
                        <Form.Check
                          type='radio'
                          id={item.tokenId}
                          value={item.tokenId}
                          name="selectedToken"
                          checked={prevIndex == "bought_" + index}
                          readOnly
                          onClick={event => onClickTokenSelect(event.target.value, "bought_" + index)}
                        />
                      }
                    </td>
                    <td>{item.tokenId}</td>
                    <td>{item.product}</td>
                    <td>{item.quantity}</td>
                    <td>{item.unit}</td>
                  </tr>
                ))}
          </tbody>
        </Table>

        <h3 style={{ 'textAlign': 'center', 'paddingTop': '2%' }}>History</h3>
        {
          selectedTokenId != '' ?
            <div className={styles.flexContainerHistory}>
              {loadingHistory ?
                <div style={{ 'textAlign': 'center' }}>
                  <img src="./loading.gif" alt="loading..." />
                  <p className={styles.p_no_margin}>Loading, wait some seconds...</p>
                </div>
                :
                boxCards
              }
            </div>
            :
            <p className={styles.p_no_history}>No product selected</p>
        }

      </div>
    </div>
  )
}
