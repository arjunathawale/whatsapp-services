import React, { useState, useRef, useEffect } from 'react';
import { FaArrowCircleDown, FaArrowDown, FaCheck, FaChevronDown, FaClosedCaptioning, FaCross, FaDoorClosed, FaWindowClose } from "react-icons/fa";
import { FaFolderClosed } from 'react-icons/fa6';
import { MdCancel } from 'react-icons/md';
import { toast } from 'react-toastify';
import { createAPI, updateAPI } from '../constants/constants';

const PricingPlanForm = ({ drawerCondition, btnName, data }) => {
  function isEmptyObject(obj) {
    return Object.entries(obj).length === 0;
  }

  const [createOrUpdate, setCreateOrUpdate] = useState(isEmptyObject(data));
  const routeUrl = createOrUpdate ? `/pricingPlan/create` : '/pricingPlan/update';
  const [loadingSpin, setLoadingSpin] = useState(false);
  const [planName, setPlanName] = useState(data.planName ? data?.planName : '');
  const [description, setDescription] = useState(data.description ? data?.description : '');


  const [bulkLimit, setBulkLimit] = useState(data.bulkLimit ? data?.bulkLimit : '');
  const [price, setPrice] = useState(data.planPrice ? data?.planPrice : '');
  const [expireIn, setExpireIn] = useState(data.planExpireIn ? data?.planExpireIn : '');
  const [allRequirdFilled, setAllRequirdFilled] = useState(false);

  const [isChecked, setIsChecked] = useState(data.isActive ? data?.isActive : true);
  const [selectedPeriod, setSelectedPeriod] = useState(data.planPeriod ? data?.planPeriod : '');

  const [messageSendAPI, setMessageSendAPI] = useState(data.messageSendAPI ? data?.messageSendAPI : false);
  const [chatBot, setChatBot] = useState(data.chatBotFeature ? data?.chatBotFeature : false);
  const [manageTemplate, setManageTemplate] = useState(data.manageTemplate ? data?.manageTemplate : false);


  const handleChange = (event) => {
    console.log(event.target.value);
    setSelectedPeriod(event.target.value);
  };

  const drawerRef = useRef(null);
  const toggleDrawer = () => {
    drawerCondition.setIsDrawerPricingOpen(false);
  };

  const handleToggle = () => {
    setIsChecked(!isChecked);
  }

  const handleClickOutside = (event) => {
    if (drawerRef.current && !drawerRef.current.contains(event.target)) {
      drawerCondition.setIsDrawerPricingOpen(false);
    }
  };


  const handleSubmit = async (event) => {
    event.preventDefault();
    setAllRequirdFilled(true)

    if (!planName || !description || !bulkLimit || !price || !expireIn && (!messageSendAPI || !chatBot || !manageTemplate) && !selectedPeriod) {
      toast.info("All Fields are required!")
      setTimeout(() => {
        setAllRequirdFilled(false)
      }, 2000);
    } else {
      let objectData = {}
      setLoadingSpin(true);
      if (createOrUpdate) {
        objectData = {
          planName: planName,
          planPeriod: selectedPeriod,
          description: description,
          bulkLimit: bulkLimit,
          messageSendAPI: messageSendAPI,
          manageTemplate: manageTemplate,
          chatBotFeature: chatBot,
          planExpireIn: expireIn,
          isActive: isChecked,
          planPrice: price
        }

        const res = await createAPI(routeUrl, {
          ...objectData
        })
        if (res.status) {
          toast.success(res.message)
          drawerCondition.setIsDrawerPricingOpen(false);
          // setName('');
          // setPanNo('');
          // setGstNo('');
          // setAddress('');
          // setEmail('');
          // setMobileNo('');
          // setIsChecked(false);
          setLoadingSpin(false);
        } else {
          toast.error(res.message)
          setLoadingSpin(false);

        }
      } else {
        objectData = {
          id: data?._id,
          planName: planName,
          planPeriod: selectedPeriod,
          description: description,
          bulkLimit: bulkLimit,
          messageSendAPI: messageSendAPI,
          manageTemplate: manageTemplate,
          chatBotFeature: chatBot,
          planExpireIn: expireIn,
          isActive: isChecked,
          planPrice: price
        }

        const res = await updateAPI(routeUrl, {
          ...objectData
        })
        if (res.status) {
          toast.success(res.message)
          // setName('');
          // setPanNo('');
          // setGstNo('');
          // setAddress('');
          // setEmail('');
          // setMobileNo('');
          // setIsChecked(false);
          setLoadingSpin(false);
          // data = {}
          drawerCondition.setIsDrawerPricingOpen(false);
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
              <input type="text" autoComplete='off' value={planName} id="input-label" onChange={(e) => setPlanName(e.target.value)} className={`py-2 px-4 block w-full rounded-lg text-sm border  mb-1 outline-none ${allRequirdFilled && planName.length == 0 ? "border-red-500" : "border-gray-400"} `} placeholder="Plan Name" />
            </div>
            <div className='w-2/3'>
              <label htmlFor="input-label" className="block text-sm  mb-1"><span className='text-sm text-red-500 font-medium'>* </span>Plan Description</label>
              <input type="text" autoComplete='off' value={description} id="input-label" onChange={(e) => setDescription(e.target.value)} className={`py-2 px-4 block w-full rounded-lg text-sm border  mb-1 outline-none ${allRequirdFilled && description.length == 0 ? "border-red-500" : "border-gray-400"} `} placeholder="Plan Description" />
            </div>
          </div>

          <div className="flex justify-between gap-4 mt-3">
            <div className='w-1/3'>
              <label htmlFor="input-label" className="block text-sm mb-1"><span className='text-sm text-red-500 font-medium'>* </span>Bulk Limit</label>
              <input type="text" accept='number' autoComplete='off' value={bulkLimit} id="input-label" onChange={(e) => setBulkLimit(e.target.value)} className={`py-2 px-4 block w-full rounded-lg text-sm border  mb-1 outline-none ${allRequirdFilled && bulkLimit.length == 0 ? "border-red-500" : "border-gray-400"} `} placeholder="Bulk Limit" />
            </div>
            <div className='w-1/3'>
              <label htmlFor="input-label" className="block text-sm mb-1"><span className='text-sm text-red-500 font-medium'>* </span>Plan Price</label>
              <input type="text" autoComplete='off' value={price} id="input-label" onChange={(e) => setPrice(e.target.value)} className={`py-2 px-4 block w-full rounded-lg text-sm border  mb-1 outline-none ${allRequirdFilled && price.length == 0 ? "border-red-500" : "border-gray-400"} `} placeholder="Plan Price" />
            </div>
            <div className='w-1/3'>
              <label htmlFor="input-label" className="block text-sm  mb-1"><span className='text-sm text-red-500 font-medium'>* </span>Plan Expire In Days</label>
              <input type="text" autoComplete='off' value={expireIn} id="input-label" onChange={(e) => setExpireIn(e.target.value)} className={`py-2 px-4 block w-full rounded-lg text-sm border  mb-1 outline-none ${allRequirdFilled && expireIn.length == 0 ? "border-red-500" : "border-gray-400"} `} placeholder="Plan Expire In Days" />
            </div>
          </div>

          <div class="flex gap-x-6 justify-between px-2 mt-5">


            <div class="flex">
              <input type="checkbox" class="shrink-0 mt-0.5 border-gray-200 rounded text-blue-600 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none" id="hs-checkbox-group-1" checked={messageSendAPI} onChange={(e) => setMessageSendAPI(!messageSendAPI)} />
              <label for="hs-checkbox-group-4" class="text-sm text-gray-500 ms-3">Message Send API</label>
            </div>

            <div class="flex">
              <input type="checkbox" class="shrink-0 mt-0.5 border-gray-200 rounded text-blue-600 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none" id="hs-checkbox-group-2" checked={chatBot} onChange={(e) => setChatBot(!chatBot)} />
              <label for="hs-checkbox-group-5" class="text-sm text-gray-500 ms-3">Chatbot Automation</label>
            </div>

            <div class="flex">
              <input type="checkbox" class="shrink-0 mt-0.5 border-gray-200 rounded text-blue-600 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none" id="hs-checkbox-group-3" checked={manageTemplate} onChange={(e) => setManageTemplate(!manageTemplate)} />
              <label for="hs-checkbox-group-6" class="text-sm text-gray-500 ms-3">Manage Template</label>
            </div>
          </div>


          <label htmlFor="input-label" className="block text-sm  mt-5"><span className='text-sm text-red-500 font-medium'>* </span>Plan Period</label>
          <div className="justify-between px-2">
            <div className="flex">
              <input type="radio" value={"MONTHLY"} checked={selectedPeriod === "MONTHLY"} onChange={handleChange} name="hs-radio-group" className="shrink-0 mt-0.5 border-gray-200 rounded-full text-blue-600 focus:ring-blue-500 cursor-pointer" id="hs-radio-group-1" />
              <label for="hs-radio-group-1" className="text-sm  text-gray-500 ms-2">Monthly</label>
            </div>

            <div className="flex">
              <input type="radio" value={"QUATERLY"} checked={selectedPeriod === "QUATERLY"} onChange={handleChange} name="hs-radio-group" className="shrink-0 mt-0.5 border-gray-200 rounded-full text-blue-600 focus:ring-blue-500 cursor-pointer" id="hs-radio-group-2" />
              <label for="hs-radio-group-2" className="text-sm  text-gray-500 ms-2">Quaterly</label>
            </div>

            <div className="flex">
              <input type="radio" value={"YEARLY"} checked={selectedPeriod === "YEARLY"} onChange={handleChange} name="hs-radio-group" className="shrink-0 mt-0.5 border-gray-200 rounded-full text-blue-600 focus:ring-blue-500 cursor-pointer" id="hs-radio-group-3" />
              <label for="hs-radio-group-3" className="text-sm  text-gray-500 ms-2">Yearly</label>
            </div>
          </div>


          <label for="input-label" className="block text-sm  mb-1 mt-2">Plan Status</label>
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
