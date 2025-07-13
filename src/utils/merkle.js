import { MerkleTree } from 'merkletreejs';
import { keccak256, encodePacked } from 'viem';
import { merkleData } from '../data/merkleData.js';

// Helper function to hash an address
const hashAddress = (address) => {
  return keccak256(encodePacked(['address'], [address.toLowerCase()]));
};

// Generate merkle tree from the whitelist
export const generateMerkleTree = () => {
  const leaves = merkleData.addresses.map(address => hashAddress(address));
  const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
  return tree;
};

// Generate proof for a specific address
export const generateMerkleProof = (address) => {
  if (!address) return null;
  
  const tree = generateMerkleTree();
  const leaf = hashAddress(address);
  const proof = tree.getHexProof(leaf);
  
  return proof;
};

// Verify if an address is in the whitelist
export const verifyMerkleProof = (address, proof) => {
  if (!address || !proof) return false;
  
  const tree = generateMerkleTree();
  const leaf = hashAddress(address);
  const root = tree.getHexRoot();
  
  return tree.verify(proof, leaf, root);
};

// Check if address is whitelisted
export const isAddressWhitelisted = (address) => {
  if (!address) return false;
  return merkleData.addresses.some(addr => addr.toLowerCase() === address.toLowerCase());
};

export { merkleData };
