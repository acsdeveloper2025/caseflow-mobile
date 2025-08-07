import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import AsyncStorage from '../polyfills/AsyncStorage';
import { Clipboard } from '../polyfills/Clipboard';

const LoginScreenWeb: React.FC = () => {
  const [username, setUsername] = useState('agent007');
  const [password, setPassword] = useState('password');
  const { login, isLoading } = useAuth();
  const [isIdModalOpen, setIsIdModalOpen] = useState(false);
  const [deviceId, setDeviceId] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  const handleLogin = () => {
    login(username);
  };

  const handleShowDeviceId = async () => {
    let uniqueId = await AsyncStorage.getItem('caseflow_device_id');
    if (!uniqueId) {
      // A simple UUID generator for demo purposes
      uniqueId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
      await AsyncStorage.setItem('caseflow_device_id', uniqueId);
    }
    setDeviceId(uniqueId);
    setCopySuccess(false);
    setIsIdModalOpen(true);
  };

  const handleCopyId = async () => {
    await Clipboard.setStringAsync(deviceId);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <>
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#111827', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '16px'
      }}>
        <div style={{ 
          width: '100%', 
          maxWidth: '400px'
        }}>
          {/* Company Logo Header */}
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '20px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              display: 'inline-block'
            }}>
              <img
                src="/assets/company-logo-header.png"
                alt="Company Logo"
                style={{
                  width: '240px',
                  height: '120px',
                  maxWidth: '100%',
                  objectFit: 'contain'
                }}
              />
            </div>
            <h1 style={{
              color: '#E5E7EB',
              fontSize: '18px',
              fontWeight: '600',
              textAlign: 'center',
              marginBottom: '8px',
              margin: '0 0 8px 0'
            }}>
              CaseFlow Mobile
            </h1>
            <p style={{
              color: '#9CA3AF',
              fontSize: '14px',
              textAlign: 'center',
              margin: '0'
            }}>
              Professional Verification Platform
            </p>
          </div>
          
          <div style={{
            backgroundColor: '#1F2937',
            borderRadius: '8px',
            padding: '32px 32px 32px 32px',
            marginBottom: '16px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
          }}>
            <h2 style={{
              color: '#E5E7EB',
              fontSize: '24px',
              fontWeight: '700',
              textAlign: 'center',
              marginBottom: '24px',
              margin: '0 0 24px 0'
            }}>
              Welcome Back
            </h2>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                color: '#E5E7EB',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '8px'
              }}>
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '6px',
                  border: '1px solid #374151',
                  backgroundColor: '#111827',
                  color: '#E5E7EB',
                  fontSize: '16px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3B82F6'}
                onBlur={(e) => e.target.style.borderColor = '#374151'}
              />
            </div>
            
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                color: '#E5E7EB',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '8px'
              }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '6px',
                  border: '1px solid #374151',
                  backgroundColor: '#111827',
                  color: '#E5E7EB',
                  fontSize: '16px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3B82F6'}
                onBlur={(e) => e.target.style.borderColor = '#374151'}
              />
            </div>
            
            <button
              onClick={handleLogin}
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '12px 24px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: isLoading ? '#6B7280' : '#3B82F6',
                color: 'white',
                fontSize: '16px',
                fontWeight: '600',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s',
                outline: 'none'
              }}
              onMouseOver={(e) => {
                if (!isLoading) (e.target as HTMLElement).style.backgroundColor = '#2563EB';
              }}
              onMouseOut={(e) => {
                if (!isLoading) (e.target as HTMLElement).style.backgroundColor = '#3B82F6';
              }}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </div>
          
          {/* Device ID Section */}
          <div style={{
            backgroundColor: '#1F2937',
            borderRadius: '8px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <button
              onClick={handleShowDeviceId}
              style={{
                backgroundColor: 'transparent',
                border: '1px solid #374151',
                borderRadius: '6px',
                padding: '8px 16px',
                color: '#9CA3AF',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                outline: 'none'
              }}
              onMouseOver={(e) => {
                (e.target as HTMLElement).style.borderColor = '#3B82F6';
                (e.target as HTMLElement).style.color = '#E5E7EB';
              }}
              onMouseOut={(e) => {
                (e.target as HTMLElement).style.borderColor = '#374151';
                (e.target as HTMLElement).style.color = '#9CA3AF';
              }}
            >
              <span>📱</span>
              Show Device ID
            </button>
          </div>
        </div>
      </div>

      {/* Device ID Modal */}
      {isIdModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#1F2937',
            borderRadius: '8px',
            padding: '24px',
            maxWidth: '400px',
            width: '100%'
          }}>
            <h3 style={{
              color: '#E5E7EB',
              fontSize: '18px',
              fontWeight: '600',
              marginBottom: '16px',
              margin: '0 0 16px 0'
            }}>
              Device ID
            </h3>
            <div style={{
              backgroundColor: '#111827',
              borderRadius: '6px',
              padding: '12px',
              marginBottom: '16px',
              border: '1px solid #374151'
            }}>
              <p style={{
                color: '#E5E7EB',
                fontSize: '14px',
                fontFamily: 'monospace',
                wordBreak: 'break-all',
                margin: '0'
              }}>
                {deviceId}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleCopyId}
                style={{
                  flex: 1,
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: copySuccess ? '#10B981' : '#3B82F6',
                  color: 'white',
                  fontSize: '14px',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                {copySuccess ? '✓ Copied!' : '📋 Copy'}
              </button>
              <button
                onClick={() => setIsIdModalOpen(false)}
                style={{
                  flex: 1,
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: '1px solid #374151',
                  backgroundColor: 'transparent',
                  color: '#9CA3AF',
                  fontSize: '14px',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LoginScreenWeb;
