import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';

const MainLayout = ({ children }) => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{
        background: 'linear-gradient(145deg, #0a0a0a, #1a1a2e)',
        padding: '20px',
        borderBottom: '2px solid #4a9eff',
        boxShadow: '0 2px 20px rgba(74, 158, 255, 0.2)'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <h1 style={{ 
            color: '#4a9eff',
            fontSize: '2rem',
            textShadow: '0 0 15px rgba(74, 158, 255, 0.5)'
          }}>
            MoMint DApp
          </h1>
          <nav>
            <ul style={{ 
              display: 'flex', 
              gap: '2rem', 
              margin: 0,
              alignItems: 'center'
            }}>
              <li>
                <a href="/" style={{
                  color: '#e0e0e0',
                  fontSize: '1.1rem',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  transition: 'all 0.3s ease'
                }}>
                  Home
                </a>
              </li>
              <li>
                <a href="/members-only" style={{
                  color: '#e0e0e0',
                  fontSize: '1.1rem',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  transition: 'all 0.3s ease'
                }}>
                  Members Only
                </a>
              </li>
              <li>
                <ConnectButton />
              </li>
            </ul>
          </nav>
        </div>
      </header>
      <main style={{ 
        flex: 1, 
        padding: '40px 20px',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%'
      }}>
        {children}
      </main>
      <footer style={{
        background: 'linear-gradient(145deg, #0a0a0a, #1a1a2e)',
        padding: '20px',
        borderTop: '1px solid #333',
        textAlign: 'center'
      }}>
        <p style={{ margin: 0, color: '#888' }}>
          &copy; {new Date().getFullYear()} MoMint DApp. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default MainLayout;