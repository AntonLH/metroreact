import React, { useEffect} from 'react';
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


const Paradas = () => {


	let position = [43.320779, -2.985927]
	let now =  new Date(); 
	let now_string= now.getHours()+":"+now.getMinutes()+":"+now.getSeconds();
	const { loading, error, data } = useQuery(PARADAS, {
		variables: {now: now_string},
    });

	useEffect(() => {
        navigator.geolocation.getCurrentPosition((currentPosition) => {
            position=[currentPosition.coords.latitude, currentPosition.coords.longitude]; 
            console.log(position);
        });
	}, [data]);

    if (loading) return <Spinner color="#bf3e2d" />
    if (error) return <div>Error ${error}  </div>

    return (
        <div className="lineas">
        <div className="map">
        {(typeof window !== 'undefined') ? (
            <Map center={position} zoom={11}>
            <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
            id="mapbox.grayscale"
            />
            {data.stops.map(stop => {
                const { stop_id, stop_lat, stop_lon, stop_name} = stop;
                let coordinates=[stop_lat, stop_lon];
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
            const minuteDiff = getMinuteDiff(arrival_time_date, now);
            return  (
                <li key={stop_id}>
                <Link to={{ pathname: `/parada/${stop_id}`}}>
                <h3>{stop_name}</h3>
                </Link>
                <p>Próximo metro {minuteDiff} hacia {trip.trip_headsign}</p>
                </li>
            )}
        )}
        </ul>
        </div>

    )
};

export default Paradas;
