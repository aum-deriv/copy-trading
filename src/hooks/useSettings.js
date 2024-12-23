import { useState, useEffect, useCallback } from 'react';
import useWebSocket from './useWebSocket';
import useAuthorize from './useAuthorize';
import { getConfig } from '../config';

const config = getConfig();
const WEBSOCKET_URL = `${config.WS_URL}?app_id=${config.APP_ID}`;

const useSettings = () => {
    const [settings, setSettings] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const { isAuthorized } = useAuthorize();
    const { isConnected, sendMessage } = useWebSocket(WEBSOCKET_URL);

    // Fetch settings when authorized
    useEffect(() => {
        if (isConnected && isAuthorized && !settings) {
            console.log('Fetching user settings');
            sendMessage(
                { get_settings: 1 },
                (response) => {
                    if (response.error) {
                        console.error('Failed to fetch settings:', response.error);
                        setError(response.error);
                    } else {
                        console.log('Settings received:', response.get_settings);
                        setSettings(response.get_settings);
                        setError(null);
                    }
                    setIsLoading(false);
                }
            );
        }
    }, [isConnected, isAuthorized, settings, sendMessage]);

    // Reset settings when connection is lost
    useEffect(() => {
        if (!isConnected) {
            setSettings(null);
            setIsLoading(true);
        }
    }, [isConnected]);

    const updateSettings = useCallback(async (newSettings) => {
        if (!isConnected || !isAuthorized) {
            throw new Error('Not connected or authorized');
        }

        return new Promise((resolve, reject) => {
            sendMessage(
                { set_settings: 1, ...newSettings },
                (response) => {
                    if (response.error) {
                        console.error('Failed to update settings:', response.error);
                        setError(response.error);
                        reject(response.error);
                    } else {
                        console.log('Settings updated:', response.set_settings);
                        setSettings(response.set_settings);
                        setError(null);
                        resolve(response.set_settings);
                    }
                }
            );
        });
    }, [isConnected, isAuthorized, sendMessage]);

    return {
        settings,
        error,
        isLoading,
        updateSettings,
        isConnected,
        isAuthorized
    };
};

export default useSettings;