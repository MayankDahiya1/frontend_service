/*
 * IMPORTS
 */
import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  ApolloLink,
  split,
  from,
} from "@apollo/client";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
import { getMainDefinition } from "@apollo/client/utilities";
import { networkLogger } from "../utils/debug";

/*
 * HTTP LINK (Queries + Mutations)
 */
const _HttpLink = new HttpLink({
  uri: "https://mayank.engineer/graphql",
});


/*
 * WS LINK (Subscriptions)
 */
const _WsLink = new GraphQLWsLink(
  createClient({
    url: "wss://mayank.engineer/graphql",
    connectionParams: () => {
      const _Token = localStorage.getItem("accessToken");
      return {
        authorization: _Token ? `Bearer ${_Token}` : "",
      };
    },
    on: {
      connected: () => networkLogger.info("WebSocket connection established"),
      closed: () => networkLogger.warn("WebSocket connection closed"),
      error: (error) =>
        networkLogger.error("WebSocket connection error", error),
    },
  })
);

/*
 * AUTH LINK (For HTTP requests)
 */
const _AuthLink = new ApolloLink((operation, forward) => {
  const _Token = localStorage.getItem("accessToken");
  operation.setContext(({ headers = {} }) => ({
    headers: {
      ...headers,
      authorization: _Token ? `Bearer ${_Token}` : "",
    },
  }));
  return forward(operation);
});

/*
 * SPLIT LINK (Decide HTTP vs WS)
 */
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  _WsLink,
  from([_AuthLink, _HttpLink])
);

/*
 * APOLLO CLIENT
 */
const _Client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});

export default _Client;
