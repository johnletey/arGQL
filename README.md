# `ar-gql`

[![Version](https://img.shields.io/npm/v/ar-gql?style=flat&colorA=000000&colorB=000000)](https://www.npmjs.com/package/ar-gql)

> A JavaScript/TypeScript package that makes interaction with the Arweave GraphQL endpoint simple and easy.

## Installation

```sh
# npm
npm i ar-gql
# yarn
yarn add ar-gql
```

## Functions

> optional `gqlUrl` argument has been added to all functions to allow specifying of the gql endpoint url on each function call. This is useful for performance testing of endpoints or temporary switching for specific features not available on current endpoint.

### `run(query, variables?, gqlUrl?)`

The `run` function receives as input a required GraphQL query (compatible with the Arweave GraphQL endpoint) and an optional object of GraphQL variables for the query.

The function returns the result of this query with the variables passed in, if any, returned by the Arweave GraphQL endpoint.

### `all(query, variables?, gqlUrl?)`

Similar to the `run` function, the `all` function receives a query and optional variables.

The one key difference is that it returns all possible transactions returned from running this query. As the Arweave GraphQL endpoint is paginated, this returns all the data by traversing through the pages.

The query passed in must follow the outline shown below:

```
query($cursor: String) {
  transactions(
    # your query parameters
      
    # standard template below
    after: $cursor
    first: 100
  ) {
    pageInfo {
      hasNextPage
    }
    edges {
      cursor
      node {
        # what tx data you want to query for:
        
      }
    }
  }
}
```

### `tx(id, gqlUrl?)`

The `tx` function recieves as an input a valid Arweave transaction id. The function will then return all metadata information about the transaction that the GraphQL endpoint supports.

### `fetchTxTag(id, name, gqlUrl?)`

This function will fetch all tags for the supplied transaction. Then, if it finds a tag with the name provided, it will return the tag value. Else, it will return `undefined`.

### `setEndpointUrl(GQL_URL)`

Set the GQL endpoint. Defaults to `https://arweave.net/graphql`.