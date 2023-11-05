import Head from 'next/head'
import styles from '../styles/Home.module.css'
import { Contract, providers, utils } from 'ethers'
import React, { useEffect, useRef, useState } from 'react'
import Web3Modal from 'web3modal'
import { ABI, NFT_CONTRACT_ADDRESS } from '../constants'
import Owner from './owner'
import Farmer from './farmer'
import Baker from './baker'
import Customer from './customer'

export default function Home() {
  
  const [walletConnected, setWalletConnected] = useState(false);
  const [provider, setProvider] = useState(null);
  const [userLogged, setUserLogged] = useState(null);
  const [showUI, setShowUI] = useState(false);

  const web3ModelRef = useRef();

  const getProviderOrSigner = async (needSigner = false) => {

    const provider = await web3ModelRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    const { chainId } = await web3Provider.getNetwork();
    if (chainId != 5) {
      window.alert("Please switch to the Goerli network!");
      throw new Error("Incorrect network");
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }

    return web3Provider;
  }

  const connectWallet = async () => {
    try {
      const provider = await getProviderOrSigner();
      setProvider(provider);
      setWalletConnected(true);
    } catch (error) {
      console.log(error);
    }
  }

  const readyWallet = async () => {

    await connectWallet();

    window.ethereum.on("accountsChanged", async function (accounts) {
      if (accounts[0]) {
        const currentAccount = utils.getAddress(accounts[0]);
        const role = await getUserRole(currentAccount);
        setUserLogged(role);
      } else {
        setWalletConnected(false);
        setUserLogged(null);
        setShowU(false);
      }
    })
    
  }

  const getUserRole = async (currentAccount) => {
    try {
      const provider = await getProviderOrSigner();
      const transparency = new Contract(NFT_CONTRACT_ADDRESS, ABI, provider);

      if (await transparency.owner() == currentAccount) {
        return 3;
      } else {
        const role = await transparency.getUserRole(currentAccount);
        return role;
      }
    } catch (error) {
      console.log(error);
    }
  }

  const readyAccount = async () => {
    try {
      const accounts = await provider.send("eth_requestAccounts", []);
      const currentAccount = utils.getAddress(accounts[0]);
      const role = await getUserRole(currentAccount);
      setUserLogged(role);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    async function fetchProvider() {
      if (!walletConnected) {
        web3ModelRef.current = new Web3Modal({
          network: "goerli",
          providerOptions: {},
          disableInjectedProvider: false
        });
        await readyWallet();
      }
    }
    fetchProvider();
  }, )

  useEffect(() => {
    if (provider) {
      async function fetchRole() {
        await readyAccount();
      }
      fetchRole();
    }
  }, [provider])
  
  useEffect(() => {
    if (userLogged != null) {
      setShowUI(true);
    }
  }, [userLogged])
  
  const showUserUI = () => {
    switch (userLogged) {
      case 0:
        return (
          <Farmer provider={provider}/>
        );
      case 1:
        return (
          <Baker provider={provider}/>
        );
      case 2:
        return (
          <Customer provider={provider}/>
        );  
      case 3:
        return (
          <Owner provider={provider} />
        );
    }
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Transparency SC</title>
      </Head>      

      <div>
        {
          showUI ?
            showUserUI()
            :
            <h3 className={`${styles.main} ${styles.connect_wallet}`}>Connecting to a wallet...</h3>
        }
      </div>
    </div>
  )
}
