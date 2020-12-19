import React  from 'react';
import { Link } from 'react-router-dom'
import Skeleton from 'react-loading-skeleton';
import { stringTimeToDate, getMinuteDiff } from './Utils.js';


export const Trips = (props) => {
	const { loading, error, data, now, stop_name, id, showMinutes} = props;

    if (loading) return (
			<ul>
                {[...Array(10)].map(() => {
                return(
                <li>
                    <a><h3><Skeleton width={150} /></h3></a>         
                    <p><Skeleton width={250} /></p>
                </li>
                )}
                )}
			</ul>
    )
    if (error) return <div>Error ${error}  </div>

    return (
        <ul className="trips">
        {data.stop_times.map(stop_time => {
            const { arrival_time, trip, trip_id} = stop_time;
            return  (
                <li key={trip_id}>
                <Link to={{ pathname: `/trip/${trip_id}`, data: {id}, state: { date: now, stop_name: stop_name, showMinutes: showMinutes}}} ><h3>Dirección {trip.trip_headsign}</h3></Link>
                
                <p>{arrival_time} {trip.incidents && trip.incidents.length> 0 ? <span className="alert">{"Llega " +trip.incidents[0].minutes+" minutos tarde" }</span> : "" }</p>
                { showMinutes && 
                <p>{getMinuteDiff(stringTimeToDate(arrival_time), now)}</p>
                }
                </li>
            )}
        )}
        </ul>
    )
};
