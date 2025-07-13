import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

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

const CONTRACT_ADDRESS = '0x6b70b49748abe1191107f20a8f176d50f63050c1';
const APECHAIN_RPC = 'https://apechain.calderachain.xyz/http';
const PRIVATE_KEY = process.env.PRIVATE_KEY; // Add this to .env

// Define proper ApeChain configuration
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
      http: [APECHAIN_RPC],
    },
    public: {
      http: [APECHAIN_RPC],
    },
  },
  blockExplorers: {
    default: { name: 'ApeChain Explorer', url: 'https://apechain.calderaexplorer.xyz/' },
  },
  testnet: false
};

const publicClient = createPublicClient({
  transport: http(APECHAIN_RPC),
  chain: apeChain
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { walletAddress, merkleProof } = req.body;

    if (!walletAddress) {
      return res.status(400).json({ error: "Wallet address is required" });
    }

    if (!merkleProof || !Array.isArray(merkleProof)) {
      return res.status(400).json({ error: "Valid merkle proof is required" });
    }
    
    console.log(`Minting NFT to address: ${walletAddress} with proof:`, merkleProof);

    // If we have a private key, perform server-side minting
    if (PRIVATE_KEY) {
      try {
        // Create account from private key
        const account = privateKeyToAccount(`0x${PRIVATE_KEY}`);
        
        // Create wallet client
        const walletClient = createWalletClient({
          account,
          chain: apeChain,
          transport: http(APECHAIN_RPC)
        });

        // Execute the mint transaction
        const txHash = await walletClient.writeContract({
          address: CONTRACT_ADDRESS,
          abi: ABI,
          functionName: 'mint',
          args: [merkleProof],
          gas: BigInt(3000000)  // Increased gas limit as per your example
        });

        console.log(`NFT minted successfully! Transaction hash: ${txHash}`);
        
        // Return success response
        return res.status(200).json({
          success: true,
          message: "NFT minted successfully!",
          txHash: txHash
        });
      } catch (error) {
        console.error("Error during server-side minting:", error);
        return res.status(500).json({ error: "Server-side minting failed: " + error.message });
      }
    }

    // Return contract details for client-side minting
    console.log("Returning contract details for client-side minting");
    return res.status(200).json({
      contractAddress: CONTRACT_ADDRESS,
      abi: ABI,
      chain: apeChain,
      merkleProof: merkleProof,
      transactionParams: {
        gasLimit: 3000000,  // Increased gas limit
        maxFeePerGas: '50000000000',
        maxPriorityFeePerGas: '2000000000'
      }
    });
  } catch (error) {
    console.error("Error in mint API:", error);
    return res.status(500).json({ error: error.message });
  }
}
