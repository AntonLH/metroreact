import React from 'react'
import { Link } from 'react-router-dom'
import { Spinner } from './Spinner.js';
import { gql } from "apollo-boost";
import { Query } from 'react-apollo'
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
query Stops {
  stops(where: {location_type: {_eq: 0}}, order_by: {stop_id: asc}) {
    stop_id
    stop_lat
    stop_lon
    stop_name
  }
}`


const Paradas = () => {


	const position = [43.320779, -2.985927]
    return(
        <Query query={PARADAS}>
        {({ loading, error, data }) => {
            if (loading) return <Spinner color="#bf3e2d" />
            if (error) return <div>Error ${error}  </div>



			return (
				<div className="lineak">
				<ul>
				{data.stops.map(stop => {
					const { stop_id, stop_lat, stop_lon, stop_name} = stop;
					return  (
						<li key={stop_id}>
						<Link
						to={{
							pathname: `/parada/${stop_id}`,
						}}>
						<h3>{stop_name} - Coordenadas: {stop_lat}, {stop_lon}</h3>
						</Link>
						</li>
					)}
				)}
				</ul>
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
						console.log(coordinates)
						return (
							<Marker position={coordinates}>
							<Popup>
							<Link to={{ pathname: `/parada/${stop_id}`,}}>{stop_name}</Link>
							</Popup>
							</Marker>
						)
					})}
					</Map>
				) : null} 
				</div>
				</div>

			)
		}}
		</Query>
	)
};

export default Paradas;
