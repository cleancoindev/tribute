import React, { useState, useEffect, useContext } from 'react';
import { EthersContext } from './EthersContext.js';
import { ethers } from 'ethers';
import TributeTotals from './TributeTotals';
import rDAIContract from './contracts/rDAI.abi.json'

function View() {
  const [ethersContext, setEthersContext] = useContext(EthersContext);
  const [selectedAddress, setSelectedAddress] = useState();
  const [unallocated, setUnallocated] = useState();
  const [balance, setBalance] = useState();
  const rDAIAddress = "0xeA718E4602125407fAfcb721b7D760aD9652dfe7";

  // Detect when account changes
  window.ethereum.on('accountsChanged', function (accounts) {
    if (selectedAddress !== undefined) {
      setSelectedAddress(accounts[0])
    }
  })

  // Similar to componentDidMount and componentDidUpdate
  useEffect(() => {
    if (typeof window.ethereum !== 'undefined'
      || (typeof window.web3 !== 'undefined')) {
      console.log(window.web3.version);
      // Web3 browser user detected. You can now use the provider.
      let provider = window['ethereum'] || window.web3.currentProvider
      //NOTE: must wrap window.etherm to get provider, not window.web3
      provider = new ethers.providers.Web3Provider(window.ethereum);
      let contract = new ethers.Contract(rDAIAddress, rDAIContract, provider);
      if (ethersContext.contract === undefined) {
        setEthersContext(state => ({ ...ethersContext, contract }));
      }
    }
  }, [ethersContext]);

  useEffect(() => {
    getAccount();
    getUnallocatedTribute();
    getBalanceOf();
  }, [])

  async function getAccount() {
    try {
      if (selectedAddress === undefined) {
        console.log("No selected address, requesting log in")
        let account = await window.ethereum.enable();
        console.log("Selected Address is: " + account[0])
        setSelectedAddress(account[0]);
      } else {
        console.log("Selected Address is: " + selectedAddress);
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function getHatByAddress(address) {
    if (ethersContext.contract !== undefined) {
      let hat = await ethersContext.contract.getHatByAddress(address);
      return hat
    }
  }

  async function getUnallocatedTribute() {
    if (ethersContext.contract === undefined) {
      setUnallocated(0)
    }

    let hat = await getHatByAddress(selectedAddress);
    //console.log(hat)
    if (hat.recipients[0].toUpperCase() === selectedAddress.toUpperCase()) {
      setUnallocated(hat.proportions[0])
    }
    setUnallocated(0)
  }

  async function getBalanceOf() {
    if (ethersContext.contract !== undefined) {
      let principal = await ethersContext.contract.balanceOf(selectedAddress);
      setBalance(principal)
    }
  }

  return (
    <div>
      <TributeTotals 
        principal = { balance }
        unallocated = { unallocated }
      />
      <div>
        hat data
      </div>
      <div>
        Inactive Tributes
      </div>
      <div>
        Dapp Admin Tools
      </div>
      <div>
        github
        twitter
      </div>
    </div>
  );
}

export default View;