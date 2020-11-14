import React, { useState } from 'react';
import { Link } from 'react-router-dom'
import Skeleton from 'react-loading-skeleton';
import { es } from "date-fns/locale";
import { MuiPickersUtilsProvider, DatePicker, TimePicker } from "@material-ui/pickers";
import DateFnsUtils from '@date-io/date-fns';
import Select from 'react-select';


export const Buscador = (props) => {
	const { loading, error, data, selectedFromId, selectedDateProps } = props;
    const [selectedDate, handleDateChange] = useState(selectedDateProps ? selectedDateProps : new Date());
    const [selectedFromStop, setSelectedFromStop] = useState(selectedFromId);
 
    const handleFromChange = e => {
        setSelectedFromStop(e.value);
    }

    if (loading) return (
        <div className="search">
        <div className="card">
        <div className="info">
            <div className="search-from">
                <label>Desde</label>
                <Skeleton height={40} />
            </div>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <div className="flex">
                <DatePicker
                    value={selectedDate} 
                    format="dd/MM/yyyy"
                    label="Día salida"
                    onChange={handleDateChange} />
                <TimePicker
                    clearable
                    ampm={false}
                    label="Hora salida"
                    value={selectedDate}
                    onChange={handleDateChange}
                />
                </div>
            </MuiPickersUtilsProvider>
            <Link className="search-button" to={{ pathname: '/busqueda', state: { fromId: selectedFromStop,  date: selectedDate}}}>
            Buscar
            </Link>
        </div>
        </div>
        </div>

    )
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
        <div className="card">
        <div className="info">
            <div className="search-from">
                <label>Desde</label>
                <Select options={selectStops} 
                        className="search-select"
                        placeholder="Selecciona una parada"
                        value={selectStops.find(obj => obj.value === selectedFromStop)}
                        onChange={handleFromChange} />
            </div>
            <MuiPickersUtilsProvider locale={es} utils={DateFnsUtils}>
                <div className="flex">
                <DatePicker
                    value={selectedDate} 
                    format="dd/MM/yyyy"
                    label="Día salida"
                    onChange={handleDateChange} />
                <TimePicker
                    clearable
                    ampm={false}
                    label="Hora salida"
                    value={selectedDate}
                    onChange={handleDateChange}
                />
                </div>
            </MuiPickersUtilsProvider>
            <Link className="search-button" to={{ pathname: '/busqueda', state: { fromId: selectedFromStop,  date: selectedDate}}}>
            Buscar
            </Link>
        </div>
        </div>
        </div>
    ) 
};

