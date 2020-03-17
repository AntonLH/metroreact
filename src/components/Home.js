import React, { useRef } from 'react';
import { Link } from 'react-router-dom'
import { Spinner } from './Spinner.js';
import { stringTimeToDate, getMinuteDiff } from './Utils.js';
import { gql } from "apollo-boost";
import { useQuery } from '@apollo/react-hooks';


const PARADAS = gql`
query NextTrips($now: time!, $stops: [String!], $service_id: String!) {
  stops(where: {location_type: {_eq: 0}, stop_id: {_in: $stops}}, order_by: {stop_name: asc}) {
    stop_id
    stop_name
    stop_times(limit: 4, where: {trip: {service_id: {_eq: $service_id}}, arrival_time: {_gt: $now}}, order_by: {arrival_time: asc}) {
      arrival_time
      trip {
        trip_headsign
		trip_id
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


const Home = () => {
	const now = useRef(new Date());
    let service_id=sessionStorage.getItem("service_id")==undefined ? "invl_20.pex" : sessionStorage.getItem("service_id");
    console.log(service_id);

	const now_string= now.current.getHours()+":"+now.current.getMinutes()+":"+now.current.getSeconds();
	const stops = localStorage.getItem("id") ? localStorage.getItem("id").split(",") : [];
	const { loading, error, data } = useQuery(PARADAS, {
		variables: {now: now_string, stops: stops, service_id: service_id },
    });

    if (loading) return <Spinner color="#ff6505" />
    if (error) return <div>Error ${error}  </div>

    return (
        <div className="home">
		<h2><Link to='/lineas'>Ir a todas las líneas</Link></h2>
			<ul>
			{data.stops.map(stop => {
				const { stop_id, stop_name, stop_times, stop_times_aggregate} = stop;
                let last_direction_true=false;
                let last_direction_false=false;
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
							<li key={trip.trip_id}>{trip.trip_headsign} {minuteDiff}</li>
						)}
					)}
					</ul>
					{stop_times_aggregate.nodes.map(stop_time => {
						const { departure_time, trip } = stop_time;
                        if(trip.direction_id && !last_direction_true){
                            last_direction_true=true;
                            return  (
                                <p>Último metro hacia {trip.trip_headsign} a las: {departure_time}</p>
                            )
                        }
                        if(!trip.direction_id && !last_direction_false){
                            last_direction_false=true;
                            return  (
                                <p>Último metro hacia {trip.trip_headsign} a las: {departure_time}</p>
                            )
                        }
                    }
                    )}
					</li>
				)}
			)}
			</ul>
        </div>

    )
};

export default Home;

