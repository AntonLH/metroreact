import React from 'react'
import { Spinner } from './Spinner.js';
import { gql } from "apollo-boost";
import { Query } from 'react-apollo'

const SALIDAS = gql`
query TripByPk($id: String!) {
  trips_by_pk(trip_id: $id) {
    trip_headsign
    trip_id
    stop_times(order_by: {departure_time: asc}) {
      arrival_time
      stop {
        stop_name
        stop_id
      }
    }
  }
}`

const Trip = (props) => {

    const id = props.match.params.id;
    let stop_id = 0
	if(props.location.data) stop_id=props.location.data.id;
	console.log(stop_id);
	let now =  new Date(); 
	let now_string= now.getHours()+":"+now.getMinutes()+":"+now.getSeconds();
	console.log(now_string);
    return(
        //<Query query={LINEAK} variables={{id: user.sub, hilabetea:2, urtea:2020}}  >
        <Query query={SALIDAS}variables={{id: id}}  >
        {({ loading, error, data }) => {
            if (loading) return <Spinner color="#bf3e2d" />
            if (error) return <div>Error ${error}  </div>
            
            return (
                <div className="trip">
                <h1>Metro {data.trips_by_pk.stop_times[0].stop.stop_name}-{data.trips_by_pk.trip_headsign}</h1>
					<ul>
						{data.trips_by_pk.stop_times.map(stop_time => {
							const { arrival_time, stop } = stop_time;
							const isSelected = stop.stop_id==stop_id;
							return  (
								<li className={isSelected ? "selected" : ""} key={stop.stop_id}>
									<h3>{stop.stop_name}</h3>
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

export default Trip;
