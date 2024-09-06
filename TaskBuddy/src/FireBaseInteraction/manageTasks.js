import '../../firebaseConfig';
import { doc, addDoc, collection, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import  { updateUserTaskProfile }  from './userProfile';  
import  { updateProjectNewTask }  from './projectInteractions';
import * as SecureStore from 'expo-secure-store';
import moment from 'moment-timezone';

/**
 * This method creates new task.
 * @param {} payload 
 * @param {*} callback 
 */
export const createNewTask = async (payload,callback) => {

    const uid = await SecureStore.getItemAsync('userID');
    if (!uid) throw new Error("No user ID found in SecureStore");

    try{
        const collRef = collection(db, "tasks");
        const docRef = await addDoc(collRef, payload);
        const subPayload = {
            "task": {
                "taskID": docRef.id,
                "startDatetime": payload.startDatetime,
                "endDatetime": payload.endDatetime,
            }
        }

        await updateUserTaskProfile(subPayload);
        await updateProjectNewTask(payload.selectedProject, docRef.id, (res) => {
            if(res) {
                console.log("Task added to project");
            } else {
                console.log("Error adding task to project");
            }
        });

        callback(true);
    } catch (e) {
        console.error("Error adding document: ", e);
        callback(false);
    }

};

/**
 * This method fetches taskdetails and returns JSON
 * @param {*} taskID 
 * @returns 
 */
export const fetchExisitngPayload = async (taskID) => {
    const taskRef = doc(db, "tasks", taskID);
    const taskSnap = await getDoc(taskRef);

    if (!taskSnap.exists()) {
            throw new Error("Task does not exist");
    }

    const taskData = taskSnap.data() ;

    const existingPayload = {
      taskName: taskData.taskName,
      startDatetime: taskData.startDatetime,
      repStartDateTime: taskData.repStartDateTime,
      endDateTime : taskData.endDatetime,
      repEndDateTime : taskData.repEndDateTime,
      selectedProject: taskData.selectedProject,
    }

    return existingPayload
};


/**
 * This method updates a task and adds expense .
 * @param {*} payload 
 * @param {*} taskID 
 * @param {*} newExpense 
 * @param {*} callback 
 */
export const updateTask = async (payload, taskID, newExpense, callback) => {

    const uid = await SecureStore.getItemAsync('userID');
    if (!uid) throw new Error("No user ID found in SecureStore");

    try {
        const taskRef = doc(db, "tasks", taskID);
        const taskSnap = await getDoc(taskRef);

        if (!taskSnap.exists()) {
            throw new Error("Task does not exist");
        }

        const taskData = taskSnap.data();

        const updatedData = { ...payload };
        
        if (Array.isArray(taskData.expense)) {
            updatedData.expense = [...taskData.expense, newExpense];
        } else {
            updatedData.expense = [newExpense];
        }

        await setDoc(taskRef, updatedData, { merge: true });
        callback(true);
    } catch (e) {
        console.error("Error updating document: ", e);
        callback(false);
    }
};

/**
 * This method fetches task details
 * @param {*} taskIDList 
 * @returns 
 */
export const fetchTaskDetails = async (taskIDList) => {

    try{

        const taskCollection = collection(db, "tasks");
        const Promises = taskIDList.map(async (task) => {
            const taskRef = await getDoc(doc(taskCollection, task.taskID));

            let taskProject;

            if(taskRef.exists())
            {
              taskProject = taskRef.data().selectedProject;
            } 

            const projectDocRef = doc(db, "projects", taskProject);
            const projectDocSnap = await getDoc(projectDocRef);
            
            const projectData =  projectDocSnap.data();
            return {...taskRef.data(), taskID: task.taskID, taskColor: projectData.color};
        });

        const returnArray = await Promise.all(Promises);
 

        return(returnArray);
    } catch (error) {
        console.error("Error fetching task details:", error);
        return null ;
    }

};

/**
 * This method fetches tasks for a date and returns array
 * @param {*} selectedDate 
 * @returns 
 */
export const fetchTasks = async (selectedDate) => {

    const uid = await SecureStore.getItemAsync('userID');
    if (!uid) throw new Error("No user ID found in SecureStore");
    try {
        const userDocRef = doc(db, "users", uid);
        const userDocSnap = await getDoc(userDocRef);

        const tasks = userDocSnap.data().tasks;

        const tasksForDate = tasks.filter(task => {
            const startDate = moment(task.startDatetime).format('YYYY-MM-DD');
            const endDate = moment(task.endDatetime).format('YYYY-MM-DD');
            const selectedDateMoment = moment(selectedDate);
            const isBetween = selectedDateMoment.isBetween(startDate, endDate, null, '[]');
            return isBetween;
        });

        if (tasksForDate.length === 0) {
            console.log("No tasks found for the selected date:", selectedDate);
        }

        const returnArray = await fetchTaskDetails(tasksForDate);
        return returnArray;

    } catch (error) {
            console.error("Error fetching tasks:", error);
            return null ;
        }

};

/**
 * This method calculates and returns hours a task is active on a date
 * @param {*} startTimestamp 
 * @param {*} endTimestamp 
 * @param {*} givenDate 
 * @returns 
 */
const getTaskRunningTimestampsAndHours = (startTimestamp, endTimestamp, givenDate) => {
    const startDate = new Date(startTimestamp);
    const endDate = new Date(endTimestamp);
    const taskDate = new Date(givenDate);
    const startOfDay = new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate(), 0, 0, 0, 0);
    const endOfDay = new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate(), 23, 59, 59, 999);

    let startTime, endTime, hours = 0;

    if (startDate.toDateString() === taskDate.toDateString() && endDate.toDateString() === taskDate.toDateString()) {
        startTime = startDate;
        endTime = endDate;
    } else if (startDate.toDateString() === taskDate.toDateString()) {
        startTime = startDate;
        endTime = endDate > endOfDay ? endOfDay : endDate;
    } else if (endDate.toDateString() === taskDate.toDateString()) {
        startTime = startOfDay;
        endTime = endDate;
    } else if (taskDate > startDate && taskDate < endDate) {
        startTime = startOfDay;
        endTime = endOfDay;
    } else {
        return { startTime: null, endTime: null, hours: 0 };
    }

    hours = (endTime - startTime) / (1000 * 60 * 60); 
    return { startTime: startTime.toISOString(), endTime: endTime.toISOString(), hours };
};

/**
 * This method returns hours occupied by a task in a day
 * @param {*} startDatetime 
 * @param {*} endDatetime 
 * @param {*} selectedDate 
 * @returns 
 */
export const getTaskHoursForDay = async (startDatetime, endDatetime, selectedDate) => {
    const runningHours = getTaskRunningTimestampsAndHours(startDatetime,endDatetime,selectedDate);
    return(runningHours);
};


