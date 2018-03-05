module.exports = {
    extends: 'eslint:recommended',
    plugins: ['prettier'],
    rules: {
        'prettier/prettier': [
            'error',
            {
                singleQuote: true,
                tabWidth: 4,
                printWidth: 110
            }
        ],
        'no-console': 0
    },
    env: {
        node: true,
        es6: true,
        mocha: true
    },
    parserOptions: {
        ecmaVersion: 2017
    }
};