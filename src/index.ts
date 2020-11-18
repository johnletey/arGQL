import fetch from "node-fetch";

export const query = async (
  query: string,
  variables?: Record<string, unknown>
): Promise<any> => {
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
