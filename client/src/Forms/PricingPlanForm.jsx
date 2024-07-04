import React, { useState, useRef, useEffect } from 'react';
import { FaArrowCircleDown, FaArrowDown, FaCheck, FaChevronDown, FaClosedCaptioning, FaCross, FaDoorClosed, FaWindowClose } from "react-icons/fa";
import { FaFolderClosed } from 'react-icons/fa6';
import { MdCancel } from 'react-icons/md';

const PricingPlanForm = ({ drawerCondition, btnName, data }) => {
  function isEmptyObject(obj) {
    return Object.entries(obj).length === 0;
  }
  const [createOrUpdate, setCreateOrUpdate] = useState(isEmptyObject(data));
  const [loadingSpin, setLoadingSpin] = useState(false);
  const [wpMobileNo, setWpMobileNo] = useState(data.mbl ? data?.mbl : '');
  const [wpPhoneNoId, setWphoneNoId] = useState(data.phone ? data?.phone : '');
  const [wpBussinessAccId, setWpBussinessAccId] = useState(data.buss ? data?.buss : '');
  const [wpToken, setWpToken] = useState(data.token ? data?.token : '');
  const [wpApiVersion, setWpApiVersion] = useState(data.api ? data?.api : '');
  const [wpAppId, setWpAppId] = useState(data.app ? data?.app : '');
  const [allRequirdFilled, setAllRequirdFilled] = useState(false);

  const [isOpen, setIsOpen] = useState(false);
  const [isChecked, setIsChecked] = useState(false);


  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const drawerRef = useRef(null);
  const toggleDrawer = () => {
    drawerCondition.setIsDrawerPricingOpen(false);
  };

  const handleClickOutside = (event) => {
    if (drawerRef.current && !drawerRef.current.contains(event.target)) {
      drawerCondition.setIsDrawerPricingOpen(false);
    }
  };


  const handleSubmit = (event) => {
    event.preventDefault();
    setLoadingSpin(true);
    setAllRequirdFilled(true)
    setTimeout(() => {
      setLoadingSpin(false);
      setAllRequirdFilled(false)
    }, 5000);
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

  const dropDownData = [
    {
      "id": 1,
      "name": "v16.0"
    },
    {
      "id": 2,
      "name": "v17.0"
    },
    {
      "id": 3,
      "name": "v18.0"
    },
    {
      "id": 4,
      "name": "v19.0"
    }
  ]

  return (
    <div ref={drawerRef} className={`fixed inset-y-0 right-0 z-10 w-[600px] bg-white border-l border-gray-300 shadow-lg ${drawerCondition.isDrawerPricingOpen ? 'block' : 'hidden'}`}>
      <div className="flex justify-between p-4">
        <h4 className="text-black text-xl font-semibold">{createOrUpdate ? "Add Plan" : "Update Plan"}</h4>
        <button onClick={toggleDrawer} className="text-black hover:text-red-500 hover:scale-110 duration-200 text-2xl">
          <FaWindowClose />
        </button>
      </div>
      <div className="px-4">
        <div className=" overflow-y-auto h-auto">
          <div className="flex justify-between gap-4">
            <div className='w-1/3'>
              <label htmlFor="input-label" className="block text-sm mb-1"><span className='text-sm text-red-500 font-medium'>* </span>Plan Name</label>
              <input type="text" autoComplete='off' value={wpMobileNo} id="input-label" onChange={(e) => setWpMobileNo(e.target.value)} className={`py-2 px-4 block w-full rounded-lg text-sm border  mb-1 outline-none ${allRequirdFilled && wpMobileNo.length == 0 ? "border-red-500" : "border-gray-400"} `} placeholder="Plan Name" />
            </div>
            <div className='w-2/3'>
              <label htmlFor="input-label" className="block text-sm  mb-1"><span className='text-sm text-red-500 font-medium'>* </span>Plan Description</label>
              <input type="text" autoComplete='off' value={wpPhoneNoId} id="input-label" onChange={(e) => setWphoneNoId(e.target.value)} className={`py-2 px-4 block w-full rounded-lg text-sm border  mb-1 outline-none ${allRequirdFilled && wpPhoneNoId.length == 0 ? "border-red-500" : "border-gray-400"} `} placeholder="Plan Description" />
            </div>
          </div>
    
          <div className="flex justify-between gap-4 mt-3">
            <div className='w-1/3'>
              <label htmlFor="input-label" className="block text-sm mb-1"><span className='text-sm text-red-500 font-medium'>* </span>Bulk Limit</label>
              <input type="text" accept='number' autoComplete='off' value={wpMobileNo} id="input-label" onChange={(e) => setWpMobileNo(e.target.value)} className={`py-2 px-4 block w-full rounded-lg text-sm border  mb-1 outline-none ${allRequirdFilled && wpMobileNo.length == 0 ? "border-red-500" : "border-gray-400"} `} placeholder="Bulk Limit" />
            </div>
            <div className='w-1/3'>
              <label htmlFor="input-label" className="block text-sm mb-1"><span className='text-sm text-red-500 font-medium'>* </span>Plan Amount</label>
              <input type="text" autoComplete='off' value={wpMobileNo} id="input-label" onChange={(e) => setWpMobileNo(e.target.value)} className={`py-2 px-4 block w-full rounded-lg text-sm border  mb-1 outline-none ${allRequirdFilled && wpMobileNo.length == 0 ? "border-red-500" : "border-gray-400"} `} placeholder="Plan Amount" />
            </div>
            <div className='w-1/3'>
              <label htmlFor="input-label" className="block text-sm  mb-1"><span className='text-sm text-red-500 font-medium'>* </span>Plan Expire In Days</label>
              <input type="text" autoComplete='off' value={wpPhoneNoId} id="input-label" onChange={(e) => setWphoneNoId(e.target.value)} className={`py-2 px-4 block w-full rounded-lg text-sm border  mb-1 outline-none ${allRequirdFilled && wpPhoneNoId.length == 0 ? "border-red-500" : "border-gray-400"} `} placeholder="Plan Expire In Days" />
            </div>
          </div>

          <div class="flex gap-x-6 justify-between px-2 mt-5">


            <div class="flex">
              <input type="checkbox" class="shrink-0 mt-0.5 border-gray-200 rounded text-blue-600 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none" id="hs-checkbox-group-4" checked="" />
              <label for="hs-checkbox-group-4" class="text-sm text-gray-500 ms-3">Message Send API</label>
            </div>

            <div class="flex">
              <input type="checkbox" class="shrink-0 mt-0.5 border-gray-200 rounded text-blue-600 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none" id="hs-checkbox-group-5" checked="" />
              <label for="hs-checkbox-group-5" class="text-sm text-gray-500 ms-3">Chatbot Automation</label>
            </div>

            <div class="flex">
              <input type="checkbox" class="shrink-0 mt-0.5 border-gray-200 rounded text-blue-600 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none" id="hs-checkbox-group-6" checked="" />
              <label for="hs-checkbox-group-6" class="text-sm text-gray-500 ms-3">Manage Template</label>
            </div>

          </div>


          <label htmlFor="input-label" className="block text-sm  mt-5"><span className='text-sm text-red-500 font-medium'>* </span>Plan Period</label>
          <div className="justify-between px-2">
            <div className="flex">
              <input type="radio" name="hs-radio-group" className="shrink-0 mt-0.5 border-gray-200 rounded-full text-blue-600 focus:ring-blue-500 cursor-pointer" id="hs-radio-group-1" />
              <label for="hs-radio-group-1" className="text-sm  text-gray-500 ms-2">Monthly</label>
            </div>

            <div className="flex">
              <input type="radio" name="hs-radio-group" className="shrink-0 mt-0.5 border-gray-200 rounded-full text-blue-600 focus:ring-blue-500 cursor-pointer" id="hs-radio-group-2" />
              <label for="hs-radio-group-2" className="text-sm  text-gray-500 ms-2">Quaterly</label>
            </div>

            <div className="flex">
              <input type="radio" name="hs-radio-group" className="shrink-0 mt-0.5 border-gray-200 rounded-full text-blue-600 focus:ring-blue-500 cursor-pointer" id="hs-radio-group-3" />
              <label for="hs-radio-group-3" className="text-sm  text-gray-500 ms-2">Yearly</label>
            </div>
          </div>

{/* 
         
          <input type="text" value={wpBussinessAccId} id="input-label" onChange={(e) => setWpBussinessAccId(e.target.value)} className={`py-2 px-4 block w-full rounded-lg text-sm border  mb-1 outline-none ${allRequirdFilled && wpBussinessAccId.length == 0 ? "border-red-500" : "border-gray-400"} `} placeholder="106503405738287" />





          <label htmlFor="input-label" className="block text-sm  mb-1"><span className='text-sm text-red-500 font-medium'>* </span>App ID</label>
          <input type="text" value={wpAppId} id="input-label" onChange={(e) => setWpAppId(e.target.value)} className={`py-2 px-4 block w-full rounded-lg text-sm border  mb-1 outline-none ${allRequirdFilled && wpAppId.length == 0 ? "border-red-500" : "border-gray-400"} `} placeholder="581563910221967" />



          <label htmlFor="input-label" className="block text-sm  mb-1"><span className='text-sm text-red-500 font-medium'>* </span>API Version</label>

          <div className="relative inline-block text-left w-full">
            <div>
              <button
                type="button"
                className={`inline-flex w-full justify-between items-center rounded-md border ${allRequirdFilled && wpApiVersion.length == 0 ? "border-red-500 " : "border-gray-400 "}shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50`}
                id="options-menu"
                aria-haspopup="true"
                aria-expanded="true"
                onClick={toggleDropdown}
              >
                {wpApiVersion.length > 0 ? wpApiVersion : "Select API Version"}
                {wpApiVersion.length > 0 ? <div className='flex gap-1'>
                  <MdCancel className='text-red-400 text-m' onClick={() => {
                    setWpApiVersion("")
                    setIsOpen(true)
                  }} />
                  <FaCheck className='text-green-400 text-m' />
                </div> : <FaChevronDown />}


              </button>
            </div>

            {isOpen && (
              <div
                className="origin-top-right absolute mt-2 w-[90%] left-4 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="options-menu"
              >
                <div className="py-1 duration-200" role="none">

                  {
                    dropDownData.map(item => (
                      <h6
                        key={item.id}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        onClick={() => {
                          setWpApiVersion(item.name)
                          setIsOpen(false)
                        }}
                      >{item.name}
                      </h6>

                    ))
                  }
                </div>
              </div>
            )}
          </div>

          <label htmlFor="input-label" className="block text-sm  mb-1"><span className='text-sm text-red-500 font-medium'>* </span>Permanant Access Token</label>
          <textarea value={wpToken} className={`py-2 px-4 block w-full rounded-lg text-sm border  mb-1 outline-none ${allRequirdFilled && wpToken.length == 0 ? "border-red-500" : "border-gray-400"} `} onCa rows="5" onChange={(e) => setWpToken(e.target.value)} placeholder="Paste or Enter token"></textarea> */}


        </div>


        <div className="flex justify-end gap-2 fixed inset-x-2 bottom-2">
          <button type="button" className="py-2  px-4 inline-flex items-center gap-x-2 text-sm  rounded-lg border border-transparent bg-gray-400 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600" onClick={toggleDrawer}>
            Close
          </button>
          <button type="button" className="py-2  px-4 inline-flex items-center gap-x-2 text-sm  rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600" onClick={handleSubmit}>
            {
              loadingSpin && <span className="animate-spin inline-block size-4 border-[2px] border-current border-t-transparent text-white rounded-full" role="status" aria-label="loading"></span>
            }
            {createOrUpdate ? "Add Plan" : "Update Plan"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PricingPlanForm
