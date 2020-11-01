import React, { useRef } from 'react';
import { Link } from 'react-router-dom'
import { Spinner } from './Spinner.js';
import { gql } from "apollo-boost";
import { useQuery } from '@apollo/react-hooks';
import { Buscador } from './Buscador.js';
import { Trips } from './Trips.js';
import { getServiceId } from './Utils.js';

const SALIDAS = gql`
query NextStops($id: String!, $now: time!, $service_id: String!) {
  stop_times(where: {trip: {service_id: {_eq: $service_id}}, stop_id: {_eq: $id}, arrival_time: {_gt: $now}}, order_by: {arrival_time: asc}, limit: 10) {
    arrival_time
    trip {
      trip_headsign
    }
    trip_id
  }
    stop_times_aggregate(order_by: {departure_time: desc}, limit: 10, where: {stop_id: {_eq: $id}, trip: {service_id: {_eq: $service_id}}}) {
        nodes {
            departure_time
            trip {
                trip_headsign
                direction_id
            }
        }
    }
  stops_by_pk(stop_id: $id) {
    stop_name
    stop_lat
    stop_lon
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

const Busqueda = (props) => {

    const { fromId, date } = props.location.state;
	const now = useRef(new Date());
	let now_string= now.current.getHours()+":"+now.current.getMinutes()+":"+now.current.getSeconds();
    if(date!==undefined){
        now_string=date.getHours()+":"+date.getMinutes()+":"+date.getSeconds();
    }
    let service_id=sessionStorage.getItem("service_id")==undefined ? getServiceId(now) : sessionStorage.getItem("service_id");

	const  { data: dataAll, error: errorAll, loading: loadingAll } = useQuery(ALLPARADAS, {
		variables: {now: now_string, service_id: service_id },
    });
	const { loading, error, data } = useQuery(SALIDAS, {
		variables: {id: fromId, now: now_string, service_id: service_id}, 
        skip: fromId==undefined
    });

    if (loading) return <Spinner color="#ff6505" />
	if (error) return <div>Error ${error}  </div>

    let last_direction_true=false;
    let last_direction_false=false;
	return (
		<div className="busqueda">

			<div className="header">
                <div className="back"><Link to='/'></Link></div>
                { data ? (
                <h1>{data.stops_by_pk.stop_name}</h1>
                ) : (
                <h1>Búsqueda</h1>
                )
                }
            </div>
            <Buscador data={dataAll} error={errorAll} loading={loadingAll} selectedFromId={fromId} selectedDateProps={date} />
            { data &&
			<div className="content">
                {data.stop_times_aggregate.nodes.map(stop_time => {
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
                <Trips data={data} error={error} loading={loading} id={fromId} now={now} showMinutes={false}/>
			</div>
            }
		</div>
	)
};

export default Busqueda;

