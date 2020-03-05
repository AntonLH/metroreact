import React from "react";
import Header from './Header.js';
import Lineas from './Lineas.js';
import Salidas from './Parada.js';
import Trip from './Trip.js';
import { Switch, Route } from 'react-router-dom'
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
            <div className="App">
                <Header />
                <main>
                <Switch>
                  <Route exact path="/" component={Lineas} />
                  <Route exact path="/parada/:id" component={Salidas} />
                  <Route exact path="/trip/:id" component={Trip} />
                </Switch>
                </main>
            </div>
    </ApolloProvider>
    );
}

export default App;
