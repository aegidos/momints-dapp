import "../styles/globals.css";
import "@rainbow-me/rainbowkit/styles.css";

import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { apeChain } from "../utils/chainConfig";
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import WalletWrapper from "../context/WalletContext";

const config = getDefaultConfig({
  appName: "MoMint DApp",
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID,
  chains: [apeChain],
  ssr: true, // If your dApp uses server side rendering (SSR)
});

const queryClient = new QueryClient();

function MyApp({ Component, pageProps }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          modalSize="compact"
          initialChain={apeChain}
        >
          <WalletWrapper>
            <Component {...pageProps} />
          </WalletWrapper>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default MyApp;