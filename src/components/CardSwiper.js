import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'
import { SkeletonSwiper } from './SkeletonSwiper.js';
import { useStateWithLocalStorage, distanceString, calculateDistance, stringTimeToDate, getMinuteDiff } from './Utils.js';
import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/swiper.scss';


export const CardSwiper = (props) => {
    const [position, setPosition] = useState([43.320779, -2.985927]);
	const { loading, error, data, now, title, classname, lastTrips, showDistance, showAddButton, sliceNum } = props;

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
	}, [data]);

    if (loading) return <SkeletonSwiper title={title} classname={classname} lastTrips={lastTrips} showDistance={showDistance} />
    if (error) return <div>Error ${error}  </div>
    const sortedData = JSON.parse(JSON.stringify(data));
    let sortedStops=sortedData.stops;
    if(showDistance){

        for (let stop of sortedStops) {
            stop.distance = calculateDistance(position[0], position[1], stop.stop_lat, stop.stop_lon);
        }
        sortedStops.sort((a, b) => a.distance - b.distance)
        console.log(data.stops)
    }
    if(sliceNum>0){
        sortedStops=sortedStops.slice(0,sliceNum);
    }

	const slidesPerView=window.innerWidth/320;

    return (
        <div>
        <div className={classname}>
        <h2>{title}</h2>
        <Swiper
          spaceBetween={50}
          slidesOffsetBefore={30}
          slidesOffsetAfter={30}
          slidesPerView={slidesPerView}
        >
			{sortedStops.map(stop => {
				const { stop_id, stop_name, stop_times, stop_times_aggregate, image, distance} = stop;
                let last_direction_true=false;
                let last_direction_false=false;
				return  (
                  <SwiperSlide>
                    <div className="card">
                    <div className="like-button-wrapper">
                    <button className={(prefs.split(",").indexOf(stop_id)>0) ? "remove" : "add" } data-stop={stop_id} onClick={handleClick}><span data-stop={stop_id}></span></button>
                    </div>
					<Link to={{ pathname: `/parada/${stop_id}`, state: { backURL: "/"}}}>
                    <div className="swipe-image-wrapper">
					<h3>{stop_name}</h3>
                    { showDistance &&
					<p className="distance">{distanceString(distance)}</p>
                    }
                    <img src={image} />
                    </div>
                    <div className="info">
					{stop_times.map(stop_time => {
						const { arrival_time, trip } = stop_time;
						const arrival_time_date=stringTimeToDate(arrival_time);
						const minuteDiff = getMinuteDiff(arrival_time_date, now.current);
						return  (
							<p className={trip.direction_id ? "icon-wrapper departure" : "icon-wrapper arrival"}>{minuteDiff} · {trip.trip_headsign} {trip.incidents && trip.incidents.length> 0 ? <span className="alert">{"Llega " +trip.incidents[0].minutes+" minutos tarde" }</span> : "" }</p>
						)}
					)}
                    { lastTrips && <>
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
                    </> }
                    </div>
					</Link>
                    </div>
					</SwiperSlide>
				)}
			)}
            { showAddButton && 
            <SwiperSlide>
            <div className="card add-lines">
            <Link to='/paradas'>
            Añade más paradas
            </Link>
            </div>
            </SwiperSlide>
            }
            </Swiper>
        </div>
        </div>

    )
};
