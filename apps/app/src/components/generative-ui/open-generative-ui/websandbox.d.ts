// @jetbrains/websandbox is a transitive dependency of @copilotkit/react-core
// (pnpm strict isolation — no hoisted types). Shorthand declaration so the
// dynamic import in websandbox-loader.ts typechecks; the loader narrows the
// module shape itself.
declare module "@jetbrains/websandbox";
