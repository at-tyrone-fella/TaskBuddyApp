export const roundToNearestQuarter = async (datetimeString) => {
  const date = new Date(datetimeString);

  const minutes = date.getMinutes();

  let roundedMinutes;

  if (minutes < 15) {
    roundedMinutes = 0;
  } else if (minutes < 30) {
    roundedMinutes = 15;
  } else if (minutes < 45) {
    roundedMinutes = 30;
  } else {
    roundedMinutes = 45;
  }

  const roundedDate = new Date(date);
  roundedDate.setMinutes(roundedMinutes);
  roundedDate.setSeconds(0); 

  if (roundedMinutes === 0 && minutes >= 45) {
    roundedDate.setHours(roundedDate.getHours() + 1);
  }



  return convertToUTCZ(roundedDate);
}


export const convertToUTCZ = (dateTimeStr) => {
  const localDate = new Date(dateTimeStr);
  
  const utcDate = new Date(localDate.getTime() - (localDate.getTimezoneOffset() * 60000) - (60 * 60 * 1000));
  
  return utcDate.toISOString();
}