import React, { useState } from 'react';
import { Link } from 'react-router-dom'
import Skeleton from 'react-loading-skeleton';
import { es } from "date-fns/locale";
import { MuiPickersUtilsProvider, DatePicker, TimePicker } from "@material-ui/pickers";
import DateFnsUtils from '@date-io/date-fns';
import Select from 'react-select';
import { createMuiTheme } from "@material-ui/core";
import { ThemeProvider } from "@material-ui/styles";
import lime from "@material-ui/core/colors/lime";


const defaultMaterialTheme = createMuiTheme({
      datePicker: {
        selectColor: "#f1592a",
      },
   palette: {
        primary: {
            50: "#faeae8",
            100: "#fdcdbf",
            200: "#fdae96",
            300: "#fc8e6c",
            400: "#fc754c",
            500: "#fc5e2e",
            600: "#f1582a",
            700: "#e35225",
            800: "#d54b22",
            900: "#bb3f1b",
        },
   }
});


export const Buscador = (props) => {
	const { loading, error, data, selectedFromId, selectedDateProps } = props;
    const [selectedDate, handleDateChange] = useState(selectedDateProps ? selectedDateProps : new Date());
    const [selectedFromStop, setSelectedFromStop] = useState(selectedFromId);
    console.log(lime);
    console.log(defaultMaterialTheme.primary);
 
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
            <ThemeProvider theme={defaultMaterialTheme}>
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
            </ThemeProvider>
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
                        theme={theme => ({
                          ...theme,
                          colors: {
                            ...theme.colors,
                            primary25: "#faeae8",
                            primary50: "#fdcdbf",
                            primary75: "#fdae96",
                            primary: "#f1582a",
                          },
                        })}
                        value={selectStops.find(obj => obj.value === selectedFromStop)}
                        onChange={handleFromChange} />
            </div>
            <ThemeProvider theme={defaultMaterialTheme}>
            <MuiPickersUtilsProvider locale={es} utils={DateFnsUtils}>
                <div className="flex">
                <DatePicker
                    value={selectedDate} 
                    format="dd/MM/yyyy"
                    label="Día salida"
                    okLabel="Aceptar"
                    cancelLabel="Cancelar"
                    onChange={handleDateChange} />
                <TimePicker
                    ampm={false}
                    label="Hora salida"
                    okLabel="Aceptar"
                    cancelLabel="Cancelar"
                    value={selectedDate}
                    onChange={handleDateChange}
                />
                </div>
            </MuiPickersUtilsProvider>
            </ThemeProvider>
        </div>
            <Link className="search-button" to={{ pathname:  `/busqueda/${selectedFromStop}`, state: { date: selectedDate}}}>
            Buscar
            </Link>
        </div>
        </div>
    ) 
};

