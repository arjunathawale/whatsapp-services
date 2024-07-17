import React, { useEffect } from 'react'
import Header from '../components/Header'
import { useState } from 'react'
import DatepickerComponent from '../components/DatepickerComponent'
import PricingPlanForm from '../Forms/PricingPlanForm'
import { getAPI } from '../constants/constants'
import { toast } from 'react-toastify'
import { MdCheck, MdClose, MdEdit } from 'react-icons/md'

const PricingPlan = () => {
    const [filter, setFilter] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [isDrawerPricingOpen, setIsDrawerPricingOpen] = useState(false)

    const [selectedFromDate, setSelectedFromDate] = useState(new Date())
    const [selectedToDate, setSelectedToDate] = useState(new Date())

    const [selectedData, setSelectedData] = useState({})


    const handleFromDateChange = (date) => {
        setSelectedFromDate(date);
    };
    const handleToDateChange = (date) => {
        setSelectedToDate(date);
    };

    const [isOpen, setIsOpen] = useState(false);

    const openDialog = () => {
        setIsOpen(true);
    };

    const closeDialog = () => {
        setIsOpen(false);
    };

    const [data, setData] = useState([]);

    useEffect(() => {
        fetchData()
    }, [isDrawerPricingOpen])
    const fetchData = async () => {
        setIsLoading(true)
        let res = await getAPI("/pricingPlan/get", {})
        if (res.status) {
            setData(res.data)
            setIsLoading(false)
        } else {
            toast.error("Something went wrong")
            setIsLoading(false)
        }
    }

    return (
        <div className='p-1'>
            <Header name="Pricing Plans" />
            {/* Add Btn, filter btn search box */}
            <div className="w-full h-2/4 mt-5 p-1 ">
                <div className='flex justify-between py-2'>
                    <input type="text" id="input-email-label" autoComplete='off' className="py-1 h-10 px-4 block w-1/4  rounded-lg text-sm focus:outline-none bg-slate-200 justify-center items-center" placeholder="Search here" />
                    <div className='flex justify-end'>
                        <button onClick={() => setIsDrawerPricingOpen(true)} type="button" className="py-1 h-10 px-4 inline-flex items-center gap-x-2 text-sm rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600">
                            Add Plan
                        </button>
                    </div>
                </div>
                {
                    filter &&
                    <div className='w-full h-12 p-2 bg-slate-500 my-2 flex duration-300 gap-2'>
                        <div>
                            {/* <label className='text-white text-sm'>From Date</label> */}
                            <DatepickerComponent selectedDate={selectedFromDate} handleDateChange={handleFromDateChange} />
                        </div>
                        <div>
                            {/* <label className='text-white text-sm'>To Date</label> */}
                            <DatepickerComponent selectedDate={selectedToDate} handleDateChange={handleToDateChange} />
                        </div>
                        <div className='flex justify-end'>
                            <button className='text-white text-sm h-8 py-1 w-24 rounded-sm bg-blue-500'>Apply</button>
                        </div>
                    </div>
                }
                {
                    data && data.length > 0 ?
                        <>
                            <div className="grid grid-cols-3 gap-4 overflow-auto">
                                {
                                    data.map((item, index) => (

                                        <div key={index} class="flex flex-col p-6 mx-auto max-w-lg text-center text-gray-900 bg-white rounded-lg border border-gray-100 shadow xl:p-8">
                                            <div className='flex justify-end' onClick={() => {
                                                setIsDrawerPricingOpen(true)
                                                setSelectedData(item)
                                            }}>
                                                <MdEdit className='text-blue-500 text-xl cursor-pointer' />
                                            </div>
                                            <h3 class="mb-2 text-2xl font-semibold">{item?.planName}</h3>
                                            <p class="font-light text-gray-500 sm:text-lg dark:text-gray-400">{item?.description}</p>
                                            <div class="flex justify-center items-baseline my-2">
                                                <span class="mr-2 text-3xl font-extrabold">₹{item?.planPrice}</span>
                                                <span class="text-gray-500 dark:text-gray-400">/month</span>
                                            </div>

                                            <ul role="list" class="mb-8 space-y-4 text-left">
                                                <div class="flex justify-center items-baseline my-2">
                                                    <span class="mr-2 text-1xl font-medium">{item?.bulkLimit}</span>
                                                    <span class="text-gray-500 dark:text-gray-400">Bulk Send Limit</span>
                                                </div>

                                                <li class="flex items-center space-x-3">

                                                    <MdCheck className='text-green-400 text-xl' />
                                                    <span>Team size: 1 Agent</span>
                                                </li>
                                                <li class="flex items-center space-x-3">

                                                    {
                                                        item?.messageSendAPI ? <MdCheck className='text-green-400 text-xl' /> : <MdClose className='text-red-500 text-xl' />
                                                    }

                                                    <span>Message Send RestAPI </span>
                                                </li>
                                                <li class="flex items-center space-x-3">
                                                    {
                                                        item?.chatBotFeature ? <MdCheck className='text-green-400 text-xl' /> : <MdClose className='text-red-500 text-xl' />
                                                    }

                                                    <span>Chatbot Automation</span>
                                                </li>
                                                <li class="flex items-center space-x-3">
                                                    {
                                                        item?.manageTemplate ? <MdCheck className='text-green-400 text-xl' /> : <MdClose className='text-red-500 text-xl' />
                                                    }

                                                    <span>Manage Template</span>
                                                </li>
                                                <li class="flex items-center space-x-3">

                                                    <MdCheck className='text-green-400 text-xl' />
                                                    <span>No setup, or hidden fees</span>
                                                </li>
                                            </ul>
                                            {/* <a href="#" class="text-blue-500 bg-primary-600 hover:bg-gray-700 focus:ring-4 focus:ring-primary-200 font-medium rounded-lg text-sm px-5 py-2.5 text-center">Get started</a> */}
                                        </div>
                                    ))
                                }
                            </div>
                        </> : isLoading ? <div className="min-h-60 flex flex-col rounded-xl">
                            <div className="flex flex-auto flex-col justify-center items-center p-4 md:p-5">
                                <div className="flex justify-center">
                                    <div className="animate-spin inline-block size-6 border-[3px] border-current border-t-transparent text-blue-600 rounded-full dark:text-blue-500" role="status" aria-label="loading">
                                        <span className="sr-only">Loading...</span>
                                    </div>
                                </div>
                            </div>
                        </div> :
                            <h3 className='text-2xl text-center font-medium mt-1'>No Data Found</h3>

                }


                {isOpen && (
                    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
                        <div className="bg-white rounded-lg p-4">
                            <span className="absolute top-0 right-0 cursor-pointer" onClick={closeDialog}>&times;</span>
                            <p>Are you sure you want to delete this client?</p>
                            <div className="flex justify-end gap-2 fixed inset-x-2 bottom-2">

                            </div>
                            <div className='mt-1 flex justify-end gap-2'>

                                <button type="button" onClick={() => setIsOpen(false)} className="py-1  px-4 inline-flex items-center gap-x-2 text-xs  rounded-lg border border-transparent bg-red-500 text-white hover:bg-gray-700 disabled:opacity-50 disabled:pointer-events-none dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600" >
                                    Close
                                </button>
                                <button type="button" className="py-1  px-4 inline-flex items-center gap-x-2 text-xs  rounded-lg border border-transparent bg-blue-400 text-white hover:bg-gray-700 disabled:opacity-50 disabled:pointer-events-none dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600" >
                                    Sure
                                </button>
                            </div>
                        </div>

                    </div>
                )}
            </div>
            {
                isDrawerPricingOpen && <PricingPlanForm drawerCondition={{ isDrawerPricingOpen, setIsDrawerPricingOpen }} btnName="Add Plan" data={selectedData} />
            }
        </div>
    )
}

export default PricingPlan