module.exports = {
    "env": {
        "es6": true,
        "node": true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "ecmaVersion": 2018
    },
    "rules": {
        "indent": [
            "error",
            4
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "error",
            "single"
        ],
        "semi": [
            "error",
            "always"
        ],
        "eqeqeq": [
            "error",
            "always"
        ],
        "no-else-return": "error",
        "no-return-await": "error",
        "no-var": "error",
        "no-multi-spaces": ["error", { ignoreEOLComments: true }],
        "no-throw-literal": "error",
        "global-require": "error",
        "curly": "error",
    },
    "globals": {
        "describe": true,
        "xdescribe": true,
        "it": true,
        "xit": true,
        "before": true,
        "after": true,
        "beforeEach": true,
        "afterEach": true
    }
};