import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom'
import { Spinner } from './Spinner.js';
import { CardSwiper } from './CardSwiper.js';
import { useStateWithLocalStorage, distanceString, calculateDistance, stringTimeToDate, getMinuteDiff } from './Utils.js';
import { gql } from "apollo-boost";
import { useQuery } from '@apollo/react-hooks';
import { Swiper, SwiperSlide } from 'swiper/react';
import { MuiPickersUtilsProvider, TimePicker } from "@material-ui/pickers";
import DateFnsUtils from '@date-io/date-fns';

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
    const [position, setPosition] = useState([43.320779, -2.985927]);
    const [selectedDate, handleDateChange] = useState(new Date());
	const now = useRef(new Date());
    let service_id=sessionStorage.getItem("service_id")==undefined ? "invl_20.pex" : sessionStorage.getItem("service_id");
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
        <div className="search">
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <TimePicker
                clearable
                ampm={false}
                label="Hora salida"
                value={selectedDate}
                onChange={handleDateChange}
            />
       </MuiPickersUtilsProvider>
        </div>
        <CardSwiper data={dataAll} error={errorAll} loading={loadingAll} now={now} title="Líneas cercanas" classname="near-lineas" showDistance={true} lastTrips={false} showAddButton={false} sliceNum={6} />
        </div>

    )
};

export default Home;
