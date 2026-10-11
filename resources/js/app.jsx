import './bootstrap';
import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';

const appName = import.meta.env.VITE_APP_NAME || 'Bizzhuss';

// Resolve initial page data from DOM (#app element or script[data-page="app"])
function getInitialPage() {
    if (typeof window === 'undefined') return undefined;

    // 1. Try traditional Inertia div[data-page]
    const el = document.getElementById('app');
    if (el?.dataset?.page) {
        try {
            return JSON.parse(el.dataset.page);
        } catch (e) {
            console.error('Error parsing data-page from #app element', e);
        }
    }

    // 2. Try modern Inertia script[data-page]
    const scriptEl = document.querySelector('script[data-page="app"][type="application/json"]');
    if (scriptEl?.textContent) {
        try {
            return JSON.parse(scriptEl.textContent);
        } catch (e) {
            console.error('Error parsing script[data-page="app"]', e);
        }
    }

    return undefined;
}

const initialPage = getInitialPage();

import { CartProvider } from '@/Context/CartContext';
import { WishlistProvider } from '@/Context/WishlistContext';
import { AppProvider } from '@/context/AppContext';

createInertiaApp({
    page: initialPage,
    title: (title) => (title ? `${title}` : `${appName} - Multi-Vendor Platform`),
    resolve: (name) => {
        // Resolve both lowercase 'pages' and uppercase 'Pages'
        const pages = import.meta.glob(['./pages/**/*.jsx', './Pages/**/*.jsx'], { eager: true });
        const cleanName = name.replace(/^(pages|Pages)\//i, '');

        const resolved =
            pages[`./pages/${cleanName}.jsx`] ||
            pages[`./Pages/${cleanName}.jsx`] ||
            pages[`./pages/${name}.jsx`] ||
            pages[`./Pages/${name}.jsx`];

        if (resolved) {
            return resolved.default || resolved;
        }

        // Case-insensitive fallback lookup
        const lowerClean = cleanName.toLowerCase();
        const key = Object.keys(pages).find((k) => {
            const lk = k.toLowerCase();
            return (
                lk === `./pages/${lowerClean}.jsx` ||
                lk === `./pages/${lowerClean}.jsx` ||
                lk.endsWith(`/${lowerClean}.jsx`)
            );
        });
        if (key && pages[key]) {
            return pages[key].default || pages[key];
        }

        throw new Error(`Inertia page component not found: "${name}". Available pages: ${Object.keys(pages).join(', ')}`);
    },
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(
            <CartProvider>
                <WishlistProvider>
                    <AppProvider>
                        <App {...props} />
                    </AppProvider>
                </WishlistProvider>
            </CartProvider>
        );
    },
    progress: {
        color: '#6366f1',
    },
});
