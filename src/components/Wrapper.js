import React, { useRef } from 'react';
import Lineas from './Lineas.js';
import Busqueda from './Busqueda.js';
import Home from './Home.js';
import Parada from './Parada.js';
import Trip from './Trip.js';
import { Switch, Route } from 'react-router-dom'
import { Spinner } from './Spinner.js';
import { gql } from "apollo-boost";
import { useQuery } from '@apollo/react-hooks';


const SERVICE = gql`
query getService($date: numeric!, $weekDay: Boolean!, $friday: Boolean, $saturday: Boolean, $sunday: Boolean) {
  calendar(where: {end_date: {_gte: $date}, start_date: {_lte: $date}, friday: {_eq: $friday}, monday: {_eq: $weekDay}, saturday: {_eq: $saturday}, sunday: {_eq: $sunday}}) {
    service_id
  }
}`

const Wrapper = () => {
	const now = useRef(new Date());
	const today=parseInt(now.current.toISOString().slice(0,10).replace(/-/g,""));
	const friday=now.current.getDay()==5;
	const saturday=now.current.getDay()==6;
	const sunday=now.current.getDay()==0;
	const weekDay=!friday && !saturday && !sunday;

    const { loading, error, data } = useQuery(SERVICE, {
		variables: {date: today, weekDay: weekDay, friday: friday, saturday: saturday, sunday: sunday },
    });

    if (loading) return <Spinner color="#ff6505" />
    if (error) return <div>Error ${error}  </div>

    let service_id=data.calendar[0].service_id;
    sessionStorage.setItem("service_id", service_id);

    return (
            <div className="App">
                <main>
                <Switch>
                  <Route exact path="/" component={Home} />
                  <Route exact path="/lineas" component={Lineas} />
                  <Route exact path="/busqueda" component={Busqueda} />
                  <Route exact path="/parada/:id" component={Parada} />
                  <Route exact path="/trip/:id" component={Trip} />
                </Switch>
                </main>
            </div>
    );
}

export default Wrapper;

