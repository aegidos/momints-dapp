import { useEffect } from 'react';
import { useAccount } from 'wagmi';
import MainLayout from '../components/MainLayout';

const HomePage = () => {
  const { isConnected } = useAccount();

  useEffect(() => {
    if (isConnected) {
      console.log('User is connected to the wallet');
    } else {
      console.log('User is not connected to the wallet');
    }
  }, [isConnected]);

  return (
    <MainLayout>
      <h1>Welcome to MoMint dApp</h1>
      <p>This is the main landing page of the application.</p>
    </MainLayout>
  );
};

export default HomePage;