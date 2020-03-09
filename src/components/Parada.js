import React, { useRef } from 'react';
import { Link } from 'react-router-dom'
import { Spinner } from './Spinner.js';
import { gql } from "apollo-boost";
import { Query } from 'react-apollo'
import { stringTimeToDate, getMinuteDiff } from './Utils.js';

const SALIDAS = gql`
query NextStops($id: String!, $now: time!) {
  stop_times(where: {trip: {service_id: {_eq: "invl_20.pex"}}, stop_id: {_eq: $id}, arrival_time: {_gt: $now}}, order_by: {arrival_time: asc}, limit: 10) {
    arrival_time
    trip {
      trip_headsign
    }
    trip_id
  }
  stops_by_pk(stop_id: $id) {
    stop_name
  }
}`

const Salidas = (props) => {

    const id = props.match.params.id;
	const now = useRef(new Date());
	const now_string= now.current.getHours()+":"+now.current.getMinutes()+":"+now.current.getSeconds();
    return(
        //<Query query={LINEAK} variables={{id: user.sub, hilabetea:2, urtea:2020}}  >
        <Query query={SALIDAS} variables={{id: id, now: now_string}}  >
        {({ loading, error, data }) => {
            if (loading) return <Spinner color="#bf3e2d" />
            if (error) return <div>Error ${error}  </div>
            
            return (
                <div className="parada">
                <h1>{data.stops_by_pk.stop_name}</h1>
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
			)
		}}
		</Query>
	)
};

export default Salidas;
