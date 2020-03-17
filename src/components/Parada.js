import React, { useRef } from 'react';
import { Link } from 'react-router-dom'
import { Spinner } from './Spinner.js';
import { gql } from "apollo-boost";
import { useQuery } from '@apollo/react-hooks';
import { stringTimeToDate, getMinuteDiff } from './Utils.js';
import { Map, Marker, Popup, TileLayer } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

const SALIDAS = gql`
query NextStops($id: String!, $parent_id: String!, $now: time!, $service_id: String!) {
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
  stops(where: {parent_station: {_eq: $parent_id}, location_type: {_eq: 2}}) {
    stop_id
    stop_lat
    stop_lon
    stop_name
  }
}`

const Salidas = (props) => {

    const id = props.match.params.id;
    const parent_id = id.substr(0,id.indexOf("."));
	const url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
	const now = useRef(new Date());
	const now_string= now.current.getHours()+":"+now.current.getMinutes()+":"+now.current.getSeconds();
    let service_id=sessionStorage.getItem("service_id")==undefined ? "invl_20.pex" : sessionStorage.getItem("service_id");

	const { loading, error, data } = useQuery(SALIDAS, {
		variables: {id: id, parent_id: parent_id, now: now_string, service_id: service_id}
    });

    if (loading) return <Spinner color="#ff6505" />
	if (error) return <div>Error ${error}  </div>

	const position=[data.stops_by_pk.stop_lat, data.stops_by_pk.stop_lon] 
	console.log(data)
    let last_direction_true=false;
    let last_direction_false=false;
	return (
		<div className="parada">
			<div className="back"><Link to='/lineas'></Link></div>
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
				<ul>
				{data.stop_times.map(stop_time => {
					const { arrival_time, trip, trip_id} = stop_time;
					const minuteDiff = getMinuteDiff(stringTimeToDate(arrival_time), now.current);
					return  (
						<li key={trip_id}>
						<Link to={{ pathname: `/trip/${trip_id}`, data: {id}}} ><h3>Dirección {trip.trip_headsign}</h3></Link>
						<p>{arrival_time}</p>
						<p>{minuteDiff}</p>
						</li>
					)}
				)}
				</ul>
			</div>
		</div>
	)
};

export default Salidas;
