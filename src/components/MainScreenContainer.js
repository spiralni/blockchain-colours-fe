import Web3 from 'web3'
import Colour from '../abis/Colour.json'
import { useState, useEffect } from 'react'
import MainScreen from './MainScreen'

const MainScreenContainer = () => {
    const [account, setAccount] = useState('')
    const [contract, setContract] = useState()
    const [supply, setSupply] = useState(0)
    const [colours, setColours] = useState([])

    const loadWeb3 = async () => {
        if (window.ethereum) {
            window.web3 = new Web3(window.ethereum)
            await window.ethereum.enable()
        } else if (window.web3) {
            window.web3 = new Web3(window.web3.currentProvider)
        } else {
            window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
        }
    }

    const loadBlockchainData = async () => {
        const web3 = window.web3
        const acc = await web3.eth.getAccounts()

        setAccount(acc[0])

        const networkId = await web3.eth.net.getId()
        const networkData = Colour.networks[networkId]

        if (networkData) {
            const abi = Colour.abi
            const address = networkData.address
            const cont = new web3.eth.Contract(abi, address)
            setContract(cont)
            const totalSupply = await cont.methods.totalSupply().call()
            setSupply(totalSupply)
            // Load Colors
            const colors = []
            for (var i = 1; i <= totalSupply; i++) {
              const color = await cont.methods.colors(i - 1).call()
              colors.push(color)
            }

            setColours(colors)
          } else {
            window.alert('Smart contract not deployed to detected network.')
          }
    }

    const mint = (color) => {
        contract.methods.mint(color).send({
            from: account
        })
        .once('receipt', (receipt) => {
            setColours([...colours, color])
        })
    }
    
    useEffect(async () => {
        await loadWeb3()
        await loadBlockchainData()
    }, [])

    return <div>
        <MainScreen colours={colours} account={account} onMint={mint} />
    </div>
}

export default MainScreenContainer