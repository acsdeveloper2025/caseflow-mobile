import React, { createContext, useContext, useEffect, useState } from 'react';
import { View } from 'react-native';
import { StatusBar } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

interface SafeAreaInsets {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

interface SafeAreaContextType {
  insets: SafeAreaInsets;
  isNative: boolean;
  isInitialized: boolean;
}

const SafeAreaContext = createContext<SafeAreaContextType>({
  insets: { top: 0, bottom: 0, left: 0, right: 0 },
  isNative: false,
  isInitialized: false
});

export const useSafeArea = () => useContext(SafeAreaContext);

interface SafeAreaProviderProps {
  children: React.ReactNode;
}

export const SafeAreaProvider: React.FC<SafeAreaProviderProps> = ({ children }) => {
  const [insets, setInsets] = useState<SafeAreaInsets>({ top: 0, bottom: 0, left: 0, right: 0 });
  const [isNative] = useState(Capacitor.isNativePlatform());
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeSafeArea = async () => {
      try {
        if (isNative) {
          try {
            // Configure status bar for native platforms
            await StatusBar.setStyle({ style: 'dark' });
            await StatusBar.setBackgroundColor({ color: '#111827' });
            await StatusBar.setOverlaysWebView({ overlay: false });

            // Get status bar info for Android
            if (Capacitor.getPlatform() === 'android') {
              const info = await StatusBar.getInfo();
              setInsets(prev => ({ ...prev, top: info.height || 0 }));
            }
        } catch (error) {
          console.warn('Failed to configure status bar:', error);
        }
      } else {
        // For web, use CSS environment variables
        const updateInsets = () => {
          const computedStyle = getComputedStyle(document.documentElement);
          const top = parseInt(computedStyle.getPropertyValue('env(safe-area-inset-top)') || '0');
          const bottom = parseInt(computedStyle.getPropertyValue('env(safe-area-inset-bottom)') || '0');
          const left = parseInt(computedStyle.getPropertyValue('env(safe-area-inset-left)') || '0');
          const right = parseInt(computedStyle.getPropertyValue('env(safe-area-inset-right)') || '0');
          
          setInsets({ top, bottom, left, right });
        };

        updateInsets();
        window.addEventListener('resize', updateInsets);
        window.addEventListener('orientationchange', updateInsets);

        return () => {
          window.removeEventListener('resize', updateInsets);
          window.removeEventListener('orientationchange', updateInsets);
        };
      }
      } catch (error) {
        console.error('SafeAreaProvider initialization error:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    // Add timeout to prevent hanging
    const timeoutId = setTimeout(() => {
      console.warn('SafeAreaProvider initialization timeout');
      setIsInitialized(true);
    }, 3000);

    initializeSafeArea().finally(() => {
      clearTimeout(timeoutId);
    });

    return () => clearTimeout(timeoutId);
  }, [isNative]);

  return (
    <SafeAreaContext.Provider value={{ insets, isNative, isInitialized }}>
      {children}
    </SafeAreaContext.Provider>
  );
};

// Safe Area View component
interface SafeAreaViewProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  className?: string;
}

export const SafeAreaView: React.FC<SafeAreaViewProps> = ({ 
  children, 
  style = {}, 
  edges = ['top', 'bottom', 'left', 'right'],
  className = ''
}) => {
  const { insets, isNative } = useSafeArea();

  const safeAreaStyle: React.CSSProperties = {
    ...style,
    ...(edges.includes('top') && { paddingTop: `max(2px, env(safe-area-inset-top))` }),
    ...(edges.includes('bottom') && { paddingBottom: `max(4px, env(safe-area-inset-bottom))` }),
    ...(edges.includes('left') && { paddingLeft: `env(safe-area-inset-left)` }),
    ...(edges.includes('right') && { paddingRight: `env(safe-area-inset-right)` }),
  };

  // For native platforms, use actual inset values
  if (isNative) {
    const nativeStyle: React.CSSProperties = {
      ...style,
      ...(edges.includes('top') && { paddingTop: Math.max(parseInt(String(style.paddingTop)) || 0, insets.top) }),
      ...(edges.includes('bottom') && { paddingBottom: Math.max(parseInt(String(style.paddingBottom)) || 0, insets.bottom) }),
      ...(edges.includes('left') && { paddingLeft: Math.max(parseInt(String(style.paddingLeft)) || 0, insets.left) }),
      ...(edges.includes('right') && { paddingRight: Math.max(parseInt(String(style.paddingRight)) || 0, insets.right) }),
    };

    return (
      <View style={nativeStyle} className={className}>
        {children}
      </View>
    );
  }

  return (
    <View style={safeAreaStyle} className={className}>
      {children}
    </View>
  );
};

// Mobile Container component with proper safe area handling
interface MobileContainerProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const MobileContainer: React.FC<MobileContainerProps> = ({ 
  children, 
  className = '', 
  style = {} 
}) => {
  return (
    <SafeAreaView 
      edges={['top', 'left', 'right']} 
      className={`mobile-container ${className}`}
      style={{
        minHeight: '100vh',
        backgroundColor: '#111827',
        position: 'relative',
        ...style
      }}
    >
      {children}
    </SafeAreaView>
  );
};
