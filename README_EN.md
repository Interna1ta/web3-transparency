# Development of a real use case supply chain

## Introduction

In this course we are going to develop a decentralized application to emulate the operation of a real use case of a supply chain. This could be a real case in its earliest stage of development, within a consortium of companies and where one of them adopts a "leader" position, which we will call "owner or administrator".

This application has two objectives: to be transparent with the consumer and to be fair with the farmers. On the one hand, the consumer will be provided with an exact and reliable trace of what has happened to their product. And on the other hand, the consumer will be able to observe that a percentage of the price of their product has gone directly to the farmer, thus avoiding cases that can currently be observed in which consumers pay a price per kilo of product and finally to the farmer practically no income arrives to cover costs. It can be intuited that we will obtain this functionality described by defining three different roles in the application: farmer, baker and consumer, each one with its own user interface and its respective functionalities.

For development we will rely on the available OpenZeppelin ERC-721 library to mine NFTs or, as we will call throughout the course, products, since we will create with this library what is known as "digital twins". This is nothing more than the digital representation of a physical object. This virtual twin will be the one that will be modified at the same time that the physical object would hypothetically do so.

As for technologies, we are going to use Solidity, more exactly the aforementioned library in addition to the Ownable library, React 18.2.0 for the user interface, and Hardhat to help us develop the contract, test it and deploy it on the Goerli testnet. . In addition, we are going to use Metamask as a wallet to store our different accounts and we will use Fleek to host our application on a website, also using IPFS.

## Course in spanish

https://www.udemy.com/course/blockchain-supplychain-dapp/