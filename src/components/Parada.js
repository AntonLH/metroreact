import React, { useRef } from 'react';
import { Link } from 'react-router-dom'
import Skeleton from 'react-loading-skeleton';
import { gql } from "apollo-boost";
import { useQuery } from '@apollo/react-hooks';
import { Trips } from './Trips.js';
import { Map, Marker, Popup, TileLayer } from 'react-leaflet'
import { getServiceId } from './Utils.js';
import L from 'leaflet'
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

const SALIDAS = gql`
query NextStops($id: String!, $now_timestamp: timestamp!, $today: timestamp!, $parent_id: String!, $now: time!, $service_id: String!) {
  stop_times(where: {trip: {service_id: {_eq: $service_id}}, stop_id: {_eq: $id}, arrival_time: {_gt: $now}}, order_by: {arrival_time: asc}, limit: 10) {
    arrival_time
    trip {
      trip_headsign
        incidents(where: {created_at: {_gt: $today}, _and: {created_at: {_lt: $now_timestamp}}}){
            minutes
        }
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
  stops(where: {parent_station: {_eq: $parent_id}, location_type: {_eq: 2}}) {
    stop_id
    stop_lat
    stop_lon
    stop_name
  }
}`

const Parada = (props) => {

    const id = props.match.params.id;
    const backURL = props.location.state? props.location.state.backURL : "/";
    const parent_id = id.substr(0,id.indexOf("."));
	const url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
	const now = useRef(new Date());
	const today = useRef(new Date());
    today.current.setHours(0);
    today.current.setMinutes(0);
	const now_string= now.current.getHours()+":"+now.current.getMinutes()+":"+now.current.getSeconds();
    let service_id=sessionStorage.getItem("service_id")==undefined ? getServiceId(now) : sessionStorage.getItem("service_id");

	const { loading, error, data } = useQuery(SALIDAS, {
		variables: {id: id, parent_id: parent_id, now: now_string, now_timestamp: now.current, today: today.current, service_id: service_id}
    });

    if (loading) return (
		<div className="parada">
			<div className="back"><Link to={backURL}></Link></div>
			<div className="map">
			<Map zoom={17} maxZoom={19}>
				<TileLayer
				url={url}
				attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
				/>
				
			</Map>
			</div>
			<div className="content">
				<h1><Skeleton width={150} /></h1>
                <p>Último metro hacia <Skeleton width={150} /> a las: <Skeleton width={50} /></p>
                <p>Último metro hacia <Skeleton width={150} /> a las: <Skeleton width={50} /></p>
                <Trips data={data} error={error} loading={loading} id={id} now={now.current} showMinutes={true}/>
			</div>
		</div>
    )
	if (error) return <div>Error ${error}  </div>

	const position=[data.stops_by_pk.stop_lat, data.stops_by_pk.stop_lon] 
	console.log(data)
    let last_direction_true=false;
    let last_direction_false=false;
	return (
		<div className="parada">
			<div className="back"><Link to={backURL}></Link></div>
			<div className="map">
			<Map center={position} zoom={17} maxZoom={19}>
				<TileLayer
				url={url}
				attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
				/>
				{data.stops.map(stop => {
					const { stop_id, stop_lat, stop_lon, stop_name} = stop;
					const coordinates=[stop_lat, stop_lon];
					return (
						<Marker key={stop_id} position={coordinates}>
						<Popup>{stop_name}</Popup>
						</Marker>
					)
				})}
			</Map>
			</div>
			<div className="content">
				<h1>{data.stops_by_pk.stop_name}</h1>
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
                <Trips data={data} error={error} loading={loading} id={id} now={now.current} showMinutes={true}/>
			</div>
		</div>
	)
};

export default Parada;
