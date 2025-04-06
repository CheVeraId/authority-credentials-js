import baseConfig from '@relaycorp/eslint-config';
import { defineConfig } from 'eslint/config';

export default defineConfig([
    ...baseConfig,
    {
        ignores: ['build/**', 'coverage/**', 'lib/**'],
    },
    {
        rules: {
            'n/no-unsupported-features/node-builtins': 'off',
        },
    },
]);
