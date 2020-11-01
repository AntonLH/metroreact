import { useEffect, useState, useRef } from 'react';

export const stringTimeToDate = (time) => {
	let d = new Date();
	let [hours,minutes,seconds] = time.split(':');
	d.setHours(+hours);
	d.setMinutes(minutes);
	d.setSeconds(seconds);
	return d;
}

export const getMinuteDiff = (time1, time2) => {
	const minuteDiff=Math.trunc((time1-time2)/(60*1000));
	if(minuteDiff==0){
		return "ahora";
	}
	else if(minuteDiff<0){
		return minuteDiff==-1 ? "hace "+Math.abs(minuteDiff)+" minuto" : "hace "+Math.abs(minuteDiff)+" minutos"	
	}
	else{
		return minuteDiff==1 ? minuteDiff+" min" : minuteDiff+" mins"
	}
}

export const calculateDistance = (lat1, lon1, lat2, lon2) => {
    var R = 3958.7558657440545;
    var dLat = (lat2-lat1) * Math.PI/180;
    var dLon = (lon2-lon1) * Math.PI/180; 
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2); 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c;
    return d;
}

export const distanceString = (distance) => {
    console.log(distance.toFixed(3));
    if(distance<1){
        return (distance.toFixed(3))*1000+" m";
    }
    else{
        return (distance.toFixed(2))+" km";
    }
}

export const useStateWithLocalStorage = localStorageKey => {
  const [value, setValue] = useState(
    localStorage.getItem(localStorageKey) || ''
  );
  useEffect(() => {
    localStorage.setItem(localStorageKey, value);
  }, [value]);
  return [value, setValue];
};
 
export const getServiceId = date => {
    switch (date.current.getDay()) {
        case 0: return "invd_20.pex";
        case 5: return "invv_20.pex";
        case 6: return "invs_20.pex";
        default: return "invv_20.pex";
    }
};
