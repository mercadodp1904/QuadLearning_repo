import { useState } from 'react';
import AdminSidebar from '../AdminComponents/AdminSidebar';
import './AdminHomeScreen.css';
import AdminCardsCharts from '../AdminComponents/AdminCardsCharts';

const AdminHomeScreen = () => {
    return (  
        <div className='d-flex'>
        <AdminSidebar />
        <AdminCardsCharts />
        </div>
    );
};

export default AdminHomeScreen;