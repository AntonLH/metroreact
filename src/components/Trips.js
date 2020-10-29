import React  from 'react';
import { Link } from 'react-router-dom'
import Skeleton from 'react-loading-skeleton';
import { stringTimeToDate, getMinuteDiff } from './Utils.js';


export const Trips = (props) => {
	const { loading, error, data, now, id} = props;

    if (loading) return <Skeleton />
    if (error) return <div>Error ${error}  </div>

    return (
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
    )
};
