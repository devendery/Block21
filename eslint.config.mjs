import next from "eslint-config-next";
import coreWebVitals from "eslint-config-next/core-web-vitals";

export default [
  ...next,
  ...coreWebVitals,
  {
    rules: {
      "react/no-unescaped-entities": "off",
      "react/jsx-no-comment-textnodes": "off",
      "react-hooks/exhaustive-deps": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/unsupported-syntax": "off",
      "@next/next/no-img-element": "off",
      "import/no-anonymous-default-export": "off"
    }
  }
];
