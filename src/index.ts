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
): Promise<GQLEdgeInterface[]> => {
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
  const isBrowser: boolean = typeof window !== "undefined";

  if (isBrowser) {
    const cache = JSON.parse(localStorage.getItem("gqlCache") || "{}");
    if (id in cache) return JSON.parse(cache[id]);
  }

  const res = await run(txQuery, { id });

  if (isBrowser && res.data.transaction.block) {
    const cache = JSON.parse(localStorage.getItem("gqlCache") || "{}");
    cache[id] = res.data.transaction;
    localStorage.setItem("gqlCache", JSON.stringify(cache));
  }

  return res.data.transaction;
};

export const fetchTxTag = async (
  id: string,
  name: string
): Promise<string | undefined> => {
  const res = await tx(id);

  const tag = res.tags.find((tag) => tag.name === name);
  if (tag) return tag.value;
};
