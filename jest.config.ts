/** @type {import('jest').Config} */
export default {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    moduleNameMapper: {
        '^@pages/(.*)$': '<rootDir>/src/pages/$1',
        '^@components/(.*)$': '<rootDir>/src/components/$1',
        '^@layouts/(.*)$': '<rootDir>/src/layouts/$1',
        '^@services/(.*)$': '<rootDir>/src/services/$1',
        '^@store/(.*)$': '<rootDir>/src/store/$1',
        '^@styles/(.*)$': '<rootDir>/src/styles/$1',
        '^@utils/(.*)$': '<rootDir>/src/utils/$1',
        '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
        '^@ui/(.*)$': '<rootDir>/src/ui/$1',
        '^@constants/(.*)$': '<rootDir>/src/constants/$1',
        '^@app-types/(.*)$': '<rootDir>/src/types/$1',
        '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
    },
    transform: {
        '^.+\\.tsx?$': 'ts-jest',
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};
