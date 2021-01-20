# `arGQL`

[![Version](https://img.shields.io/npm/v/ar-gql?style=flat&colorA=000000&colorB=000000)](https://www.npmjs.com/package/ar-gql)

> A JavaScript/TypeScript package that makes interaction with the Arweave GraphQL endpoint simple and easy.

## Installation

```sh
# npm
npm install ar-gql
# yarn
yarn add ar-gql
```

## Functions

### `run(query, variables?)`

The `run` function receives as input a required GraphQL query (compatible with the Arweave GraphQL endpoint) and an optional object of GraphQL variables for the query.

The function returns the result of this query with the variables passed in, if any, returned by the Arweave GraphQL endpoint.

### `all(query, variables?)`

Similar to the `run` function, the `all` function receives a query and optional variables.

The one key difference is that it returns all possible transactions returned from running this query. As the Arweave GraphQL endpoint is paginated, this returns all the data by traversing through the pages.

The query passed in must follow the outline shown below:

```
query($cursor: String) {
  transactions(
    # your query parameters
    after: $cursor
  ) {
    pageInfo {
      hasNextPage
    }
    edges {
      cursor
      # whatever else you want to query for
    }
  }
}
```

### `tx(id)`

The `tx` function recieves as an input a valid Arweave transaction id. The function will then return all information about the transaction that the GraphQL endpoint supports.

Note that this function does not return the transaction data.

### `fetchTxTag(id, name)`

This function will fetch all tags for the supplied transaction. Then, if it finds a tag with the name provided, it will return the tag value. Else, it will return `undefined`.
