import { useState, useEffect } from 'react';
import { useAccount, useContractWrite, useWaitForTransaction } from 'wagmi';
import MainLayout from '../components/MainLayout';
import { getProofForAddress } from '../utils/proofUtils';
import { createWalletClient, custom } from 'viem';

const CONTRACT_ADDRESS = '0x6b70b49748abe1191107f20a8f176d50f63050c1';
const ABI = [
  {
    "inputs": [
      { "internalType": "bytes32[]", "name": "merkleProof", "type": "bytes32[]" }
    ],
    "name": "mint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// Define ApeChain configuration
const apeChain = {
  id: 33139,
  name: 'ApeChain',
  network: 'apechain',
  nativeCurrency: {
    name: 'APE',
    symbol: 'APE',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://apechain.calderachain.xyz/http'],
    },
    public: {
      http: ['https://apechain.calderachain.xyz/http'],
    },
  },
  blockExplorers: {
    default: { name: 'ApeChain Explorer', url: 'https://apechain.calderaexplorer.xyz/' },
  },
  testnet: false
};

const MembersOnly = () => {
  const { isConnected, address } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [mintStatus, setMintStatus] = useState('');
  const [merkleProof, setMerkleProof] = useState(null);
  const [isWhitelisted, setIsWhitelisted] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [txHash, setTxHash] = useState(null);

  // Set mounted to true after component mounts (client-side only)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Check if user is whitelisted and get proof
  useEffect(() => {
    if (address && mounted) {
      setIsLoading(true);
      setMintStatus('Checking whitelist status...');
      
      getProofForAddress(address).then(proof => {
        console.log('Proof result for address:', address, proof);
        if (proof) {
          setIsWhitelisted(true);
          setMerkleProof(proof);
          setMintStatus('You are whitelisted! You can mint your NFT.');
        } else {
          setIsWhitelisted(false);
          setMerkleProof(null);
          setMintStatus('You are not on the whitelist.');
        }
        setIsLoading(false);
      }).catch(error => {
        console.error('Error fetching proof:', error);
        setMintStatus('Error checking whitelist status.');
        setIsLoading(false);
      });
    }
  }, [address, mounted]);

  const mintNFT = async () => {
    if (!address || !merkleProof) return;

    try {
      setIsMinting(true);
      setMintStatus('Initiating minting process...');

      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      // Create wallet client with connected account
      const walletClient = createWalletClient({
        account: address,
        chain: apeChain,
        transport: custom(window.ethereum)
      });

      setMintStatus('Sending transaction...');
      
      // Execute the mint transaction
      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS,
        abi: ABI,
        functionName: 'mint',
        args: [merkleProof],
        gas: BigInt(3000000)
      });

      setTxHash(hash);
      setMintStatus(`Transaction sent! Hash: ${hash}`);
      
      // You could add a function to check transaction status or fetch NFTs
      // setTimeout(() => { fetchNFTs(); }, 2000);
    } catch (error) {
      console.error('Error minting NFT:', error);
      setMintStatus(`Error: ${error.message}`);
    } finally {
      setIsMinting(false);
    }
  };

  // Only render when mounted to avoid hydration issues
  if (!mounted) return null;

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Members Only Area</h1>
        
        {!isConnected ? (
          <div className="bg-yellow-100 p-4 rounded-lg mb-4">
            <p className="text-yellow-800">
              Please connect your wallet to check if you're on the whitelist.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {isLoading ? (
              <p className="text-gray-600">Loading your status...</p>
            ) : (
              <>
                <div className={`p-4 rounded-lg ${isWhitelisted ? 'bg-green-100' : 'bg-red-100'}`}>
                  <p className={isWhitelisted ? 'text-green-800' : 'text-red-800'}>
                    {mintStatus}
                  </p>
                </div>
                
                {isWhitelisted && (
                  <div className="bg-white shadow-md rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">Mint Your Exclusive NFT</h2>
                    
                    <div className="mb-4">
                      <p className="text-gray-700">
                        Connected wallet: <span className="font-medium">{address}</span>
                      </p>
                      <p className="text-gray-700">
                        Merkle proof: <span className="font-medium">{merkleProof.join(', ')}</span>
                      </p>
                    </div>
                    
                    <button
                      onClick={mintNFT}
                      disabled={isMinting}
                      className={`w-full py-3 rounded-lg font-bold transition-all flex items-center justify-center ${
                        isMinting 
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      {isMinting ? 'Minting...' : 'Mint NFT'}
                    </button>
                    
                    {txHash && (
                      <div className="mt-4 text-center">
                        <a 
                          href={`https://apechain.calderaexplorer.xyz/tx/${txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 underline"
                        >
                          View Transaction on Explorer
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default MembersOnly;