import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom'
import { Spinner } from './Spinner.js';
import { stringTimeToDate, getMinuteDiff } from './Utils.js';
import { gql } from "apollo-boost";
import { useQuery } from '@apollo/react-hooks';
import { Map, Marker, Popup, TileLayer } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

const PARADAS = gql`
query Stops($now: time!) {
  stops(where: {location_type: {_eq: 0}}, order_by: {stop_name: asc}) {
    stop_id
    stop_lat
    stop_lon
    stop_name
    stop_times(limit: 1, where: {arrival_time: {_gt: $now}}, order_by: {arrival_time: asc}) {
      arrival_time
      trip {
        trip_headsign
      }
    }
  }
}`


const calculateDistance = (lat1, lon1, lat2, lon2) => {
    var R = 3958.7558657440545;
    var dLat = (lat2-lat1) * Math.PI/180;
    var dLon = (lon2-lon1) * Math.PI/180; 
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2); 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c;
    return d;
}

const Paradas = () => {
    const [position, setPosition] = useState([43.320779, -2.985927]);
	const now = useRef(new Date());
	const now_string= now.current.getHours()+":"+now.current.getMinutes()+":"+now.current.getSeconds();
	const { loading, error, data } = useQuery(PARADAS, {
		variables: {now: now_string},
    });

	const handleClick = (elem) => {
		let aux = JSON.parse(localStorage.getItem("id")) || [];
		aux.push(elem.target.dataset.stop);
		localStorage.setItem("id", JSON.stringify(aux));
	}
	useEffect(() => {
        navigator.geolocation.getCurrentPosition((currentPosition) => {
            setPosition([currentPosition.coords.latitude, currentPosition.coords.longitude]);
        });
	}, [data]);

    if (loading) return <Spinner color="#bf3e2d" />
    if (error) return <div>Error ${error}  </div>

	for (let stop of data.stops) {
		stop.distance = calculateDistance(position[0], position[1], stop.stop_lat, stop.stop_lon);
	}

	data.stops.sort(function(a, b) { 
		return a.distance - b.distance;
	});
    return (
        <div className="lineas">
			<div className="map">
			{(typeof window !== 'undefined') ? (
				<Map center={position} zoom={13}>
				<TileLayer
				url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
				id="mapbox.grayscale"
				/>
				{data.stops.map(stop => {
					const { stop_id, stop_lat, stop_lon, stop_name} = stop;
					const coordinates=[stop_lat, stop_lon];
					return (
						<Marker key={stop_id} position={coordinates}>
						<Popup>
						<Link to={{ pathname: `/parada/${stop_id}`}}>{stop_name}</Link>
						</Popup>
						</Marker>
					)
				})}
				</Map>
			) : null} 
			</div>
			<ul>
			{data.stops.map(stop => {
				const { stop_id, stop_lat, stop_lon, stop_name, stop_times} = stop;
				const { arrival_time, trip } = stop_times[0];
				const arrival_time_date=stringTimeToDate(arrival_time);
				const minuteDiff = getMinuteDiff(arrival_time_date, now.current);
				return  (
					<li key={stop_id}>
					<Link to={{ pathname: `/parada/${stop_id}`}}>
					<h3>{stop_name}</h3>
					</Link>
					<button data-stop={stop_id} onClick={handleClick}>Añadir {stop_name}</button>
					<p>Próximo metro {minuteDiff} hacia {trip.trip_headsign}</p>
					</li>
				)}
			)}
			</ul>
        </div>

    )
};

export default Paradas;
