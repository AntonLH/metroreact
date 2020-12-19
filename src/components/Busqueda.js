import React, { useRef } from 'react';
import { Link } from 'react-router-dom'
import Skeleton from 'react-loading-skeleton';
import { gql } from "apollo-boost";
import { useQuery } from '@apollo/react-hooks';
import { Buscador } from './Buscador.js';
import { Trips } from './Trips.js';
import { getServiceId } from './Utils.js';
import { format } from "date-fns";

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
  }
}`

const ALLPARADAS = gql`
query Stops {
  stops(where: {location_type: {_eq: 0}}, order_by: {stop_name: asc}) {
    stop_id
    stop_name
  }
}`

const Busqueda = (props) => {

    let date;
	if(props.location.state) date = props.location.state.date;
	let fromId=props.match.params.id;
	const now = useRef(new Date());
	let now_string= format(now.current, "HH:mm:ss")
    let service_id=sessionStorage.getItem("service_id")==undefined ? getServiceId(now) : sessionStorage.getItem("service_id");
    if(date!==undefined){
        now_string= format(date, "HH:mm:ss")
        service_id=getServiceId(date);
    }

	const  { data: dataAll, error: errorAll, loading: loadingAll } = useQuery(ALLPARADAS);
	const { loading, error, data } = useQuery(SALIDAS, {
		variables: {id: fromId, now: now_string, service_id: service_id}, 
        skip: fromId==undefined
    });

    if (loading) return (
		<div className="busqueda">

			<div className="header">
                <div className="back"><Link to='/'></Link></div>
            </div>
            <Buscador data={dataAll} error={errorAll} loading={loadingAll} selectedFromId={fromId} selectedDateProps={date ? date : now.current} />
			<div className="content">
                <h2>{format(date ? date : now.current, "dd/MM/yyyy HH:mm")}</h2>
                <p>Último metro hacia <Skeleton width={150} /> a las: <Skeleton width={50} /></p>
                <p>Último metro hacia <Skeleton width={150} /> a las: <Skeleton width={50} /></p>
                <Trips data={data} error={error} loading={loading} id={fromId} now={date ? date : now.current} showMinutes={false}/>
			</div>
            }
		</div>

    )
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
            <Buscador data={dataAll} error={errorAll} loading={loadingAll} selectedFromId={fromId} selectedDateProps={date ? date : now.current} />
            { data &&
			<div className="content">
                <h2>{format(date ? date : now.current, "dd/MM/yyyy HH:mm")}</h2>
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
                <Trips data={data} error={error} loading={loading} id={fromId} stop_name={data.stops_by_pk.stop_name} now={date ? date : now.current} showMinutes={false}/>
			</div>
            }
		</div>
	)
};

export default Busqueda;

