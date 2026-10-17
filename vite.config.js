import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.jsx'],
            refresh: true,
        }),
        react(),
    ],
    resolve: {
        alias: {
            '@/Components': '/resources/js/components',
            '@/components': '/resources/js/components',
            '@/Context': '/resources/js/context',
            '@/context': '/resources/js/context',
            '@/Layouts': '/resources/js/Layouts',
            '@/layouts': '/resources/js/Layouts',
            '@/Utils': '/resources/js/Utils',
            '@/utils': '/resources/js/Utils',
            '@': '/resources/js',
        },
    },
});
