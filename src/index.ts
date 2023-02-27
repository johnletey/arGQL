import GQLResultInterface, {
  GQLEdgeInterface,
  GQLNodeInterface,
} from "./faces";
import txQuery from "./queries/tx";

export interface ArGql {
  run: (query: string, variables?: Record<string, unknown>) => Promise<GQLResultInterface>
  all: (query: string, variables?: Record<string, unknown>) => Promise<GQLEdgeInterface[]>
  tx: (id: string) => Promise<GQLNodeInterface>
  fetchTxTag: (id: string, name: string) => Promise<string | undefined>
  getConfig: () => { endpointUrl: string }
}

export default function arGql(endpointUrl?: string): ArGql {
  //sanity check
  if(endpointUrl && !endpointUrl.match(/^https?:\/\/.*\/graphql$/)){
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

    if(!res.ok){ 
      throw new Error(res.statusText, { cause: res.status })
    }
  
    return await res.json();
  };

  const all = async (
    query: string,
    variables?: Record<string, unknown>,
  ): Promise<GQLEdgeInterface[]> => {
    let hasNextPage = true;
    let edges: GQLEdgeInterface[] = [];
    let cursor: string = "";
  
    while (hasNextPage) {
      const res = (
        await run(
          query, 
          { ...variables, cursor },
        )
      ).data.transactions;
  
      if (res.edges && res.edges.length) {
        edges = edges.concat(res.edges);
        cursor = res.edges[res.edges.length - 1].cursor;
      }
      hasNextPage = res.pageInfo.hasNextPage;
    }
  
    return edges;
  };

  const tx = async (id: string): Promise<GQLNodeInterface> => {
    const isBrowser: boolean = typeof window !== "undefined";
  
    // if (isBrowser) {
    //   const cache = JSON.parse(localStorage.getItem("gqlCache") || "{}");
    //   if (id in cache) return JSON.parse(cache[id]);
    // }
  
    const res = await run(txQuery, { id });
  
    // if (isBrowser && res.data.transaction.block) {
    //   const cache = JSON.parse(localStorage.getItem("gqlCache") || "{}");
    //   cache[id] = res.data.transaction;
    //   localStorage.setItem("gqlCache", JSON.stringify(cache));
    // }
  
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
    getConfig: ()=> ({ 
      endpointUrl: _endpointUrl, 
    })
  }
}
