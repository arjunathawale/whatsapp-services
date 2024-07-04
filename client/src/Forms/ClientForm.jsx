import React, { useState, useRef, useEffect } from 'react';
import { FaWindowClose } from "react-icons/fa";
import { createAPI, getAPI, updateAPI } from '../constants/constants';
import { toast } from "react-toastify"
const ClientForm = ({ drawerCondition, btnName, data }) => {
  function isEmptyObject(obj) {
    return Object.entries(obj).length === 0;
  }

  const [createOrUpdate, setCreateOrUpdate] = useState(isEmptyObject(data));

  const routeUrl = createOrUpdate ? `/client/create` : '/client/update';
  const [loadingSpin, setLoadingSpin] = useState(false);
  const [name, setName] = useState(data?.clientname ? data?.clientname : '');
  const [email, setEmail] = useState(data?.emailId ? data?.emailId : '');
  const [panNo, setPanNo] = useState(data?.panNo ? data?.panNo : '');
  const [gstNo, setGstNo] = useState(data?.gstNo ? data?.gstNo : '');
  const [address, setAddress] = useState(data?.address ? data?.address : '');
  const [mobileNo, setMobileNo] = useState(data?.mobileNo ? data?.mobileNo : '');
  const [isChecked, setIsChecked] = useState(data?.isActive ? data?.isActive : false);

  // Validations
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
    if (!name || !panNo || !gstNo || !address || !email || !mobileNo) {
      toast.info("All Fields are required!")
    } else {
      setLoadingSpin(true);
      let objectData = {}
      if (createOrUpdate) {
        objectData = {
          clientname: name,
          panNo: panNo,
          gstNo: gstNo,
          address: address,
          emailId: email,
          mobileNo: mobileNo,
          isActive: isChecked
        }

        const res = await createAPI(routeUrl, {
          ...objectData
        })
        if (res.status) {
          toast.success(res.message)
          drawerCondition.setIsDrawerOpen(false);
          setName('');
          setPanNo('');
          setGstNo('');
          setAddress('');
          setEmail('');
          setMobileNo('');
          setIsChecked(false);
          setLoadingSpin(false);
        } else {
          toast.error(res.message)
          setLoadingSpin(false);

        }
      } else {
        objectData = {
          id: data?._id,
          clientname: name,
          panNo: panNo,
          gstNo: gstNo,
          address: address,
          emailId: email,
          mobileNo: mobileNo,
          isActive: isChecked
        }

        const res = await updateAPI(routeUrl, {
          ...objectData
        })
        if (res.status) {
          toast.success(res.message)
          setName('');
          setPanNo('');
          setGstNo('');
          setAddress('');
          setEmail('');
          setMobileNo('');
          setIsChecked(false);
          setLoadingSpin(false);
          data = {}
          drawerCondition.setIsDrawerOpen(false);
        } else {
          toast.error(res.message)
          setLoadingSpin(false);
        }
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
    <div ref={drawerRef} className={`fixed inset-y-0 right-0 z-10 w-96 bg-white border-l border-gray-300 shadow-lg ${drawerCondition.isDrawerOpen ? 'block' : 'hidden'}`}>
      <div className="flex justify-between p-4">
        <h4 className="text-black text-xl font-regular">{createOrUpdate ? 'Add Client' : 'Update Client'}</h4>
        <button onClick={toggleDrawer} className="text-black hover:text-red-500 hover:scale-110 duration-200 text-2xl">
          <FaWindowClose />
        </button>
      </div>
      <div className="px-4">
      <div className=" overflow-y-auto max-h-[85vh]">
        <label for="input-label" className="block text-xs mb-1">Full Name</label>
        <input type="text" id="input-label" value={name} onChange={(e) => setName(e.target.value)} className="py-2 px-4 block w-full  rounded-lg text-sm border border-gray-400 mb-1 outline-none" placeholder="Arjun Athawale" />
        {
          (allRequirdFilled && name.length === 0) && <label for="input-label" className="block text-xs mb-1 ml-1 text-red-500">Full Name is Required</label>
        }


        <label for="input-label" className="block text-xs  mb-1">Email</label>
        <input type="email" id="input-label" value={email} onChange={(e) => setEmail(e.target.value)} className="py-2 px-4 block w-full  rounded-lg text-sm border border-gray-400 mb-1 outline-none" placeholder="you@site.com" />
        {
          (allRequirdFilled && email.length === 0) && <label for="input-label" className="block text-xs mb-1 ml-1 text-red-500">Email is Required</label>
        }

        <label for="input-label" className="block text-xs  mb-1">Pan Number</label>
        <input type="text" id="input-label" value={panNo} maxLength={10} onChange={(e) => setPanNo(e.target.value)} className="py-2 px-4 block w-full uppercase rounded-lg text-sm border border-gray-400 mb-1  outline-none" placeholder="CREPA0189L" />
        {
          (allRequirdFilled && panNo.length === 0) && <label for="input-label" className="block text-xs mb-1 ml-1 text-red-500">PAN No. is Required</label>
        }

        <label for="input-label" className="block text-xs  mb-1">GST No.</label>
        <input type="text" id="input-label" value={gstNo} maxLength={16} onChange={(e) => setGstNo(e.target.value)} className="py-2 px-4 block w-full uppercase rounded-lg text-sm border border-gray-400 mb-1  outline-none" placeholder="CREPA0189L" />
        {
          (allRequirdFilled && gstNo.length === 0) && <label for="input-label" className="block text-xs mb-1 ml-1 text-red-500">GST No. is Required</label>
        }

        <label for="input-label" className="block text-xs  mb-1">Address</label>
        <input type="text" id="input-label" value={address} onChange={(e) => setAddress(e.target.value)} className="py-2 px-4 block w-full  rounded-lg text-sm border border-gray-400 mb-1  outline-none" placeholder="Block Road Sangli" />
        {
          (allRequirdFilled && address.length === 0) && <label for="input-label" className="block text-xs mb-1 ml-1 text-red-500">Address is Required</label>
        }

        <label for="input-label" className="block text-xs  mb-1">Mobile No.</label>
        <input type="text" id="input-label" value={mobileNo} maxLength={12} onChange={(e) => setMobileNo(e.target.value)} className="py-2 px-4 block w-full  rounded-lg text-sm border border-gray-400 mb-1  outline-none" placeholder="CREPA0189L" />
        {
          (allRequirdFilled && mobileNo.length === 0) && <label for="input-label" className="block text-xs mb-1 ml-1 text-red-500">Mobile No. is Required</label>
        }
        <label for="input-label" className="block text-xs  mb-1 mt-2">Status</label>
        <div className='mt-0'>
          <input
            type="checkbox"
            id="toggle"
            checked={isChecked}
            onChange={handleToggle}
            className="hidden"
          />
          <label
            htmlFor="toggle"
            className={`flex items-center cursor-pointer w-12 h-6 rounded-full p-1 transition-colors duration-300 ${isChecked ? 'bg-blue-500' : 'bg-gray-400'
              }`}
          >
            <span
              className={`inline-block w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-300 ${isChecked ? 'translate-x-6' : 'translate-x-0'
                }`}
            />
          </label>
        </div>
        <div className="flex justify-end gap-2 fixed inset-x-2 bottom-2">
          <button type="button" className="py-2  px-4 inline-flex items-center gap-x-2 text-sm  rounded-lg border border-transparent bg-gray-400 text-white hover:bg-red-500 disabled:opacity-50 disabled:pointer-events-none dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600" onClick={toggleDrawer}>
            Close
          </button>
          <button type="button" className="py-2  px-4 inline-flex items-center gap-x-2 text-sm  rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600" onClick={handleSubmit}>

            {
              loadingSpin && <span className="animate-spin inline-block size-4 border-[2px] border-current border-t-transparent text-white rounded-full" role="status" aria-label="loading"></span>
            }
            {createOrUpdate ? "Add Client" : "Update Client"}
          </button>
        </div>
      </div>
      </div>
    </div>
  );
}

export default ClientForm
