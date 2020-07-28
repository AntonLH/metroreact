import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom'
import { Spinner } from './Spinner.js';
import { useStateWithLocalStorage, distanceString, calculateDistance, stringTimeToDate, getMinuteDiff } from './Utils.js';
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

const ALLPARADAS = gql`
query Stops($now: time!, $service_id: String!) {
  stops(where: {location_type: {_eq: 0}}, order_by: {stop_name: asc}) {
    stop_id
    stop_lat
    stop_lon
    stop_name
    stop_times(limit: 2, where: {arrival_time: {_gt: $now}, trip: {service_id: {_eq: $service_id}}}, order_by: {arrival_time: asc}) {
      arrival_time
      trip {
        trip_headsign
		trip_id
        direction_id
      }
    }
  }
}`

const Home = () => {
    const [position, setPosition] = useState([43.320779, -2.985927]);
	const now = useRef(new Date());
    let service_id=sessionStorage.getItem("service_id")==undefined ? "invl_20.pex" : sessionStorage.getItem("service_id");
    console.log(service_id);

	const now_string= now.current.getHours()+":"+now.current.getMinutes()+":"+now.current.getSeconds();
	const stops = localStorage.getItem("id") ? localStorage.getItem("id").split(",") : [];
	const  { data: dataAll, error: errorAll, loading: loadingAll } = useQuery(ALLPARADAS, {
		variables: {now: now_string, service_id: service_id },
    });
	const { loading, error, data } = useQuery(PARADAS, {
		variables: {now: now_string, stops: stops, service_id: service_id },
    });

	const [prefs, setPrefs] =  useStateWithLocalStorage("id");
	const handleClick = (elem) => {
		const prefs_arr=prefs.split(",");
		if(prefs_arr.indexOf(elem.target.dataset.stop)>0){
			setPrefs(prefs_arr.filter(pref => pref != elem.target.dataset.stop).join(","));
		}
		else{
			setPrefs(prefs+","+elem.target.dataset.stop);
		}
	}
	useEffect(() => {
        navigator.geolocation.getCurrentPosition((currentPosition) => {
            setPosition([currentPosition.coords.latitude, currentPosition.coords.longitude]);
        });
	}, [dataAll]);

    if (loading | loadingAll) return <Spinner color="#ff6505" />
    if (error | errorAll) return <div>Error ${error}  </div>

	for (let stop of dataAll.stops) {
		stop.distance = calculateDistance(position[0], position[1], stop.stop_lat, stop.stop_lon);
	}
	dataAll.stops.sort((a, b) => a.distance - b.distance)

    return (
        <div className="home">
        <div className="card lines">
		<Link to='/lineas'>
        <h2>Todas las paradas</h2>
        </Link>
        </div>
        <div className="mylines">
        <h2>Mis paradas</h2>
        <Swiper
          spaceBetween={50}
          slidesOffsetBefore={30}
          slidesPerView={1.4}
        >
			{data.stops.map(stop => {
				const { stop_id, stop_name, stop_times, stop_times_aggregate} = stop;
                let last_direction_true=false;
                let last_direction_false=false;
				return  (
                  <SwiperSlide>
                    <div className="card">
                    <div className="like-button-wrapper">
                    <button className={(prefs.split(",").indexOf(stop_id)>0) ? "remove" : "add" } data-stop={stop_id} onClick={handleClick}><span data-stop={stop_id}></span></button>
                    </div>
					<Link to={{ pathname: `/parada/${stop_id}`}}>
                    <div className="swipe-image-wrapper">
					<h3>{stop_name}</h3>
                    <img src="https://upload.wikimedia.org/wikipedia/commons/3/39/Abando_metro_station.jpg" />
                    </div>
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
            <SwiperSlide>
            <div className="card add-lines">
            <Link to='/lineas'>
            Añade más paradas
            </Link>
            </div>
            </SwiperSlide>
            </Swiper>
        </div>
        <div className="near-lines">
        <h2>Paradas cercanas</h2>
        <Swiper
          spaceBetween={50}
          slidesOffsetBefore={30}
          slidesPerView={1.4}
        >
			{dataAll.stops.slice(0,6).map(stop => {
				const { stop_id, stop_name, stop_times, stop_times_aggregate, distance} = stop;
                let last_direction_true=false;
                let last_direction_false=false;
				return  (
                  <SwiperSlide>
                    <div className="card">
                    <div className="like-button-wrapper">
                    <button className={(prefs.split(",").indexOf(stop_id)>0) ? "remove" : "add" } data-stop={stop_id} onClick={handleClick}><span data-stop={stop_id}></span></button>
                    </div>
					<Link to={{ pathname: `/parada/${stop_id}`}}>
                    <div className="swipe-image-wrapper">
					<h3>{stop_name}</h3>
					<p className="distance">{distanceString(distance)}</p>
                    <img src="https://upload.wikimedia.org/wikipedia/commons/3/39/Abando_metro_station.jpg" />
                    </div>
                    <div className="info">
					{stop_times.map(stop_time => {
						const { arrival_time, trip } = stop_time;
						const arrival_time_date=stringTimeToDate(arrival_time);
						const minuteDiff = getMinuteDiff(arrival_time_date, now.current);
						return  (
							<p className={trip.direction_id ? "icon-wrapper departure" : "icon-wrapper arrival"}>{minuteDiff} · {trip.trip_headsign} </p>
						)}
					)}
                    </div>
					</Link>
                    </div>
					</SwiperSlide>
				)}
			)}
            </Swiper>
        </div>
        </div>

    )
};

export default Home;

