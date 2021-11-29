module.exports = {
	env:{node:true},
  extends: ["eslint:recommended"],
  rules: {
    quotes: ["error", "double"],
    "no-console": "off",
    "no-empty": 0,
    "no-unused-vars": ["error", { args: "after-used" }],
  },
};
