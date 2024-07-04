import React, { useState, useRef, useEffect } from 'react';
import { FaArrowCircleDown, FaArrowDown, FaCheck, FaChevronDown, FaChevronLeft, FaChevronRight, FaClosedCaptioning, FaCross, FaDoorClosed, FaWindowClose } from "react-icons/fa";
import { FaFolderClosed } from 'react-icons/fa6';
import { MdCancel } from 'react-icons/md';
import Pagination from '../components/Pagination';

const ClientCreadentialForm = ({ drawerCondition, btnName }) => {

  const [loadingSpin, setLoadingSpin] = useState(false);
  const [wpMobileNo, setWpMobileNo] = useState('');
  const [wpPhoneNoId, setWphoneNoId] = useState('');
  const [wpBussinessAccId, setWpBussinessAccId] = useState('');
  const [wpToken, setWpToken] = useState('');
  const [wpApiVersion, setWpApiVersion] = useState('');
  const [wpAppId, setWpAppId] = useState('');

  // Validations
  const [nameRequired, setNameRequired] = useState(false);
  const [emailRequired, setEmailRequired] = useState(false);
  const [panNoRequired, setPanNoRequired] = useState(false);
  const [gstNoRequired, setGstNoRequired] = useState(false);
  const [addressRequired, setAddressRequired] = useState(false);
  const [mobileNoRequired, setMobileNoRequired] = useState(false);


  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const drawerRef = useRef(null);
  const toggleDrawer = () => {
    drawerCondition.setIsPricingOpen(false);
  };

  const handleClickOutside = (event) => {
    if (drawerRef.current && !drawerRef.current.contains(event.target)) {
      drawerCondition.setIsPricingOpen(false);
    }
  };


  const handleSubmit = (event) => {
    event.preventDefault();
    setLoadingSpin(true);

    setTimeout(() => {
      setLoadingSpin(false);
    }, 5000);
  }

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const [isChecked, setIsChecked] = useState(false);

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

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const totalPages = 10; // Total number of pages

  console.log("currentPage", currentPage);
  console.log("pageSize", pageSize);

  const onPageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Fetch data for the new page based on the pageNumber
  };


  return (
    <div ref={drawerRef} className={`fixed inset-y-0 right-0 z-10 w-2/4 bg-white border-l border-gray-300 shadow-lg ${drawerCondition.isPricingOpen ? 'block' : 'hidden'}`}>
      <div className="flex justify-between p-4">
        <h4 className="text-black text-xl font-medium">Client Plan History</h4>
        <button onClick={toggleDrawer} className="text-black hover:text-red-500 hover:scale-110 duration-200 text-2xl">
          <FaWindowClose />
        </button>
      </div>
      <div className="px-4">
        <div className=" overflow-y-auto h-auto">
          <div className="flex flex-col">
            <div className="-m-1.5 overflow-x-auto">
              <div className="p-1.5 min-w-full inline-block align-middle">
                <div className="overflow-hidden">
                  <table className="min-w-full divide-gray-200">
                    <thead>
                      <tr>
                        <th scope="col" className="px-4 py-2 text-start text-sm font-semibold text-black uppercase">Plan Name</th>
                        <th scope="col" className="px-4 py-2 text-start text-sm font-semibold text-black uppercase">Start Time</th>
                        <th scope="col" className="px-4 py-2 text-start text-sm font-semibold text-black uppercase">Expiry Time</th>
                        <th scope="col" className="px-4 py-2 text-start text-sm font-semibold text-black uppercase">Status</th>

                      </tr>
                    </thead>
                    <tbody className="divide-gray-200">
                      <tr>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-800">General Plan</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">20/03/2024 2:00 PM</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">20/10/2024 2:00 PM</td>
                        <td className="px-4 py-3 whitespace-nowrap text-start text-sm font-medium flex gap-2">
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
                              className={`flex items-center cursor-pointer w-10 h-5 rounded-full transition-colors duration-300 ${isChecked ? 'bg-blue-500' : 'bg-gray-400'
                                }`}
                            >
                              <span
                                className={`inline-block w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-300 ${isChecked ? 'translate-x-6' : 'translate-x-0'
                                  }`}
                              />
                            </label>
                          </div>
                          {/* <div className='mt-0'>
                            <input
                              type="checkbox"
                              id="toggle"
                              checked={isChecked}
                              onChange={handleToggle}
                              className="hidden"
                            />
                            <label
                              htmlFor="toggle"
                              className={`flex items-center cursor-pointer w-10 h-5 rounded-full transition-colors duration-300 ${isChecked ? 'bg-blue-500' : 'bg-gray-400'
                                }`}
                            >
                              <span
                                className={`inline-block w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-300 ${isChecked ? 'translate-x-6' : 'translate-x-0'
                                  }`}
                              />
                            </label>
                          </div> */}
                          {/* <button type="button" className="inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:pointer-events-none">{true ? "On" : "Off"}</button> */}
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-800">General Plan</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">20/03/2024 2:00 PM</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">20/10/2024 2:00 PM</td>
                        <td className="px-4 py-3 whitespace-nowrap text-start text-sm font-medium flex gap-2">
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
                              className={`flex items-center cursor-pointer w-10 h-5 rounded-full transition-colors duration-300 ${isChecked ? 'bg-blue-500' : 'bg-gray-400'
                                }`}
                            >
                              <span
                                className={`inline-block w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-300 ${isChecked ? 'translate-x-6' : 'translate-x-0'
                                  }`}
                              />
                            </label>
                          </div>
                          {/* <div className='mt-0'>
                            <input
                              type="checkbox"
                              id="toggle"
                              checked={isChecked}
                              onChange={handleToggle}
                              className="hidden"
                            />
                            <label
                              htmlFor="toggle"
                              className={`flex items-center cursor-pointer w-10 h-5 rounded-full transition-colors duration-300 ${isChecked ? 'bg-blue-500' : 'bg-gray-400'
                                }`}
                            >
                              <span
                                className={`inline-block w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-300 ${isChecked ? 'translate-x-6' : 'translate-x-0'
                                  }`}
                              />
                            </label>
                          </div> */}
                          {/* <button type="button" className="inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:pointer-events-none">{true ? "On" : "Off"}</button> */}
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-800">General Plan</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">20/03/2024 2:00 PM</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">20/10/2024 2:00 PM</td>
                        <td className="px-4 py-3 whitespace-nowrap text-start text-sm font-medium flex gap-2">
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
                              className={`flex items-center cursor-pointer w-10 h-5 rounded-full transition-colors duration-300 ${isChecked ? 'bg-blue-500' : 'bg-gray-400'
                                }`}
                            >
                              <span
                                className={`inline-block w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-300 ${isChecked ? 'translate-x-6' : 'translate-x-0'
                                  }`}
                              />
                            </label>
                          </div>
                          {/* <div className='mt-0'>
                            <input
                              type="checkbox"
                              id="toggle"
                              checked={isChecked}
                              onChange={handleToggle}
                              className="hidden"
                            />
                            <label
                              htmlFor="toggle"
                              className={`flex items-center cursor-pointer w-10 h-5 rounded-full transition-colors duration-300 ${isChecked ? 'bg-blue-500' : 'bg-gray-400'
                                }`}
                            >
                              <span
                                className={`inline-block w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-300 ${isChecked ? 'translate-x-6' : 'translate-x-0'
                                  }`}
                              />
                            </label>
                          </div> */}
                          {/* <button type="button" className="inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:pointer-events-none">{true ? "On" : "Off"}</button> */}
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-800">General Plan</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">20/03/2024 2:00 PM</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">20/10/2024 2:00 PM</td>
                        <td className="px-4 py-3 whitespace-nowrap text-start text-sm font-medium flex gap-2">
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
                              className={`flex items-center cursor-pointer w-10 h-5 rounded-full transition-colors duration-300 ${isChecked ? 'bg-blue-500' : 'bg-gray-400'
                                }`}
                            >
                              <span
                                className={`inline-block w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-300 ${isChecked ? 'translate-x-6' : 'translate-x-0'
                                  }`}
                              />
                            </label>
                          </div>
                          {/* <div className='mt-0'>
                            <input
                              type="checkbox"
                              id="toggle"
                              checked={isChecked}
                              onChange={handleToggle}
                              className="hidden"
                            />
                            <label
                              htmlFor="toggle"
                              className={`flex items-center cursor-pointer w-10 h-5 rounded-full transition-colors duration-300 ${isChecked ? 'bg-blue-500' : 'bg-gray-400'
                                }`}
                            >
                              <span
                                className={`inline-block w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-300 ${isChecked ? 'translate-x-6' : 'translate-x-0'
                                  }`}
                              />
                            </label>
                          </div> */}
                          {/* <button type="button" className="inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:pointer-events-none">{true ? "On" : "Off"}</button> */}
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-800">General Plan</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">20/03/2024 2:00 PM</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">20/10/2024 2:00 PM</td>
                        <td className="px-4 py-3 whitespace-nowrap text-start text-sm font-medium flex gap-2">
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
                              className={`flex items-center cursor-pointer w-10 h-5 rounded-full transition-colors duration-300 ${isChecked ? 'bg-blue-500' : 'bg-gray-400'
                                }`}
                            >
                              <span
                                className={`inline-block w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-300 ${isChecked ? 'translate-x-6' : 'translate-x-0'
                                  }`}
                              />
                            </label>
                          </div>
                          {/* <div className='mt-0'>
                            <input
                              type="checkbox"
                              id="toggle"
                              checked={isChecked}
                              onChange={handleToggle}
                              className="hidden"
                            />
                            <label
                              htmlFor="toggle"
                              className={`flex items-center cursor-pointer w-10 h-5 rounded-full transition-colors duration-300 ${isChecked ? 'bg-blue-500' : 'bg-gray-400'
                                }`}
                            >
                              <span
                                className={`inline-block w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-300 ${isChecked ? 'translate-x-6' : 'translate-x-0'
                                  }`}
                              />
                            </label>
                          </div> */}
                          {/* <button type="button" className="inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:pointer-events-none">{true ? "On" : "Off"}</button> */}
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-800">General Plan</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">20/03/2024 2:00 PM</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">20/10/2024 2:00 PM</td>
                        <td className="px-4 py-3 whitespace-nowrap text-start text-sm font-medium flex gap-2">
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
                              className={`flex items-center cursor-pointer w-10 h-5 rounded-full transition-colors duration-300 ${isChecked ? 'bg-blue-500' : 'bg-gray-400'
                                }`}
                            >
                              <span
                                className={`inline-block w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-300 ${isChecked ? 'translate-x-6' : 'translate-x-0'
                                  }`}
                              />
                            </label>
                          </div>
                          {/* <div className='mt-0'>
                            <input
                              type="checkbox"
                              id="toggle"
                              checked={isChecked}
                              onChange={handleToggle}
                              className="hidden"
                            />
                            <label
                              htmlFor="toggle"
                              className={`flex items-center cursor-pointer w-10 h-5 rounded-full transition-colors duration-300 ${isChecked ? 'bg-blue-500' : 'bg-gray-400'
                                }`}
                            >
                              <span
                                className={`inline-block w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-300 ${isChecked ? 'translate-x-6' : 'translate-x-0'
                                  }`}
                              />
                            </label>
                          </div> */}
                          {/* <button type="button" className="inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:pointer-events-none">{true ? "On" : "Off"}</button> */}
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-800">General Plan</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">20/03/2024 2:00 PM</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">20/10/2024 2:00 PM</td>
                        <td className="px-4 py-3 whitespace-nowrap text-start text-sm font-medium flex gap-2">
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
                              className={`flex items-center cursor-pointer w-10 h-5 rounded-full transition-colors duration-300 ${isChecked ? 'bg-blue-500' : 'bg-gray-400'
                                }`}
                            >
                              <span
                                className={`inline-block w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-300 ${isChecked ? 'translate-x-6' : 'translate-x-0'
                                  }`}
                              />
                            </label>
                          </div>
                          {/* <div className='mt-0'>
                            <input
                              type="checkbox"
                              id="toggle"
                              checked={isChecked}
                              onChange={handleToggle}
                              className="hidden"
                            />
                            <label
                              htmlFor="toggle"
                              className={`flex items-center cursor-pointer w-10 h-5 rounded-full transition-colors duration-300 ${isChecked ? 'bg-blue-500' : 'bg-gray-400'
                                }`}
                            >
                              <span
                                className={`inline-block w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-300 ${isChecked ? 'translate-x-6' : 'translate-x-0'
                                  }`}
                              />
                            </label>
                          </div> */}
                          {/* <button type="button" className="inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:pointer-events-none">{true ? "On" : "Off"}</button> */}
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-800">General Plan</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">20/03/2024 2:00 PM</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">20/10/2024 2:00 PM</td>
                        <td className="px-4 py-3 whitespace-nowrap text-start text-sm font-medium flex gap-2">
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
                              className={`flex items-center cursor-pointer w-10 h-5 rounded-full transition-colors duration-300 ${isChecked ? 'bg-blue-500' : 'bg-gray-400'
                                }`}
                            >
                              <span
                                className={`inline-block w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-300 ${isChecked ? 'translate-x-6' : 'translate-x-0'
                                  }`}
                              />
                            </label>
                          </div>
                          {/* <div className='mt-0'>
                            <input
                              type="checkbox"
                              id="toggle"
                              checked={isChecked}
                              onChange={handleToggle}
                              className="hidden"
                            />
                            <label
                              htmlFor="toggle"
                              className={`flex items-center cursor-pointer w-10 h-5 rounded-full transition-colors duration-300 ${isChecked ? 'bg-blue-500' : 'bg-gray-400'
                                }`}
                            >
                              <span
                                className={`inline-block w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-300 ${isChecked ? 'translate-x-6' : 'translate-x-0'
                                  }`}
                              />
                            </label>
                          </div> */}
                          {/* <button type="button" className="inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:pointer-events-none">{true ? "On" : "Off"}</button> */}
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-800">General Plan</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">20/03/2024 2:00 PM</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">20/10/2024 2:00 PM</td>
                        <td className="px-4 py-3 whitespace-nowrap text-start text-sm font-medium flex gap-2">
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
                              className={`flex items-center cursor-pointer w-10 h-5 rounded-full transition-colors duration-300 ${isChecked ? 'bg-blue-500' : 'bg-gray-400'
                                }`}
                            >
                              <span
                                className={`inline-block w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-300 ${isChecked ? 'translate-x-6' : 'translate-x-0'
                                  }`}
                              />
                            </label>
                          </div>
                          {/* <div className='mt-0'>
                            <input
                              type="checkbox"
                              id="toggle"
                              checked={isChecked}
                              onChange={handleToggle}
                              className="hidden"
                            />
                            <label
                              htmlFor="toggle"
                              className={`flex items-center cursor-pointer w-10 h-5 rounded-full transition-colors duration-300 ${isChecked ? 'bg-blue-500' : 'bg-gray-400'
                                }`}
                            >
                              <span
                                className={`inline-block w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-300 ${isChecked ? 'translate-x-6' : 'translate-x-0'
                                  }`}
                              />
                            </label>
                          </div> */}
                          {/* <button type="button" className="inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:pointer-events-none">{true ? "On" : "Off"}</button> */}
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-800">General Plan</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">20/03/2024 2:00 PM</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">20/10/2024 2:00 PM</td>
                        <td className="px-4 py-3 whitespace-nowrap text-start text-sm font-medium flex gap-2">
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
                              className={`flex items-center cursor-pointer w-10 h-5 rounded-full transition-colors duration-300 ${isChecked ? 'bg-blue-500' : 'bg-gray-400'
                                }`}
                            >
                              <span
                                className={`inline-block w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-300 ${isChecked ? 'translate-x-6' : 'translate-x-0'
                                  }`}
                              />
                            </label>
                          </div>
                          {/* <div className='mt-0'>
                            <input
                              type="checkbox"
                              id="toggle"
                              checked={isChecked}
                              onChange={handleToggle}
                              className="hidden"
                            />
                            <label
                              htmlFor="toggle"
                              className={`flex items-center cursor-pointer w-10 h-5 rounded-full transition-colors duration-300 ${isChecked ? 'bg-blue-500' : 'bg-gray-400'
                                }`}
                            >
                              <span
                                className={`inline-block w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-300 ${isChecked ? 'translate-x-6' : 'translate-x-0'
                                  }`}
                              />
                            </label>
                          </div> */}
                          {/* <button type="button" className="inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:pointer-events-none">{true ? "On" : "Off"}</button> */}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Pagination
          currentPage={currentPage}
          pageSize={pageSize}
          totalPages={totalPages}
          onPageChange={onPageChange}
          setPageSize={setPageSize}
        />


        {/* <div className="flex justify-end gap-2 fixed inset-x-2 bottom-2">
          <button type="button" className="py-2  px-4 inline-flex items-center gap-x-2 text-sm  rounded-lg border border-transparent bg-gray-400 text-white hover:bg-red-500 disabled:opacity-50 disabled:pointer-events-none dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600" onClick={toggleDrawer}>
            Close
          </button> */}
          {/* <button type="button" className="py-2  px-4 inline-flex items-center gap-x-2 text-sm  rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600" onClick={handleSubmit}>
            {
              loadingSpin && <span className="animate-spin inline-block size-4 border-[2px] border-current border-t-transparent text-white rounded-full" role="status" aria-label="loading"></span>
            }
            {btnName}
          </button> */}
        {/* </div> */}
      </div>
    </div >
  );
}

export default ClientCreadentialForm
