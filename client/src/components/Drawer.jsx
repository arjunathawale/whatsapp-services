import React, { useState, useRef, useEffect } from 'react';
import { FaWindowClose } from "react-icons/fa";
const Drawer = ({ drawerCondition }) => {
    const drawerRef = useRef(null);
    const toggleDrawer = () => {
        drawerCondition.setIsDrawerOpen(false);
    };

    const handleClickOutside = (event) => {
        if (drawerRef.current && !drawerRef.current.contains(event.target)) {
            drawerCondition.setIsDrawerOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div ref={drawerRef} className={`fixed inset-y-0 right-0 z-10 w-96 bg-white border-l border-gray-300 shadow-lg ${drawerCondition.isDrawerOpen ? 'block' : 'hidden'}`}>
            <div className="flex justify-between p-4">
                <h4 className="text-black text-xl font-regular">Add Client</h4>
                <button onClick={toggleDrawer} className="text-black hover:text-gray-500 hover:scale-110 duration-200 text-2xl">
                    <FaWindowClose />
                </button>
            </div>
            <div className="p-4">
                {/* Drawer content goes here */}
                <p>This is the content of the right drawer.</p>
            </div>
        </div>
    );
};

export default Drawer;