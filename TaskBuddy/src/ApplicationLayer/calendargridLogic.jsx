import moment from 'moment';

/**
 * Validates the start and end timestamps.
 * @param {moment} start 
 * @param {moment} end 
 */
const validateTimestamps = (start, end) => {
  if (!start.isValid() || !end.isValid() || end.isBefore(start)) {
    throw new Error('Invalid timestamps');
  }
};

/**
 * Calculates the proportion and direction of the task within a given hour.
 * @param {moment} start 
 * @param {moment} end 
 * @param {moment} hourStart 
 * @param {moment} hourEnd 
 * @returns {Object} { proportion, direction }
 */
const calculateProportionAndDirection = (start, end, hourStart, hourEnd) => {
  let proportion = 0;
  let direction = '';

  if (start.isSameOrBefore(hourStart) && end.isSameOrAfter(hourEnd)) {
    proportion = 1;
    direction = 'full';
  } else if (start.isSameOrAfter(hourStart) && end.isSameOrBefore(hourEnd)) {
    const minutes = end.diff(start, 'minutes');
    proportion = minutes / 60;
    direction = 'middle';
  } else if (start.isBetween(hourStart, hourEnd, null, '[)')) {
    const minutes = hourEnd.diff(start, 'minutes');
    proportion = minutes / 60;
    direction = 'end';
  } else if (end.isBetween(hourStart, hourEnd, null, '(]')) {
    const minutes = end.diff(hourStart, 'minutes');
    proportion = minutes / 60;
    direction = 'start';
  }
  return { proportion, direction };
};

/**
 * Classifies the calculated proportion into one of the four quarters of an hour.
 * @param {number} proportion 
 * @returns {number} classified proportion
 */
const classifyProportion = (proportion) => {
  if (proportion > 0 && proportion <= 0.25) {
    return 0.25;
  } else if (proportion > 0.25 && proportion <= 0.5) {
    return 0.5;
  } else if (proportion > 0.5 && proportion <= 0.75) {
    return 0.75;
  } else if (proportion > 0.75 && proportion <= 1) {
    return 1;
  }
  return 0;
};

/**
 * Calculates hourly proportions and directions of a task on a day which is used to render the task on the hour grid
 * @param {string} startTimestamp 
 * @param {string} endTimestamp 
 * @param {string} taskID 
 * @returns {Object} { taskID, proportions, directions }
 */
export const calculateHourlyProportions = async (startTimestamp, endTimestamp, taskID) => {
  const start = moment(startTimestamp);
  const end = moment(endTimestamp);

  validateTimestamps(start, end);

  const proportions = {};
  const directions = {}; 

  let currentHour = start.clone().startOf('hour');
  const endHour = end.clone().startOf('hour');

  while (currentHour <= endHour) {
    const hourStart = currentHour.clone();
    const hourEnd = currentHour.clone().endOf('hour');

    let { proportion, direction } = calculateProportionAndDirection(start, end, hourStart, hourEnd);

    proportion = classifyProportion(proportion);

    proportions[currentHour.format('H')] = proportion;
    directions[currentHour.format('H')] = direction;

    currentHour.add(1, 'hour');
  }
  return { taskID, proportions, directions };
};



/**
 * This method takes proportion, direction and numbers of tasks in that hour as parameter.
 * It returns styles to be applied in those boxes depending on direction.
 * Direction can be either starting, ending, or middle.
 * @param {} proportion 
 * @param {*} direction 
 * @param {*} numTasks 
 * @returns 
 */
export const getBoxStyle = (proportion, direction, numTasks) => {
  const boxHeight = 49 * proportion; 
  const boxWidth = `${100 / numTasks}%`; 

  let marginTop = 0;
  let marginBottom = 0;
  let marginVertical = 0;
  let returnStyle = { width: boxWidth }; 

  if (direction === 'end') {
    marginTop = 50 * (1 - proportion);
    returnStyle = { ...returnStyle, height: boxHeight, marginTop: marginTop };
  } else if (direction === 'middle') {
    marginVertical = (50 - boxHeight) / 2; 
    returnStyle = { ...returnStyle, height: boxHeight, marginVertical: marginVertical };
  } else if (direction === 'start') {
    marginBottom = 50 * (1 - proportion); 
    returnStyle = { ...returnStyle, height: boxHeight, marginBottom: marginBottom };
  }

  return returnStyle;
};
