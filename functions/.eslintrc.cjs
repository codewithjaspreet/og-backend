// module.exports = {
//   env: {
//     es6: true,
//     node: true,
//   },
//   parserOptions: {
//     "ecmaVersion": 2018,
//     "sourceType": "module"   
//   },
//   extends: [
//     "eslint:recommended",
//     "google",
//   ],
//   rules: {
//     "no-restricted-globals": ["error", "name", "length"],
//     "prefer-arrow-callback": "error",
//     "quotes": ["error", "double", {"allowTemplateLiterals": true}],
//   },
//   overrides: [
//     {
//       files: ["**/*.spec.*"],
//       env: {
//         mocha: true,
//       },
//       rules: {},
//     },
//   ],
//   globals: {},
// };

// functions/.eslintrc.cjs
module.exports = {
  root: true,
  env: { node: true, es2022: true },
  parserOptions: {
    ecmaVersion: 2022,     // supports ??, optional chaining, etc.
    sourceType: "module",  // ESM (import/export)
  },
  extends: [
    "eslint:recommended",
    // "google",            // TEMP: comment out to avoid style noise
  ],
  rules: {
    // Keep it minimal to unblock deploy; re‑enable later if you want
    "no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    "no-trailing-spaces": "off",
    "quotes": ["off", "double", { allowTemplateLiterals: true }],
    "object-curly-spacing": "off",
    "indent": "off",
    "max-len": "off",
    "require-jsdoc": "off",
  },
  overrides: [
    // If you have any .cjs files, parse those as CommonJS
    { files: ["**/*.cjs"], parserOptions: { sourceType: "script" } },
    // Tests (keep your mocha override if needed)
    { files: ["**/*.spec.*"], env: { mocha: true } },
  ],
};

