# `ar-gql` version 1

[![Version](https://img.shields.io/npm/v/ar-gql?style=flat&colorA=000000&colorB=000000)](https://www.npmjs.com/package/ar-gql)

> A JavaScript/TypeScript package that makes interaction with the Arweave GraphQL endpoint simple and easy.

## Installation

```sh
# npm
npm i ar-gql
# yarn
yarn add ar-gql
```

> ## Migrating from version v0.x.x to v1.x.x
> - Functions are no longer directly imported. You need to import an `ArGqlInterface` object and create instanced from it. See [Code Set Up](#code-set-up) section below
> - As axios is no longer used internally `e.response` will always be undefined. You can catch regular `Error` objects with: 
> ```ts
> e.message   // status text
> e.cause     // http status number 
> ```
> in all other Fetch error cases there will be a standard Fetch `TypeError` with a relevent message.

## Code Set Up

```ts
import { arGql } from 'ar-gql'

//...

const argql = arGql() // default is `https://arweave.net/graphql`.

// you can now use argql similar to as before and it will make requests to the default GQL endpoint
const tx = await argql.tx('DeYQPjoEQLLds7usOMZFJFCe7VyTpodYl6Mok6UP6Z4')
console.log(tx.id) // 'DeYQPjoEQLLds7usOMZFJFCe7VyTpodYl6Mok6UP6Z4'

// you can set up another instance with another enpoint
const goldsky = arGql('https://arweave-search.goldsky.com/graphql')
// and use it at the same time
const edges = await goldsky.tx(someTxid)

//...

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

### `tx(id)`

The `tx` function recieves as an input a valid Arweave transaction id. The function will then return all metadata information about the transaction that the GraphQL endpoint supports.

### `fetchTxTag(id, name)`

This function will fetch all tags for the supplied transaction. Then, if it finds a tag with the name provided, it will return the tag value. Else, it will return `undefined`.

### `endpointUrl`

A read-only property of the GQL endpoint URL of the instance. 
