import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      plugins: [
        react({
          jsxRuntime: 'automatic'
        })
      ],
      define: {
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        global: 'globalThis',
        __DEV__: JSON.stringify(mode === 'development'),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
          'react-native': 'react-native-web',
          'react-native-svg': 'react-native-svg-web',
          '@react-native-async-storage/async-storage': path.resolve(__dirname, 'polyfills/AsyncStorage.ts'),
          'expo-clipboard': path.resolve(__dirname, 'polyfills/Clipboard.ts'),
        },
        extensions: ['.web.js', '.web.ts', '.web.tsx', '.js', '.ts', '.tsx', '.json']
      },
      optimizeDeps: {
        include: [
          'react',
          'react-dom',
          'react-native-web',
        ],
        exclude: []
      }
    };
});
