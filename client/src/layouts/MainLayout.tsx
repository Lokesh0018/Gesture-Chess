import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { VirtualCursor } from '../components/VirtualCursor';

export const MainLayout = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <VirtualCursor />
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-gray-900 to-gray-800">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
