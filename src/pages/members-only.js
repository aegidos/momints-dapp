import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import MainLayout from '../components/MainLayout';
import { getProofForAddress, validateProof } from '../utils/proofUtils';

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
  const [txHash, setTxHash] = useState('');
  const [merkleProof, setMerkleProof] = useState(null);
  const [isWhitelisted, setIsWhitelisted] = useState(false);

  const { writeContract } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({
      hash: txHash,
    });

  // Check if user is whitelisted and generate merkle proof
  useEffect(() => {
    const fetchProof = async () => {
      if (address) {
        const proof = await getProofForAddress(address);
        setMerkleProof(proof);
        setIsWhitelisted(!!proof && validateProof(proof));
      }
    };

    fetchProof();
  }, [address]);

  // Update status when transaction is confirmed - FIXED
  useEffect(() => {
    if (isConfirmed && txHash && mintStatus && typeof mintStatus === 'string' && !mintStatus.includes('✅')) {
      setMintStatus(`✅ NFT minted successfully! TX: ${txHash}`);
    }
  }, [isConfirmed, txHash, mintStatus]);

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
    if (!isConnected || !address) {
      alert('Please connect your wallet');
      return;
    }

    setIsLoading(true);

    try {
      // Get proof for the connected address
      const userProof = await getProofForAddress(address);
      
      if (!userProof || !validateProof(userProof)) {
        alert('Your address is not eligible for minting or proof is invalid');
        return;
      }

      // Ensure proof is in correct format
      const formattedProof = userProof.map(proof => 
        proof.startsWith('0x') ? proof : `0x${proof}`
      );

      await writeContract({
        address: CONTRACT_ADDRESS,
        abi: ABI,
        functionName: 'mint',
        args: [formattedProof],
        gas: BigInt(3000000),
        maxFeePerGas: BigInt(50000000000),
        maxPriorityFeePerGas: BigInt(2000000000)
      });
    } catch (error) {
      console.error('Minting failed:', error);
      alert(`Minting failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
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
              Merkle proof generated: {merkleProof ? '✅' : '❌'}
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
            {txHash && (
              <a 
                href={`https://apechain.calderaexplorer.xyz/tx/${txHash}`}
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

        {/* Merkle Proof Debug Info */}
        {merkleProof && (
          <div style={{
            marginTop: '40px',
            padding: '20px',
            background: 'linear-gradient(145deg, #2a2a2a, #1a1a1a)',
            border: '1px solid #333',
            borderRadius: '8px',
            textAlign: 'left'
          }}>
            <h3 style={{ marginBottom: '15px', color: '#4a9eff' }}>Debug Info:</h3>
            <p style={{ fontSize: '0.8rem', color: '#ccc', marginBottom: '10px' }}>
              <strong>Merkle Proof:</strong>
            </p>
            <pre style={{ 
              fontSize: '0.7rem', 
              color: '#888', 
              overflowX: 'auto',
              padding: '10px',
              background: '#0a0a0a',
              borderRadius: '4px'
            }}>
              {JSON.stringify(merkleProof, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default MembersOnly;