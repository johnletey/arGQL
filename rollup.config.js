import { createFilter } from "@rollup/pluginutils";
import pkg from "./package.json";
import typescript from "rollup-plugin-typescript2";

const filter = createFilter("**/*.gql");

export default {
  input: "src/index.ts",
  output: [
    {
      file: pkg.main,
      format: "cjs",
    },
    {
      file: pkg.module,
      format: "es",
    },
  ],
  external: [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.devDependencies || {}),
  ],
  plugins: [
    typescript({
      typescript: require("typescript"),
    }),
    {
      name: "string",
      transform(code, id) {
        if (filter(id)) {
          return {
            code: `export default ${JSON.stringify(code)};`,
            map: { mappings: "" },
          };
        }
      },
    },
  ],
};
