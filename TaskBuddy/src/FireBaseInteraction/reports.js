import '../../firebaseConfig';
import { doc, collection, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import * as SecureStore from 'expo-secure-store';
import moment from 'moment-timezone';

/**
 * Fetch report data based on project ID, date range, and format.
 */
export const fetchReportData = async (projectId, startDate, endDate) => {

  const uid = await SecureStore.getItemAsync('userID');
  if (!uid) throw new Error("No user ID found in SecureStore");

  let projectExists = false;

    const userDocRef = doc(db, "users", uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      projectExists = userData.projects.includes(projectId);

      if (projectExists) {

      const taskCollection = collection(db, "tasks");
      const tasksQuery = query(taskCollection, where("selectedProject", "==", projectId));
      const querySnapshot = await getDocs(tasksQuery);

      if (querySnapshot.empty) {
        console.log("No tasks found for this project");
        return [];
      }

      const taskList = querySnapshot.docs.map(doc => doc.data());

      const filteredTasks = taskList.filter(task => {
        const taskStart = moment(task.startDatetime);
        return taskStart.isBetween(startDate, endDate, null, '[]');
      });

      return filteredTasks;

  }  else {

    return [];

  }
}
};

/**
 * Parse task data to include duration and expense details.
 */
export const parseTaskData = async (taskData) => {
  return taskData.map(task => {
    const taskDuration = moment(task.endDatetime).diff(moment(task.startDatetime), 'minutes');

    const hours = Math.floor(taskDuration / 60);
    const minutes = taskDuration % 60;

    return {
      taskName: task.taskName,
      taskStartHour: task.startDatetime,
      taskEnd: task.endDatetime,
      taskDuration: `${hours}h ${minutes}m`,
      taskExpense: task.expenseAmount || "N/A",
    };
  });
};
