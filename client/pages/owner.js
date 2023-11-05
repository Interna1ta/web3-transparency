import styles from '../styles/Home.module.css'
import { Contract } from 'ethers'
import React, { useState } from 'react'
import { ABI, NFT_CONTRACT_ADDRESS } from '../constants'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import '../node_modules/bootstrap/dist/css/bootstrap.min.css'

export default function Owner (props) {

  const [address, setAddress] = useState('');
  const [userName, setUserName] = useState('');
  const [role, setRole] = useState('');
  const [location, setLocation] = useState('');

  const getContract = async (needSigner = false) => {
    if (needSigner) {
      const signer = props.provider.getSigner();
      return new Contract(NFT_CONTRACT_ADDRESS, ABI, signer);
    }
    return new Contract(NFT_CONTRACT_ADDRESS, ABI, props.provider);
  }

  const translateRole = (role) => {
    switch (role) {
      case "Farmer":
        return 0;
      case "Baker":
        return 1;
      case "Customer":
        return 2;
    }
  }

  const registerUser = async () => {
    try {
      const transparency = await getContract(true);

      await transparency.registerUser(
        address,
        userName,
        location,
        Date.now(),
        translateRole(role)
      );
    } catch (error) {
      console.log(error);
      window.alert("There was an error while registering user");
    }
  }

  const handleRegister = event => {

    event.preventDefault();

    registerUser();

    setAddress('');
    setUserName('');
    setRole('');
    setLocation('');
  }

  return (
    <div>
      <div className={styles.main}>
        <h2>Admin User Account</h2>
        <div className={styles.form}>
          <Form onSubmit={handleRegister}>
            <h4>Sign User</h4>
            <Form.Group className="mb-3" controlId="adress">
              <Form.Label>Account address</Form.Label>
              <Form.Control
                placeholder="Enter account address"
                value={address}
                onChange={event => setAddress(event.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="userName">
              <Form.Label>Name</Form.Label>
              <Form.Control
                placeholder="Enter user name"
                value={userName}
                onChange={event => setUserName(event.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="role">
              <Form.Label>Role</Form.Label>
              <Form.Control
                placeholder="Enter role"
                value={role}
                onChange={event => setRole(event.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Location</Form.Label>
              <Form.Control
                placeholder="Enter location"
                value={location}
                onChange={event => setLocation(event.target.value)}
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              Register User
            </Button>
          </Form>
        </div>
      </div>
    </div>
  )
}
