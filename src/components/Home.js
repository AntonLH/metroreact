import React, { useRef } from 'react';
import { Link } from 'react-router-dom'
import { Spinner } from './Spinner.js';
import { stringTimeToDate, getMinuteDiff } from './Utils.js';
import { gql } from "apollo-boost";
import { useQuery } from '@apollo/react-hooks';
import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/swiper.scss';


const PARADAS = gql`
query NextTrips($now: time!, $stops: [String!], $service_id: String!) {
  stops(where: {location_type: {_eq: 0}, stop_id: {_in: $stops}}, order_by: {stop_name: asc}) {
    stop_id
    stop_name
    stop_times(limit: 4, where: {trip: {service_id: {_eq: $service_id}}, arrival_time: {_gt: $now}}, order_by: {arrival_time: asc}) {
      arrival_time
      trip {
        trip_headsign
		trip_id
        direction_id
      }
    }
    stop_times_aggregate(order_by: {departure_time: desc}, limit: 10, where: {trip: {service_id: {_eq: $service_id}}}) {
      nodes {
          departure_time
          trip {
              trip_headsign
              direction_id
          }
      }
    }
  }
}`


const Home = () => {
	const now = useRef(new Date());
    let service_id=sessionStorage.getItem("service_id")==undefined ? "invl_20.pex" : sessionStorage.getItem("service_id");
    console.log(service_id);

	const now_string= now.current.getHours()+":"+now.current.getMinutes()+":"+now.current.getSeconds();
	const stops = localStorage.getItem("id") ? localStorage.getItem("id").split(",") : [];
	const { loading, error, data } = useQuery(PARADAS, {
		variables: {now: now_string, stops: stops, service_id: service_id },
    });

    if (loading) return <Spinner color="#ff6505" />
    if (error) return <div>Error ${error}  </div>

    return (
        <div className="home">
        <div className="card lines">
		<Link to='/lineas'>
        <h2>Todas las líneas</h2>
        </Link>
        </div>
        <h2>Mis líneas</h2>
        <Swiper
          spaceBetween={50}
          slidesOffsetBefore={30}
          slidesPerView={1.4}
          onSlideChange={() => console.log('slide change')}
          onSwiper={(swiper) => console.log(swiper)}
        >
			{data.stops.map(stop => {
				const { stop_id, stop_name, stop_times, stop_times_aggregate} = stop;
                let last_direction_true=false;
                let last_direction_false=false;
				return  (
                  <SwiperSlide>
                    <div className="card">
					<Link to={{ pathname: `/parada/${stop_id}`}}>
                    <div className="swipe-image-wrapper">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/3/39/Abando_metro_station.jpg" />
                    </div>
					<h3>{stop_name}</h3>
                    <div className="info">
					{stop_times.map(stop_time => {
						const { arrival_time, trip } = stop_time;
						const arrival_time_date=stringTimeToDate(arrival_time);
						const minuteDiff = getMinuteDiff(arrival_time_date, now.current);
						return  (
							<p className={trip.direction_id ? "icon-wrapper departure" : "icon-wrapper arrival"}>{minuteDiff} · {trip.trip_headsign} </p>
						)}
					)}
                    <p>Últimos metros</p>
					{stop_times_aggregate.nodes.map(stop_time => {
						const { departure_time, trip } = stop_time;
                        //direction_id is a boolean indicating the direction, true=east/false=west
                        if(trip.direction_id && !last_direction_true){
                            last_direction_true=true;
                            return  (
                                <p className="icon-wrapper last">{trip.trip_headsign} · {departure_time}</p>
                            )
                        }
                        if(!trip.direction_id && !last_direction_false){
                            last_direction_false=true;
                            return  (
                                <p className="icon-wrapper last">{trip.trip_headsign} · {departure_time}</p>
                            )
                        }
                    }
                    )}
                    </div>
					</Link>
                    </div>
					</SwiperSlide>
				)}
			)}
            </Swiper>
        </div>

    )
};

export default Home;

