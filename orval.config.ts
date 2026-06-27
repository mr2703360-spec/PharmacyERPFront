import { defineConfig } from "orval";

export default defineConfig({
  api: {
    input: "../backEnd/openapi.json",
    output: {
      workspace: "./src/api",
      target: "./index.ts",
      client: "react-query",
      mode: "tags-split",
      schemas: "./model",
      override: {
        mutator: {
          path: "./http.ts",
          name: "customInstance",
        },
      },
    },
  },
});
