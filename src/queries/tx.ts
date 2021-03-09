export default `
query($id: ID!) {
  transaction(id: $id) {
    id
    anchor
    signature
    recipient
    owner {
      address
      key
    }
    fee {
      winston
      ar
    }
    quantity {
      winston
      ar
    }
    data {
      size
      type
    }
    tags {
      name
      value
    }
    block {
      id
      timestamp
      height
      previous
    }
    parent {
      id
    }
  }
}
`;
