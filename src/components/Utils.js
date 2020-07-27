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


