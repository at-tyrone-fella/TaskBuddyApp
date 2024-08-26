import '../../firebaseConfig';
import { doc, addDoc, collection, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import  { updateUserTaskProfile }  from './userProfile';  
import  { updateProjectNewTask }  from './projectInteractions';
import * as SecureStore from 'expo-secure-store';
import moment from 'moment-timezone';

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
        console.log("psp",payload.selectedProject,'tid',docRef.id)
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


export const fetchTaskDetails = async (taskIDList) => {

    try{

        const taskCollection = collection(db, "tasks");

        const promises = taskIDList.map(async (task) => {
            const taskRef = await getDoc(doc(taskCollection, task.taskID));
            const taskProject = taskRef.data().selectedProject;

            const projectDocRef = doc(db, "projects", taskProject);
            const projectDocSnap = await getDoc(projectDocRef);

            
            const projectData =  projectDocSnap.data();
            
            return {...taskRef.data(), taskID: task.taskID, color: projectData.color };
        });

        return(await Promise.all(promises));
    } catch (error) {
        console.error("Error fetching task details:", error);
        return null ;
    }

};


export const fetchTasks = async (selectedDate) => {

    const uid = await SecureStore.getItemAsync('userID');
    if (!uid) throw new Error("No user ID found in SecureStore");
    try {
        console.log("Starting task retrieval process...");

        const userDocRef = doc(db, "users", uid);
        const userDocSnap = await getDoc(userDocRef);

        const tasks = userDocSnap.data().tasks;
        console.log("tasksf",tasks)
        const tasksForDate = tasks.filter(task => {
            const startDate = moment(task.startDatetime).format('YYYY-MM-DD');
            const endDate = moment(task.endDatetime).format('YYYY-MM-DD');
            const selectedDateMoment = moment(selectedDate);

            const isBetween = selectedDateMoment.isBetween(startDate, endDate, null, '[]');
            console.log(`Task: ${JSON.stringify(task)}, Start Date: ${startDate}, End Date: ${endDate}, Selected Date: ${selectedDate}, isBetween: ${isBetween}`);

            return isBetween;
        });

        if (tasksForDate.length === 0) {
            console.log("No tasks found for the selected date:", selectedDate);
        }

        return await fetchTaskDetails(tasksForDate);

    } catch (error) {
            console.error("Error fetching tasks:", error);
            return null ;
        }

};

export const getTaskHoursForDay = async (startDatetime, endDatetime, selectedDate) => {

    const startMoment = moment(startDatetime);
    const endMoment = moment(endDatetime);
    const selectedMoment = moment(selectedDate).startOf('day');
    
    const startOfDay = selectedMoment.startOf('day');
    const endOfDay = selectedMoment.endOf('day');

    const taskStart = moment.max(startMoment, startOfDay);
    const taskEnd = moment.min(endMoment, endOfDay);

    let hours = 0;
    if (taskStart.isBefore(taskEnd)) {
        hours = taskEnd.diff(taskStart, 'hours', true); 
    }

    return {
        taskStart: taskStart.format('YYYY-MM-DD HH:mm:ss'),
        taskEnd: taskEnd.format('YYYY-MM-DD HH:mm:ss'),
        hoursWorked: hours.toFixed(2) 
    };
};


