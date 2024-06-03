export declare class Config {
  public auto?: boolean;
  public debug?: boolean;
  public renderFile?: string;
  public cdn?: string;
  public msgFile?: string;
  public root?: string;
  public to?: number;

  public constructor(options?: {
    auto?: boolean;
    debug?: boolean;
    renderFile?: string;
    cdn?: string;
    msgFile?: string;
    root?: string;
    to?: number;
  });
}

export declare class Position {
  public html: string;
  public id: string;
  public src: string;
  public meta?: Record<string, unknown>;
  public config?: Record<string, unknown>;

  public constructor(
    config: {
      id: string;
      src?: string;
      html: string;
      config?: PosConfig;
    },
  );
}

export declare class PosConfig {
  public id: string;
  public dest: string;

  public constructor(
    // eslint-disable-next-line ts/naming-convention
    posIDorObj: string | {
      bg?: string;
      css?: string;
      dest?: string;
      h?: number;
      id?: string;
      size?: string;
      tgt?: string;
      w?: number;
      z?: number;
      supports?: Record<string, unknown>;
    },
    // eslint-disable-next-line ts/naming-convention
    destID?: string,
    baseConf?: {
      bg?: string;
      css?: string;
      dest?: string;
      h?: number;
      id?: string;
      size?: string;
      tgt?: string;
      w?: number;
      z?: number;
      supports?: Record<string, unknown>;
    },
  );
}

export type SafeFrameImplementation = {
  env: {
    // eslint-disable-next-line ts/naming-convention
    isIE: boolean;
    ua: unknown;
  };
  host: {
    // eslint-disable-next-line ts/naming-convention
    Config: typeof Config;
    // eslint-disable-next-line ts/naming-convention
    Position: typeof Position;
    // eslint-disable-next-line ts/naming-convention
    PosConfig: typeof PosConfig;
    render(position: Position): void;
  };
  info: {
    errs: ReadonlyArray<unknown>;
    list: ReadonlyArray<unknown>;
  };
  ver: string;
  specVersion: string;
};
