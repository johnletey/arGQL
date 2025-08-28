import GQLResultInterface, {
  GQLEdgeInterface,
  GQLNodeInterface,
  GQLError
} from "./faces";
import txQuery from "./queries/tx";
import { fetchRetry } from "./utils/fetchRetry";

export type PageCallback = (pageEdges: GQLEdgeInterface[]) => Promise<void>
export interface ArGqlInterface {
  run: (query: string, variables?: Record<string, unknown>) => Promise<GQLResultInterface>
  all: (query: string, variables?: Record<string, unknown>, pageCallback?: PageCallback) => Promise<GQLEdgeInterface[]>
  tx: (id: string) => Promise<GQLNodeInterface>
  fetchTxTag: (id: string, name: string) => Promise<string | undefined>
  endpointUrl: string
}
export interface ArGqlOptions {
  endpointUrl?: string,
  /** @default 0 */
  retries?: number,
  /** @default 10_000 ms */
  retryMs?: number,
}

export function arGql(options?: ArGqlOptions): ArGqlInterface {
  const defaultOpts: ArGqlOptions = {
    endpointUrl: 'https://arweave.net/graphql',
    retries: 0,
    retryMs: 10_000,
  }
  const opts = { ...defaultOpts, ...options }
  //sanity check
  if (!opts.endpointUrl!.match(/^https?:\/\/.*\/graphql*/)) {
    console.warn(`warning: string doesn't appear to be a URL of the form <http(s)://some-domain/graphql>'. You entered "${opts.endpointUrl}"`)
  }

  const run = async (
    query: string,
    variables?: Record<string, unknown>,
  ): Promise<GQLResultInterface> => {
    const graphql = JSON.stringify({
      query,
      variables,
    });

    const res = await fetchRetry(
      opts.endpointUrl!,
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: graphql,
      },
      {
        retry: opts.retries!,
        retryMs: opts.retryMs!,
      }
    );

    //workaround, apparently some errors are being returned as 200
    let resJson: any = {};
    try {
      resJson = await res.json();
    } catch (e) { }

    if (!res.ok || !resJson.data) {
      let gqlError = 'none';
      try {
        gqlError = JSON.stringify(resJson, null, 2);
      } catch (e) { }
      throw new GQLError(res.statusText, Object.assign(res, { gqlError }));
    }

    return resJson as GQLResultInterface;
  };

  const all = async (
    query: string,
    variables?: Record<string, unknown>,
    pageCallback?: PageCallback,
  ): Promise<GQLEdgeInterface[]> => {
    let hasNextPage = true;
    let edges: GQLEdgeInterface[] = [];
    let cursor: string = "";
    let pageCallbacks: Promise<void>[] = []

    while (hasNextPage) {
      const res = (
        await run(
          query,
          { ...variables, cursor },
        )
      ).data.transactions;

      if (res.edges && res.edges.length) {
        if (typeof pageCallback === 'function') {
          pageCallbacks.push(pageCallback(res.edges))
        } else {
          edges = edges.concat(res.edges);
        }
        cursor = res.edges[res.edges.length - 1].cursor;
      }
      hasNextPage = res.pageInfo.hasNextPage;
    }

    await Promise.all(pageCallbacks)

    return edges;
  };

  const tx = async (id: string): Promise<GQLNodeInterface> => {

    const res = await run(txQuery, { id });

    return res.data.transaction;
  };


  const fetchTxTag = async (
    id: string,
    name: string,
  ): Promise<string | undefined> => {
    const res = await tx(id);

    const tag = res.tags.find((tag) => tag.name === name);
    if (tag) return tag.value;
  };

  return {
    run,
    all,
    tx,
    fetchTxTag,
    endpointUrl: opts.endpointUrl!,
  }
}

/** some useful constants */
export const GQLUrls = {
  goldsky: 'https://arweave-search.goldsky.com/graphql',
  arweave: 'https://arweave.net/graphql',
}
