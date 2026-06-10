export interface SandboxInstance {
  iframe: HTMLIFrameElement;
  promise: Promise<unknown>;
  run: (code: string) => Promise<unknown>;
  destroy: () => void;
}

export interface WebsandboxModule {
  create: (
    localApi: Record<string, (args: unknown) => unknown>,
    options: {
      frameContainer: HTMLElement;
      frameContent: string;
      allowAdditionalAttributes: string;
    }
  ) => SandboxInstance;
}

type WebsandboxNamespace = {
  default?: WebsandboxModule & { default?: WebsandboxModule };
};

// websandbox ships a UMD bundle with its own webpack `default` export.
// Consumer bundlers wrap CJS under another `.default`, resulting in
// mod.default.default for the actual Websandbox class.
export async function loadWebsandbox(): Promise<WebsandboxModule> {
  const mod = (await import("@jetbrains/websandbox")) as WebsandboxNamespace;
  return (mod.default?.default ?? mod.default) as WebsandboxModule;
}
