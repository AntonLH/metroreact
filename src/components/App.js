import React from "react";
import Wrapper from './Wrapper.js';
import {ApolloProvider} from "react-apollo"
import { ApolloClient, HttpLink, InMemoryCache } from "apollo-boost";

const App = () => {

  const httpLink = new HttpLink({
    uri: "https://hasurametrobilbao.herokuapp.com/v1/graphql",
  });
  const client = new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache()
  });

    return (
    <ApolloProvider client={client}>
            <Wrapper>
            </Wrapper>
    </ApolloProvider>
    );
}

export default App;
