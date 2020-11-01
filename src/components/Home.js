import React, { useRef } from 'react';
import { Link } from 'react-router-dom'
import { CardSwiper } from './CardSwiper.js';
import { Buscador } from './Buscador.js';
import { gql } from "apollo-boost";
import { useQuery } from '@apollo/react-hooks';
import { getServiceId } from './Utils.js';

import 'swiper/swiper.scss';


const PARADAS = gql`
query NextTrips($now: time!, $stops: [String!], $service_id: String!) {
  stops(where: {location_type: {_eq: 0}, stop_id: {_in: $stops}}, order_by: {stop_name: asc}) {
    stop_id
    stop_name
    image
    stop_times(limit: 2, where: {trip: {service_id: {_eq: $service_id}}, arrival_time: {_gt: $now}}, order_by: {arrival_time: asc}) {
      arrival_time
      trip {
        trip_headsign
		trip_id
        direction_id
      }
    }
    stop_times_aggregate(order_by: {departure_time: desc}, limit: 10, where: {trip: {service_id: {_eq: $service_id}}}) {
      nodes {
          departure_time
          trip {
              trip_headsign
              direction_id
          }
      }
    }
  }
}`

const ALLPARADAS = gql`
query Stops($now: time!, $service_id: String!) {
  stops(where: {location_type: {_eq: 0}}, order_by: {stop_name: asc}) {
    stop_id
    stop_lat
    stop_lon
    stop_name
    image
    stop_times(limit: 2, where: {arrival_time: {_gt: $now}, trip: {service_id: {_eq: $service_id}}}, order_by: {arrival_time: asc}) {
      arrival_time
      trip {
        trip_headsign
		trip_id
        direction_id
      }
    }
  }
}`

const Home = () => {
	const now = useRef(new Date());
    let service_id=sessionStorage.getItem("service_id")==undefined ? getServiceId(now) : sessionStorage.getItem("service_id");
    console.log(service_id);

	const now_string= now.current.getHours()+":"+now.current.getMinutes()+":"+now.current.getSeconds();
	const stops = localStorage.getItem("id") ? localStorage.getItem("id").split(",") : [];
	const  { data: dataAll, error: errorAll, loading: loadingAll } = useQuery(ALLPARADAS, {
		variables: {now: now_string, service_id: service_id },
    });
	const { loading, error, data } = useQuery(PARADAS, {
		variables: {now: now_string, stops: stops, service_id: service_id },
    });

    return (
        <div className="home">
        <div className="card lines">
		<Link to='/lineas'>
        <h2>Todas las paradas</h2>
        </Link>
        </div>
        <CardSwiper data={data} error={error} loading={loading} now={now} title="Mis líneas" classname="mylines" showDistance={false} lastTrips={true} showAddButton={true} sliceNum={0} />
        <Buscador data={dataAll} error={errorAll} loading={loadingAll} />
        <CardSwiper data={dataAll} error={errorAll} loading={loadingAll} now={now} title="Líneas cercanas" classname="near-lineas" showDistance={true} lastTrips={false} showAddButton={false} sliceNum={6} />
        </div>

    )
};

export default Home;
