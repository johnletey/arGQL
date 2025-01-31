export interface GQLPageInfoInterface {
  hasNextPage: boolean;
}

export interface GQLOwnerInterface {
  address: string;
  key: string;
}

export interface GQLAmountInterface {
  winston: string;
  ar: string;
}

export interface GQLMetaDataInterface {
  size: number;
  type: string;
}

export interface GQLTagInterface {
  name: string;
  value: string;
}

export interface GQLBlockInterface {
  id: string;
  timestamp: number;
  height: number;
  previous: string;
}

export interface GQLNodeInterface {
  id: string;
  anchor: string;
  signature: string;
  recipient: string;
  owner: GQLOwnerInterface;
  fee: GQLAmountInterface;
  quantity: GQLAmountInterface;
  data: GQLMetaDataInterface;
  tags: GQLTagInterface[];
  block: GQLBlockInterface;
  parent: {
    id: string;
  };
}

export interface GQLEdgeInterface {
  cursor: string;
  node: GQLNodeInterface;
}

export interface GQLTransactionsResultInterface {
  pageInfo: GQLPageInfoInterface;
  edges: GQLEdgeInterface[];
}

export default interface GQLResultInterface {
  data: {
    transaction: GQLNodeInterface;
    transactions: GQLTransactionsResultInterface;
  };
}

export class GQLError extends Error {
  public cause: Response & { gqlError: string }

  constructor(message: string, cause: Response & { gqlError: string }) {
    super(message);
    this.name = 'GQLError'; // Set the name property to reflect the custom error type
    this.cause = cause
  }
}

