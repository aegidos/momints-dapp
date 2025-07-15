import { useState, useEffect } from 'react';
import { useAccount, useContractWrite, useWaitForTransaction, usePrepareContractWrite } from 'wagmi';
import MainLayout from '../components/MainLayout';
import { getProofForAddress } from '../utils/proofUtils';

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

// Keep ApeChain config for reference

const MembersOnly = () => {
  const { isConnected, address } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [mintStatus, setMintStatus] = useState('');
  const [merkleProof, setMerkleProof] = useState(null);
  const [isWhitelisted, setIsWhitelisted] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [txHash, setTxHash] = useState(null);

  // Set mounted to true after component mounts
  useEffect(() => {
    setMounted(true);
  }, []);

  // Check if user is whitelisted
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

  // Prepare the contract write operation
  const { config } = usePrepareContractWrite({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: 'mint',
    args: merkleProof ? [merkleProof] : undefined,
    enabled: !!merkleProof,
  });

  // Initialize the contract write hook
  const { write, data, isLoading: isWriteLoading, isSuccess, error } = useContractWrite(config);

  // Wait for transaction
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransaction({
    hash: data?.hash,
  });

  // Update UI based on transaction status
  useEffect(() => {
    if (isWriteLoading || isConfirming) {
      setIsMinting(true);
      setMintStatus(isWriteLoading ? 'Please confirm in your wallet...' : 'Transaction submitted, waiting for confirmation...');
    } else if (isConfirmed) {
      setIsMinting(false);
      setMintStatus('Success! Your NFT has been minted.');
      setTxHash(data?.hash);
    } else if (error) {
      setIsMinting(false);
      setMintStatus(`Error: ${error.message || 'Failed to mint'}`);
    }
  }, [isWriteLoading, isConfirming, isConfirmed, error, data?.hash]);

  const mintNFT = () => {
    if (!merkleProof || !write) return;
    
    try {
      setMintStatus('Preparing transaction...');
      write();
    } catch (err) {
      console.error('Error initiating mint:', err);
      setMintStatus(`Error: ${err.message}`);
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
                  <button
                    onClick={mintNFT}
                    disabled={isMinting || !write}
                    className={`px-4 py-2 rounded font-semibold ${
                      isMinting || !write
                        ? 'bg-gray-300 cursor-not-allowed' 
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                  >
                    {isMinting ? 'Minting...' : 'Mint NFT'}
                  </button>
                )}
                
                {txHash && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600">Transaction Hash:</p>
                    <a 
                      href={`https://apechain.calderaexplorer.xyz/tx/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline break-all"
                    >
                      {txHash}
                    </a>
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