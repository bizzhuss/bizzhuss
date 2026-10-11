import defaultTheme from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.{js,jsx,ts,tsx}',
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                brand: {
                    50: '#edf4ff',
                    100: '#dbe8ff',
                    200: '#bfd7ff',
                    300: '#92beff',
                    400: '#5e9aff',
                    500: '#0057FF', // Primary Brand Base
                    600: '#0047db',
                    700: '#0037b0',
                    800: '#002e8e',
                    900: '#002673',
                    950: '#001a52',
                    DEFAULT: '#0057FF',
                },
                accent: {
                    // High-contrast secondary for "Buy Now" & Flash Sale ribbons
                    orange: '#FF6B00',
                    amber: '#F59E0B',
                    50: '#ecfdf5',
                    100: '#d1fae5',
                    200: '#a7f3d0',
                    300: '#6ee7b7',
                    400: '#34d399',
                    500: '#10b981',
                    600: '#059669',
                    700: '#047857',
                    800: '#065f46',
                    900: '#064e3b',
                },
                slate: {
                    850: '#151f33',
                    950: '#0b0f19',
                }
            },
            fontFamily: {
                sans: ['Inter', ...defaultTheme.fontFamily.sans],
            },
        },
    },
    plugins: [],
};
