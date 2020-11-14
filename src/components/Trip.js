import React, { useRef , useEffect} from 'react';
import { Spinner } from './Spinner.js';
import { useQuery } from '@apollo/react-hooks';
import { gql } from "apollo-boost";
import { stringTimeToDate, getMinuteDiff } from './Utils.js';
import { format } from "date-fns";

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

const scrollToRef = (ref) => {
	window.scrollTo(0, ref.current.offsetTop - 274)   
}

const shareTrip = (data, props) => {
    console.log(data)
    console.log(props)
    
    const { date, stop_name } = props.location.state;
    console.log( "reactmetro.herokuapp.com"+props.location.pathname );
    navigator.share({
        title: "Metro del"+ format(date, "dd/MM/yyyy hh:mm"), 
        text: stop_name + " Dirección " + data.trips_by_pk.trip_headsign,
        url: "https://reactmetro.herokuapp.com"+props.location.pathname 
    }).then(() => console.log('Share complete'))
      .error((error) => console.error('Could not share at this time', error))
}
const Trip = (props) => {

	const id = props.match.params.id;
	const showMinutes = props.match.params.showMinutes;
	let stop_id = 0
	if(props.location.data) stop_id=props.location.data.id;
	const now = useRef(new Date());
	let isSelected = false;

	const { loading, error, data } = useQuery(SALIDAS, {
		variables: {id: id},
	});

	const myRef = useRef(null);

	useEffect(() => {
		if(myRef.current){
			scrollToRef(myRef);
		}
	}, [data]);

	if (loading) return <Spinner color="#ff6505" />
    if (error) return <div>Error ${error}  </div>

		return (
			<div className="trip">
			<h1> Metro {data.trips_by_pk.stop_times[0].stop.stop_name}-{data.trips_by_pk.trip_headsign}</h1>  
            {(navigator.share && props.location.state) &&
                <button className="share-button svg" onClick={() => shareTrip(data, props)}></button>
            }
			<ul>
			{data.trips_by_pk.stop_times.map(stop_time => {
				const { arrival_time, stop } = stop_time;
				const minuteDiff = getMinuteDiff(stringTimeToDate(arrival_time), now.current);
				isSelected = isSelected | stop.stop_id==stop_id;
				return  (
					<li ref={stop.stop_id==stop_id ? myRef : null} className={stop_id != 0 ? stop.stop_id==stop_id ? "selected": isSelected ? "post-selected" : "pre-selected" : ""} key={stop.stop_id}>
					<h3>{stop.stop_name}</h3>
                    { showMinutes ? 
					<p className="diff">{minuteDiff}</p>
                    : 
                    <p className="diff">{arrival_time}</p>
                    }
					</li>
				)}
			)}
			</ul>
			</div>
		)
};

export default Trip;
