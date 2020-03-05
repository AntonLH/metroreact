import React from 'react'
import { Link } from 'react-router-dom'
import { Spinner } from './Spinner.js';
import { gql } from "apollo-boost";
import { Query } from 'react-apollo'

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
				</div>
            )
        }}
    </Query>
    )
};

export default Paradas;
