import { useState } from 'react';

export function useNotification() {
    const [notification, setNotification] = useState(null);

    const showNotification = (message, type = 'success') => {
        setNotification({ id: Date.now(), message, type });
        setTimeout(() => {
            setNotification(null);
        }, 4500);
    };

    const clearNotification = () => setNotification(null);

    return {
        notification,
        showNotification,
        clearNotification,
    };
}
