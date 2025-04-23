import React from 'react';
import { Outlet } from 'react-router-dom';

const PublicLayout = () => {
    return (
        <div>
           <p>Public Layout</p>  
           <Outlet />
        </div>
    );
}

export default PublicLayout;
