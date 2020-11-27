import fetch from "node-fetch";
import GQLResultInterface, {
  GQLEdgeInterface,
  GQLNodeInterface,
} from "./types";
import txQuery from "./queries/tx.gql";

export const run = async (
  query: string,
  variables?: Record<string, unknown>
): Promise<GQLResultInterface> => {
  const graphql = JSON.stringify({
    query,
    variables,
  });

  const requestOptions = {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: graphql,
  };

  const res = await fetch("https://arweave.net/graphql", requestOptions);
  return await res.clone().json();
};

export const all = async (
  query: string,
  variables?: Record<string, unknown>
): Promise<any> => {
  let hasNextPage = true;
  let edges: GQLEdgeInterface[] = [];
  let cursor: string = "";

  while (hasNextPage) {
    const res = (
      await run(query, {
        ...variables,
        cursor,
      })
    ).data.transactions;

    if (res.edges && res.edges.length) {
      edges = edges.concat(res.edges);
      cursor = res.edges[res.edges.length - 1].cursor;
    }
    hasNextPage = res.pageInfo.hasNextPage;
  }

  return edges;
};

export const tx = async (id: string): Promise<GQLNodeInterface> => {
  const res = await run(txQuery, { id });
  return res.data.transaction;
};
