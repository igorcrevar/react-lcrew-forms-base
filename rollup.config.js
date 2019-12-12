import babel from "rollup-plugin-babel";
import buble from "rollup-plugin-buble";
import { uglify } from "rollup-plugin-uglify";

const config = {
  input: "src/index.js",
  output: {
    format: "cjs",
    interop: false,
    strict: false,
    exports: "named"
  },
  plugins: [
    buble({ objectAssign: true }),
    babel({
      babelrc: false,
      plugins: []
    })
  ],
  external: ["react", "prop-types"]
};

if (process.env.NODE_ENV === "production") {
  config.plugins.push(
    babel({
      babelrc: false,
      plugins: [
      ]
    }),
    uglify({
      mangle: {
        properties: { regex: /^\$/ }
      },
      compress: {
        pure_getters: true
      }
    })
  );
}

export default config;
