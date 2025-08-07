import React, { useState, useEffect } from 'react';
import { 
  checkPermissions, 
  requestAllPermissions, 
  requestCameraPermissions,
  requestLocationPermissions,
  requestNotificationPermissions,
  PermissionResult 
} from '../utils/permissions';
import { LocalNotifications } from '@capacitor/local-notifications';

const PermissionTest: React.FC = () => {
  const [permissions, setPermissions] = useState<PermissionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);

  useEffect(() => {
    checkCurrentPermissions();
  }, []);

  const checkCurrentPermissions = async () => {
    try {
      const perms = await checkPermissions();
      setPermissions(perms);
    } catch (error) {
      console.error('Failed to check permissions:', error);
    }
  };

  const requestAllPerms = async () => {
    setIsLoading(true);
    try {
      const perms = await requestAllPermissions();
      setPermissions(perms);
      addTestResult('✅ All permissions requested');
    } catch (error) {
      addTestResult('❌ Failed to request permissions: ' + error);
    } finally {
      setIsLoading(false);
    }
  };

  const testCamera = async () => {
    try {
      const result = await requestCameraPermissions();
      if (result.granted) {
        addTestResult('✅ Camera permission granted');
      } else {
        addTestResult('❌ Camera permission denied');
      }
    } catch (error) {
      addTestResult('❌ Camera test failed: ' + error);
    }
  };

  const testLocation = async () => {
    try {
      const result = await requestLocationPermissions();
      if (result.granted) {
        addTestResult('✅ Location permission granted');
      } else {
        addTestResult('❌ Location permission denied');
      }
    } catch (error) {
      addTestResult('❌ Location test failed: ' + error);
    }
  };

  const testNotifications = async () => {
    try {
      const result = await requestNotificationPermissions();
      if (result.granted) {
        addTestResult('✅ Notification permission granted');
        
        // Test sending a notification
        await LocalNotifications.schedule({
          notifications: [
            {
              title: 'CaseFlow Mobile',
              body: 'Notification test successful!',
              id: Date.now(),
              schedule: { at: new Date(Date.now() + 1000) }
            }
          ]
        });
        addTestResult('✅ Test notification scheduled');
      } else {
        addTestResult('❌ Notification permission denied');
      }
    } catch (error) {
      addTestResult('❌ Notification test failed: ' + error);
    }
  };

  const addTestResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const getStatusIcon = (granted: boolean, denied: boolean) => {
    if (granted) return '✅';
    if (denied) return '❌';
    return '⚠️';
  };

  const getStatusText = (granted: boolean, denied: boolean, prompt: boolean) => {
    if (granted) return 'Granted';
    if (denied) return 'Denied';
    if (prompt) return 'Prompt';
    return 'Unknown';
  };

  return (
    <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-brand-primary">🔐 Permission Test Center</h3>
        <button
          onClick={checkCurrentPermissions}
          className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Current Permission Status */}
      {permissions && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">📷</span>
              <h4 className="font-semibold text-white">Camera</h4>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">
                {getStatusIcon(permissions.camera.granted, permissions.camera.denied)}
              </span>
              <span className="text-sm text-gray-300">
                {getStatusText(permissions.camera.granted, permissions.camera.denied, permissions.camera.prompt)}
              </span>
            </div>
          </div>

          <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">📍</span>
              <h4 className="font-semibold text-white">Location</h4>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">
                {getStatusIcon(permissions.location.granted, permissions.location.denied)}
              </span>
              <span className="text-sm text-gray-300">
                {getStatusText(permissions.location.granted, permissions.location.denied, permissions.location.prompt)}
              </span>
            </div>
          </div>

          <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🔔</span>
              <h4 className="font-semibold text-white">Notifications</h4>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">
                {getStatusIcon(permissions.notifications.granted, permissions.notifications.denied)}
              </span>
              <span className="text-sm text-gray-300">
                {getStatusText(permissions.notifications.granted, permissions.notifications.denied, permissions.notifications.prompt)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button
          onClick={requestAllPerms}
          disabled={isLoading}
          className="px-4 py-2 bg-brand-primary hover:bg-brand-secondary text-white rounded transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Requesting...' : 'Request All'}
        </button>
        <button
          onClick={testCamera}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
        >
          Test Camera
        </button>
        <button
          onClick={testLocation}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
        >
          Test Location
        </button>
        <button
          onClick={testNotifications}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors"
        >
          Test Notifications
        </button>
      </div>

      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="bg-gray-800/30 border border-gray-600 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-white">Test Results</h4>
            <button
              onClick={clearResults}
              className="px-2 py-1 text-xs bg-gray-600 hover:bg-gray-500 text-white rounded"
            >
              Clear
            </button>
          </div>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {testResults.map((result, index) => (
              <div key={index} className="text-sm text-gray-300 font-mono">
                {result}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="text-xs text-gray-400 bg-gray-800/30 border border-gray-600 rounded p-3">
        <strong>Instructions:</strong>
        <ul className="mt-1 space-y-1">
          <li>• Use "Request All" to request all permissions at once</li>
          <li>• Use individual test buttons to test specific permissions</li>
          <li>• If permissions are denied, go to device settings to enable them</li>
          <li>• Refresh to check current permission status</li>
        </ul>
      </div>
    </div>
  );
};

export default PermissionTest;
