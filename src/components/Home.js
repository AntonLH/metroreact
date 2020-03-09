import React, { useRef } from 'react';
import { Link } from 'react-router-dom'
import { Spinner } from './Spinner.js';
import { stringTimeToDate, getMinuteDiff } from './Utils.js';
import { gql } from "apollo-boost";
import { useQuery } from '@apollo/react-hooks';


const PARADAS = gql`
query NextTrips($now: time!, $stops: [String!]) {
  stops(where: {location_type: {_eq: 0}, stop_id: {_in: $stops}}, order_by: {stop_name: asc}) {
    stop_id
    stop_name
    stop_times(limit: 4, where: {trip: {service_id: {_eq: "invl_20.pex"}}, arrival_time: {_gt: $now}}, order_by: {arrival_time: asc}) {
      arrival_time
      trip {
        trip_headsign
      }
    }
  }
}`


const Home = () => {
	const now = useRef(new Date());
	const now_string= now.current.getHours()+":"+now.current.getMinutes()+":"+now.current.getSeconds();
	const stops = localStorage.getItem("id") ? localStorage.getItem("id").split(",") : [];
	const { loading, error, data } = useQuery(PARADAS, {
		variables: {now: now_string, stops: stops },
    });

    if (loading) return <Spinner color="#bf3e2d" />
    if (error) return <div>Error ${error}  </div>

    return (
        <div className="home">
		<h2><Link to='/lineas'>Ir a todas las líneas</Link></h2>
			<ul>
			{data.stops.map(stop => {
				const { stop_id, stop_name, stop_times} = stop;
				return  (
					<li key={stop_id}>
					<Link to={{ pathname: `/parada/${stop_id}`}}>
					<h3>{stop_name}</h3>
					</Link>
					<ul>
					{stop_times.map(stop_time => {
						const { arrival_time, trip } = stop_time;
						const arrival_time_date=stringTimeToDate(arrival_time);
						const minuteDiff = getMinuteDiff(arrival_time_date, now.current);
						return  (
							<li>{trip.trip_headsign} {minuteDiff}</li>
						)}
					)}
					</ul>
					</li>
				)}
			)}
			</ul>
        </div>

    )
};

export default Home;

