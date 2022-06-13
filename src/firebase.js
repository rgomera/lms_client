import firebase from 'firebase';

const firebaseConfig = {
   apiKey: 'AIzaSyBHOc-0XHCyD2LZSJkPmXu4XK9VhP-toTk',
   authDomain: 'lms-project-58b97.firebaseapp.com',
   projectId: 'lms-project-58b97',
   storageBucket: 'lms-project-58b97.appspot.com',
   messagingSenderId: '960423593082',
   appId: '1:960423593082:web:a2d2275bc53d80a1fe67c3',
   measurementId: 'G-8EJ2M7T4L6',
};

const firebaseApp = firebase.initializeApp(firebaseConfig);

const db = firebaseApp.firestore();
const storage = firebaseApp.storage();

export { db, storage };
