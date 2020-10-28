import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'
import { Spinner } from './Spinner.js';
import Skeleton from 'react-loading-skeleton';
import { Swiper, SwiperSlide } from 'swiper/react';
import { MuiPickersUtilsProvider, TimePicker } from "@material-ui/pickers";
import DateFnsUtils from '@date-io/date-fns';
import Select from 'react-select';


export const Buscador = (props) => {
    const [selectedDate, handleDateChange] = useState(new Date());
	const { loading, error, data } = props;

    if (loading) return <Skeleton />
    if (error) return <div>Error ${error}  </div>

    let selectStops=
        data.stops.map((stop) => {
          return {
            label: stop.stop_name,
            value: stop.stop_id
          }
        })   
    return (
        <div className="search">
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <TimePicker
                    clearable
                    ampm={false}
                    label="Hora salida"
                    value={selectedDate}
                    onChange={handleDateChange}
                />
            </MuiPickersUtilsProvider>
            <label>Desde</label>
            <Select options={selectStops} />
            <label>Hasta</label>
            <Select options={selectStops} />
        </div>
    ) 
};

