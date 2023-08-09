'use client'
import React, { useState } from 'react';
import Navbar from './Navbar';
import SideNav from './SideNav';
import DashContent from './DashContent';

export const metadata = {
    title: 'DevSupport || Dashboard'
}

const Dashboard = ({ opentTickets, inprogressTickets, completedTickets}) => {
  return (
    <main>
        
        <Navbar />
        <div className="w-full flex items-center">
            <div className=' md:w-[20%] mf:flex'>
                <SideNav />
            </div>
            <div className="s">
                {/* <DashContent 
                    opentTickets={opentTickets}
                    inprogressTickets={inprogressTickets}
                    completedTickets={completedTickets}
                /> */}
            </div>
        </div>
    </main>
  )
}

export default Dashboard;