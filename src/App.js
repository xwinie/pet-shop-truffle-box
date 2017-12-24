import React, { Component } from 'react'
import _ from 'lodash';
import SimpleStorageContract from '../build/contracts/SimpleStorage.json'
import AdoptionContract from '../build/contracts/Adoption.json'
import { petsArray } from './pets.js';
import getWeb3 from './utils/getWeb3'

import dogImageMap from './dogImageMap';
import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      storageValue: 0,
      web3: null,
      adoptionContract: null,
      pets: [],
      adopters: [],
    }
  }

  componentWillMount() {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.

    getWeb3
    .then(results => {
      this.setState({
        web3: results.web3
      })

      // Fetch pets
      this.fetchPets();
      // Instantiate contract once web3 provided.
      this.instantiateContract()
    })
    .catch(() => {
      console.log('Error finding web3.')
    })
  }

  fetchPets() {
    this.setState({ pets: petsArray });
  }

  adoptPet(item) {
    const { adoptionContract } = this.state;

    this.state.web3.eth.getAccounts((error, accounts) => {
      adoptionContract.deployed().then((instance) => {
        return instance.adopt(item, { from: accounts[0]})
          .then((result) => {
            console.log(result)
            this.setState({ adopted: true });
          })
          .catch((err) => {
            console.log(err.message);
          })
      });
    });
  }

  instantiateContract() {
    const contract = require('truffle-contract')
    const adoption = contract(AdoptionContract);
    adoption.setProvider(this.state.web3.currentProvider)

    adoption.deployed().then((instance) => {
      return instance.getAdopters.call().then((result) => {
        this.setState({ adopters: result, adoptionContract: adoption });
      });
    });
  }

  instantiateContract2() {
    const contract = require('truffle-contract')
    const simpleStorage = contract(SimpleStorageContract)
    simpleStorage.setProvider(this.state.web3.currentProvider)

    // Declaring this for later so we can chain functions on SimpleStorage.
    var simpleStorageInstance

    // Get accounts.
    this.state.web3.eth.getAccounts((error, accounts) => {
      simpleStorage.deployed().then((instance) => {
        simpleStorageInstance = instance

        // Stores a given value, 5 by default.
        return simpleStorageInstance.set(5, {from: accounts[0]})
      }).then((result) => {
        // Get the value from the contract to prove it worked.
        return simpleStorageInstance.get.call(accounts[0])
      }).then((result) => {
        // Update state with the result.
        return this.setState({ storageValue: result.c[0] })
      })
    })
  }

  render() {
    const {
      pets,
      adopters
    } = this.state

    return (
      <div className="App">
        <div className="container">
          <div className="row">
            <div className="col-xs-12 col-sm-8 col-sm-push-2">
              <h1 className="text-center">Pete's Pet Shop</h1>
              <hr/>
              <br/>
            </div>
          </div>

          <div id="petsRow" className="row">
            {
              _.map(pets, (pet, index) => {
                return (
                  <div className="col-sm-4" key={index}>
                    <div className="panel panel-default panel-pet">
                      <div className="panel-heading">
                        <h3 className="panel-title">{pet.name}</h3>
                      </div>
                    </div>
                    <div className="panel-body">
                      <img alt="140x140" data-src="holder.js/140x140" className="img-rounded img-center" style={{ width: '100%' }} src={dogImageMap(pet.picture)} data-holder-rendered="true" />
                      <strong>Breed</strong>: <span className="pet-breed">{pet.breed}</span><br/>
                      <strong>Age</strong>: <span className="pet-age">{pet.age}</span><br/>
                      <strong>Location</strong>: <span className="pet-location">{pet.location}</span><br/><br/>
                      <button
                        className="btn btn-default btn-adopt"
                        type="button"
                        disabled={adopters[index] !== '0x0000000000000000000000000000000000000000'}
                        onClick={() => this.adoptPet(index)}
                      >
                        {
                          adopters[index] !== '0x0000000000000000000000000000000000000000' ? 'Success' : 'Adopt'
                        }
                      </button>
                      <br />
                      <strong>Owner: {(adopters[index])}</strong>
                    </div>
                  </div>
                )
              })
            }
          </div>
        </div>
      </div>
    );
  }
}

export default App
