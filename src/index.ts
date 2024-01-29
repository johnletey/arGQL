import GQLResultInterface, {
  GQLEdgeInterface,
  GQLNodeInterface,
} from "./faces";
import txQuery from "./queries/tx";

export type PageCallback = (pageEdges: GQLEdgeInterface[]) => Promise<void>
export interface ArGqlInterface {
  run: (query: string, variables?: Record<string, unknown>) => Promise<GQLResultInterface>
  all: (query: string, variables?: Record<string, unknown>, pageCallback?: PageCallback) => Promise<GQLEdgeInterface[]>
  tx: (id: string) => Promise<GQLNodeInterface>
  fetchTxTag: (id: string, name: string) => Promise<string | undefined>
  endpointUrl: string

}

export function arGql(endpointUrl?: string): ArGqlInterface {
  //sanity check
  if (endpointUrl && !endpointUrl.match(/^https?:\/\/.*\/graphql$/)) {
    throw new Error(`string doesn't appear to be a URL of the form <http(s)://some-domain/graphql>'. You entered "${endpointUrl}"`)
  }
  const _endpointUrl = endpointUrl || 'https://arweave.net/graphql' //default to arweave.net/graphql 

  const run = async (
    query: string,
    variables?: Record<string, unknown>,
  ): Promise<GQLResultInterface> => {
    const graphql = JSON.stringify({
      query,
      variables,
    });

    const res = await fetch(_endpointUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: graphql,
    });

    if (!res.ok) {
      throw new Error(res.statusText, { cause: res.status })
    }

    return await res.json();
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
    endpointUrl: _endpointUrl,
  }
}

/** some useful constants */
export const GQLUrls = {
  goldsky: 'https://arweave-search.goldsky.com/graphql',
  arweave: 'https://arweave.net/graphql',
}
