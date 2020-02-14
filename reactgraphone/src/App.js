import React, { useEffect, useReducer } from 'react';
import logo from './logo.svg';
import './App.css';

import Button from '@material-ui/core/button';
import Input from '@material-ui/core/Input'
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import API, { graphqlOperation } from '@aws-amplify/api';
import awsconfig from './aws-exports';
import { listContacts } from './graphql/queries'
import { createContact as CreateContact } from './graphql/mutations'

API.configure(awsconfig)
function getID() {
  return Math.floor(Math.random() * 100000)
}

const Default = {
  contacts: [],
  form: { name: '', phonenumber: '', email: '' }
}

function reducer(state, action) {
  switch (action.type) {
    case 'set_fields':
      return { ...state, form: { ...state.form, [action.name]: action.value } }
    case 'clear_fields':
      return { ...state, form: Default.form }
    case 'add_contact':
      return { ...state, contacts: [...state.contacts, action.contact] }
    case 'set_contacts':
      return { ...state, contacts: action.contacts }
    default:
      return state
  }
}

function App() {
  
  const [state, dispatch] = useReducer(reducer, Default)

  function onChange(item) {
    dispatch({ type: 'set_fields', name: item.target.name, value: item.target.value })
  }

  async function addContact() {
    const { form } = state
    if (!form.name || !form.phonenumber || !form.email) {
      return alert('Please type a name, phonenumber number and email address')
    }
    const contact = { id: getID(), ...form}

    dispatch({ type: 'add_contact', contact })

    dispatch({ type: 'clear_fields' })
    
    try {
      await API.graphql(graphqlOperation(CreateContact, { input: contact }))
    } catch (error) {
      console.error("ERROR: ", error)
    }
  }

  async function getContacts() {
    try {
      let contacts = await API.graphql(graphqlOperation(listContacts))

      dispatch({ type: 'set_contacts', contacts: contacts.data.listContacts.items })

    } catch (error) {
      console.error('ERROR: ', error)
      return alert('ERROR: ', error)
    }
  }

  useEffect(() => {
    getContacts()
  }, [])

  return (
    <div className="App">

      <form>
        <Input placeholder="Name" name="name" value={state.form.name} onChange={onChange} />
        <Input placeholder="Phone Number" name="phonenumber" value={state.form.phonenumber} onChange={onChange}/>
        <Input placeholder="Email Address" name="email" value={state.form.email} onChange={onChange}/>
      </form>
      
      <Button variant="contained" color="primary" onClick={addContact} >
        Add Contact
      </Button>

      <TableContainer component={Paper}>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell align="right">Phone Number</TableCell>
              <TableCell align="right">Email</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {state.contacts.map(item => (
              <TableRow>
                <TableCell component="th" scope="row">{item.name}</TableCell>
                <TableCell align="right">{item.phonenumber}</TableCell>
                <TableCell align="right">{item.email}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}

export default App;
