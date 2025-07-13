export async function getProofForAddress(address) {
  try {
    const response = await fetch('/proofs.json');
    const data = await response.json();
    
    // Check for proofs object in the JSON structure
    const proofs = data.proofs || data;
    
    // Try different address formats (original, lowercase, checksummed)
    const addressKey = Object.keys(proofs).find(key => 
      key.toLowerCase() === address.toLowerCase()
    );
    
    return addressKey ? proofs[addressKey] : null;
  } catch (error) {
    console.error('Error fetching proof for address:', address, error);
    return null;
  }
}

export function validateProof(proof) {
  if (!Array.isArray(proof)) {
    return false;
  }
  
  if (proof.length === 0) {
    return false;
  }
  
  // Check that all proof elements are valid hex strings
  return proof.every(p => {
    if (typeof p !== 'string') return false;
    
    // Remove 0x prefix if present
    const hex = p.startsWith('0x') ? p.slice(2) : p;
    
    // Should be 64 characters (32 bytes in hex)
    return hex.length === 64 && /^[0-9a-fA-F]+$/.test(hex);
  });
}

export function formatProof(proof) {
  if (!Array.isArray(proof)) {
    return [];
  }
  
  return proof.map(p => {
    if (typeof p !== 'string') return p;
    return p.startsWith('0x') ? p : `0x${p}`;
  });
}