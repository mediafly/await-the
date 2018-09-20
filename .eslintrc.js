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
        'valid-jsdoc': [
            'error',
            {
                prefer: {
                    arg: 'param',
                    argument: 'param',
                    return: 'returns'
                },
                preferType: {
                    boolean: 'Boolean',
                    number: 'Number',
                    object: 'Object',
                    string: 'String',
                    array: 'Array',
                    function: 'Function'
                },
                requireReturn: false,
                matchDescription: '.+',
                requireReturnDescription: false
            }
        ]
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
