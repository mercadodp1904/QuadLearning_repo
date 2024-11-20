import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from 'react-router-dom';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import AdminHomeScreen from './AdminScreens/AdminHomeScreen';
import AdminViewAllUsersScreen from './AdminScreens/AdminViewAllUsersScreen';
import Strands from './AdminScreens/strands';
import StudentHomeScreen from './StudentScreens/StudentHomeScreen';
import TeacherHomeScreen from './TeacherScreens/TeacherHomeScreen';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<App />}>
      <Route index={true} path='/' element={<HomeScreen />} />
      <Route path='/login' element={<LoginScreen />} />
      <Route path='/admin' element={<AdminHomeScreen />} />
      <Route path='/admin/Strands' element={<Strands />} />
      <Route path='/login/AdminScreens/AdminHomeScreen' element={<AdminHomeScreen />} />
      <Route path='/admin/AdminViewAllUsersScreen' element={<AdminViewAllUsersScreen />} />
      <Route path='/login/StudentScreens/StudentHomeScreen' element={<StudentHomeScreen />} />
      <Route path='/login/TeacherScreens/TeacherHomeScreen' element={<TeacherHomeScreen />} />
    </Route>
  )
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);