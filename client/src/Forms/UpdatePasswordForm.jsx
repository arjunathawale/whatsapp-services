import React, { useState, useRef, useEffect } from 'react';
import { FaEye, FaEyeSlash, FaWindowClose } from "react-icons/fa";
import { createAPI, getAPI, updateAPI } from '../constants/constants';
import { toast } from "react-toastify"
import { useSelector } from 'react-redux';



const UpdatePasswordForm = ({ drawerCondition }) => {
  const { _id } = useSelector(state => state.user.userData)

  const [loadingSpin, setLoadingSpin] = useState(false);

  const [oldPassword, setOldPassword] = useState('');
  const [oldVisible, setOldVisible] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [newVisible, setNewVisible] = useState(false);

  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmVisible, setConfirmVisible] = useState(false);

  const [allRequirdFilled, setAllRequirdFilled] = useState(false);


  const drawerRef = useRef(null);
  const toggleDrawer = () => {
    drawerCondition.setIsDrawerOpen(false);
  };

  const handleClickOutside = (event) => {
    if (drawerRef.current && !drawerRef.current.contains(event.target)) {
      drawerCondition.setIsDrawerOpen(false);
    }
  };


  const handleSubmit = async (event) => {
    event.preventDefault();
    setAllRequirdFilled(true);
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.info("All Fields are required!")
    } else {
      setLoadingSpin(true);
      const res = await createAPI('/client/updatePassword', {
        id: _id,
        oldPassword,
        newPassword,
        confirmPassword
      })
      if (res.status) {
        toast.success(res.message)
        setLoadingSpin(false);
        drawerCondition.setIsDrawerOpen(false);
      } else {
        toast.error(res.message)
        setLoadingSpin(false);
      }
    }
  }

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  const handleToggle = () => {
    setIsChecked(!isChecked);
  };

  return (
    <div ref={drawerRef} className={`fixed inset-y-0 right-0 z-10 w-80 bg-white border-l border-gray-300 shadow-lg ${drawerCondition.isDrawerOpen ? 'block' : 'hidden'}`}>
      <div className="flex justify-between p-4">
        <h4 className="text-black text-xl font-regular">Change Password</h4>
        <button onClick={toggleDrawer} className="text-black hover:text-red-500 hover:scale-110 duration-200 text-2xl">
          <FaWindowClose />
        </button>
      </div>
      <div className="px-4">
        <div className=" overflow-y-auto max-h-[85vh]">

          <label for="input-label" className="block text-xs mb-1">Old Password</label>
          <input type={oldVisible ? "text" : "password"} id="input-label" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} className={`py-2 px-4 block w-full relative  rounded-lg text-m border border-gray-400 mb-1 outline-none ${(allRequirdFilled && oldPassword.length === 0) && 'border-red-500'}`} placeholder="Old Password" />
          {
            oldVisible ?
              <FaEye className='absolute top-[92px] right-8' onClick={() => setOldVisible(!oldVisible)} /> : <FaEyeSlash className='absolute top-[90px] right-8' onClick={() => setOldVisible(!oldVisible)} />
          }

          {/* {
            (allRequirdFilled && oldPassword.length === 0) && <label for="input-label" className="block text-xs mb-1 ml-1 text-red-500">Old Password is Required</label>
          } */}



          <label for="input-label" className="block text-xs mb-1">New Password</label>
          <input type={newVisible ? "text" : "password"} id="input-label" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={`py-2 px-4 block w-full relative  rounded-lg text-m border border-gray-400 mb-1 outline-none ${(allRequirdFilled && newPassword.length === 0) && 'border-red-500'}`} placeholder="New Password" />
          {
            newVisible ?
              <FaEye className='absolute top-[158px] right-8' onClick={() => setNewVisible(!newVisible)} /> : <FaEyeSlash className='absolute top-[158px] right-8' onClick={() => setNewVisible(!newVisible)} />
          }

          {/* {
            (allRequirdFilled && newPassword.length === 0) && <label for="input-label" className="block text-xs mb-1 ml-1 text-red-500">New Password is Required</label>
          } */}

          <label for="input-label" className="block text-xs mb-1">Confirm Password</label>
          <input type={confirmVisible ? "text" : "password"} id="input-label" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={`py-2 px-4 block w-full relative  rounded-lg text-m border border-gray-400 mb-1 outline-none ${(allRequirdFilled && confirmPassword.length === 0) && 'border-red-500'}`} placeholder="Confirm Password" />
          {
            confirmVisible ?
              <FaEye className='absolute top-[222px] right-8' onClick={() => setConfirmVisible(!confirmVisible)} /> : <FaEyeSlash className='absolute top-[222px] right-8' onClick={() => setConfirmVisible(!confirmVisible)} />
          }

          {
            ((newPassword !== confirmPassword) && confirmPassword.length > 0) && <label for="input-label" className="block text-xs mb-1 ml-1 text-red-500">Password does not match</label>
          }
          {/* {
            (allRequirdFilled && confirmPassword.length === 0) && 
          } */}



          <div className="flex justify-end gap-2 fixed inset-x-2 bottom-2">
            <button type="button" className="py-2  px-4 inline-flex items-center gap-x-2 text-sm  rounded-lg border border-transparent bg-gray-400 text-white hover:bg-red-500 disabled:opacity-50 disabled:pointer-events-none dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600" onClick={toggleDrawer}>
              Close
            </button>
            <button type="button" className="py-2  px-4 inline-flex items-center gap-x-2 text-sm  rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600" onClick={handleSubmit}>
              {
                loadingSpin && <span className="animate-spin inline-block size-4 border-[2px] border-current border-t-transparent text-white rounded-full" role="status" aria-label="loading"></span>
              }
              Change
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UpdatePasswordForm
