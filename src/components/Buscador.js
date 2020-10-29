import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'
import { Spinner } from './Spinner.js';
import Skeleton from 'react-loading-skeleton';
import { Swiper, SwiperSlide } from 'swiper/react';
import { MuiPickersUtilsProvider, TimePicker } from "@material-ui/pickers";
import DateFnsUtils from '@date-io/date-fns';
import Select from 'react-select';


export const Buscador = (props) => {
	const { loading, error, data, selectedFromId, selectedToId, selectedDateProps } = props;
    const [selectedDate, handleDateChange] = useState(selectedDateProps ? selectedDateProps : new Date());
    const [selectedFromStop, setSelectedFromStop] = useState(selectedFromId);
    const [selectedToStop, setSelectedToStop] = useState(selectedToId);
 
    const handleToChange = e => {
        setSelectedToStop(e.value);
    }
    const handleFromChange = e => {
        setSelectedFromStop(e.value);
    }
    console.log("aaaa"+selectedDate)
    console.log("aaaa"+selectedDateProps)

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
            <Select options={selectStops} 
                    value={selectStops.find(obj => obj.value === selectedFromStop)}
                    onChange={handleFromChange} />
            <label>Hasta</label>
            <Select options={selectStops} 
                    value={selectStops.find(obj => obj.value === selectedToStop)}
                    onChange={handleToChange} />
            <Link to={{ pathname: '/busqueda', state: { fromId: selectedFromStop, toId: selectedToStop, date: selectedDate}}}>
            <h3>Buscar</h3>
            </Link>
        </div>
    ) 
};

