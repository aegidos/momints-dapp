import { useState, useEffect } from 'react';
import { useAccount, useContractWrite, useWaitForTransaction } from 'wagmi';
import MainLayout from '../components/MainLayout';
import { getProofForAddress } from '../utils/proofUtils'; // Import the existing function

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

const MembersOnly = () => {
  const { isConnected, address } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [mintStatus, setMintStatus] = useState('');
  const [merkleProof, setMerkleProof] = useState(null);
  const [isWhitelisted, setIsWhitelisted] = useState(false);
  const [mounted, setMounted] = useState(false); // Add mounted state

  const { data, write } = useContractWrite({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: 'mint',
  });

  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransaction({
      hash: data?.hash,
    });

  // Set mounted to true after component mounts (client-side only)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Check if user is whitelisted and get proof
  useEffect(() => {
    if (address && mounted) {
      getProofForAddress(address).then(proof => {
        if (proof) {
          setIsWhitelisted(true);
          setMerkleProof(proof);
        } else {
          setIsWhitelisted(false);
          setMerkleProof(null);
        }
      });
    }
  }, [address, mounted]);

  // Update status when transaction is confirmed
  useEffect(() => {
    if (isConfirmed && data?.hash) {
      setMintStatus(`✅ NFT minted successfully! TX: ${data.hash}`);
    }
  }, [isConfirmed, data?.hash]);

  // Show loading state during hydration
  if (!mounted) {
    return (
      <MainLayout>
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <h1>Loading...</h1>
          <p>Please wait while we connect to your wallet.</p>
        </div>
      </MainLayout>
    );
  }

  if (!isConnected) {
    return (
      <MainLayout>
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <h1>Access Denied</h1>
          <p>You must be connected to a wallet to view this page.</p>
        </div>
      </MainLayout>
    );
  }

  if (!isWhitelisted) {
    return (
      <MainLayout>
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <h1>Access Denied</h1>
          <p>Your wallet address is not on the whitelist.</p>
          <p style={{ fontSize: '0.9rem', color: '#888', marginTop: '20px' }}>
            Connected wallet: <code style={{ color: '#4a9eff' }}>{address}</code>
          </p>
        </div>
      </MainLayout>
    );
  }

  const handleMint = async () => {
    if (!merkleProof) {
      setMintStatus('❌ No valid proof available');
      return;
    }

    setIsLoading(true);
    setMintStatus('Initiating mint transaction...');

    try {
      write({
        args: [merkleProof],
      });
    } catch (error) {
      console.error('Mint error:', error);
      setMintStatus(`❌ Error: ${error.message}`);
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div style={{ 
        textAlign: 'center', 
        padding: '40px 20px',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        <h1 style={{ marginBottom: '20px' }}>Members Only - Whitelist Verified ✅</h1>
        <p style={{ marginBottom: '40px', fontSize: '1.2rem' }}>
          Welcome to the exclusive members-only content! Your wallet is verified on the whitelist.
        </p>
        
        <div style={{
          background: 'linear-gradient(145deg, #1a1a2e, #16213e)',
          border: '1px solid #4a9eff',
          borderRadius: '12px',
          padding: '40px',
          marginBottom: '30px'
        }}>
          <h2 style={{ marginBottom: '20px', color: '#4a9eff' }}>
            Mint Your Exclusive NFT
          </h2>
          
          <div style={{ marginBottom: '30px' }}>
            <p style={{ marginBottom: '10px', color: '#ccc' }}>
              Connected wallet: <code style={{ color: '#4a9eff' }}>{address}</code>
            </p>
            <p style={{ marginBottom: '10px', color: '#4ade80' }}>
              ✅ Whitelist Status: Verified
            </p>
            <p style={{ fontSize: '0.9rem', color: '#888' }}>
              Merkle proof: {merkleProof ? '✅ Ready' : '❌ Not found'}
            </p>
          </div>
          
          <button
            onClick={handleMint}
            disabled={isLoading || isConfirming || !merkleProof}
            style={{
              background: isLoading || isConfirming || !merkleProof
                ? 'linear-gradient(145deg, #333, #555)' 
                : 'linear-gradient(145deg, #4a9eff, #2a7fff)',
              border: 'none',
              color: '#ffffff',
              padding: '15px 40px',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              borderRadius: '8px',
              cursor: isLoading || isConfirming || !merkleProof ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 15px rgba(74, 158, 255, 0.3)',
              transition: 'all 0.3s ease',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}
          >
            {isLoading || isConfirming ? 'MINTING...' : 'MINT NFT'}
          </button>
        </div>

        {mintStatus && (
          <div style={{
            padding: '20px',
            background: mintStatus.includes('✅') 
              ? 'linear-gradient(145deg, #1a3d1a, #2d5a2d)' 
              : mintStatus.includes('❌')
              ? 'linear-gradient(145deg, #3d1a1a, #5a2d2d)'
              : 'linear-gradient(145deg, #1a1a3d, #2d2d5a)',
            border: `1px solid ${mintStatus.includes('✅') ? '#4ade80' : mintStatus.includes('❌') ? '#ef4444' : '#4a9eff'}`,
            borderRadius: '8px',
            marginTop: '20px'
          }}>
            <p style={{ margin: 0, wordBreak: 'break-all' }}>
              {mintStatus}
            </p>
            {data?.hash && (
              <a 
                href={`https://apechain.calderaexplorer.xyz/tx/${data.hash}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: '#4a9eff',
                  textDecoration: 'underline',
                  fontSize: '0.9rem',
                  display: 'block',
                  marginTop: '10px'
                }}
              >
                View on ApeChain Explorer
              </a>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default MembersOnly;