import React from 'react'
import { Spinner } from './Spinner.js';
import { gql } from "apollo-boost";
import { Query } from 'react-apollo'

const SALIDAS = gql`
query NextStops ($id: String! $now: time!){
  stop_times(where: {trip: {service_id: {_eq: "invl_20.pex"}}, stop_id: {_eq: $id}, arrival_time: {_gt: $now}}, order_by: {arrival_time: asc}, limit: 10) {
    arrival_time
    stop {
      stop_name
    }
    trip {
      trip_headsign
    }
	trip_id
  }
}`

const Salidas = (props) => {

    const id = props.match.params.id;
	let now =  new Date(); 
	let now_string= now.getHours()+":"+now.getMinutes()+":"+now.getSeconds();
	console.log(now_string);
    return(
        //<Query query={LINEAK} variables={{id: user.sub, hilabetea:2, urtea:2020}}  >
        <Query query={SALIDAS}variables={{id: id, now: now_string}}  >
        {({ loading, error, data }) => {
            if (loading) return <Spinner color="#bf3e2d" />
            if (error) return <div>Error ${error}  </div>
            
            return (
                <div className="lineak">
					<ul>
						{data.stop_times.map(stop_time => {
							const { arrival_time, stop, trip, trip_id} = stop_time;
							return  (
								<li key={trip_id}>
									<h3>{stop.stop_name} - Dirección {trip.trip_headsign}</h3>
									<p>{arrival_time}</p>
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

export default Salidas;
