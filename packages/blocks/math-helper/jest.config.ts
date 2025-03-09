/* eslint-disable */
export default {
    displayName: 'blocks-math-helper',
    preset: '../../../jest.preset.js',
    testEnvironment: 'node',
    transform: {
      '^.+\\.ts$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
    },
    moduleFileExtensions: ['ts', 'js', 'html'],
    coverageDirectory: '../../../coverage/packages/blocks/math-helper',
  };
