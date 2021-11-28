module.exports = {
  extends: [
    "eslint:recommended",
    "standard"
  ],
  rules: {
    quotes: ["error", "double"],
    "no-console": "off",
    "no-empty": 0,
    "no-unused-vars": ["error", { args: "after-used" }]
  }
}
