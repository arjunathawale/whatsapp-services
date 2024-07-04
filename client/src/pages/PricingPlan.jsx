import React from 'react'
import Header from '../components/Header'
import { FaTrashArrowUp } from 'react-icons/fa6'
import { useState } from 'react'
import DatepickerComponent from '../components/DatepickerComponent'
import ClientForm from '../Forms/ClientForm'
import { FaEdit } from 'react-icons/fa'
import PricingPlanForm from '../Forms/PricingPlanForm'

const PricingPlan = () => {
    const [filter, setFilter] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [isPricingOpen, setIsPricingOpen] = useState(false)
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
    // const data = []
    const data = [1, 2, 3]
    return (
        <div className='p-1'>
            <Header name="Pricing Plans" />
            {/* Add Btn, filter btn search box */}
            <div className="w-full h-2/4 mt-5 p-1 ">
                <div className='flex justify-between py-2'>
                    <input type="text" id="input-email-label" className="py-1 h-10 px-4 block w-1/4  rounded-lg text-sm focus:outline-none bg-slate-200 justify-center items-center" placeholder="Search here" />
                    <div className='flex justify-end'>
                        {/* <button type="button" onClick={() => setFilter(prev => !prev)} className="h-10 mx-1 py-1 px-4 flex justify-center items-center size-[45px] text-s font-regular rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600">
                            <FaFilter />
                        </button> */}
                        <button onClick={() => setIsDrawerPricingOpen(true)} type="button" className="py-1 h-10 px-4 inline-flex items-center gap-x-2 text-sm rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600">
                            Add Plan
                        </button>
                    </div>
                </div>
                {/* Filterr */}
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
                                    data.map(item => (

                                        <div class="flex flex-col p-6 mx-auto max-w-lg text-center text-gray-900 bg-white rounded-lg border border-gray-100 shadow xl:p-8">
                                            <h3 class="mb-4 text-2xl font-semibold">Starter</h3>
                                            <p class="font-light text-gray-500 sm:text-lg dark:text-gray-400">Best option for personal use & for your next project.</p>
                                            <div class="flex justify-center items-baseline my-8">
                                                <span class="mr-2 text-5xl font-extrabold">$29</span>
                                                <span class="text-gray-500 dark:text-gray-400">/month</span>
                                            </div>

                                            <ul role="list" class="mb-8 space-y-4 text-left">
                                                <li class="flex items-center space-x-3">

                                                    <svg class="flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                                                    <span>Individual configuration</span>
                                                </li>
                                                <li class="flex items-center space-x-3">

                                                    <svg class="flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                                                    <span>No setup, or hidden fees</span>
                                                </li>
                                                <li class="flex items-center space-x-3">

                                                    <svg class="flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                                                    <span>Team size: <span class="font-semibold">1 developer</span></span>
                                                </li>
                                                <li class="flex items-center space-x-3">

                                                    <svg class="flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                                                    <span>Premium support: <span class="font-semibold">6 months</span></span>
                                                </li>
                                                <li class="flex items-center space-x-3">

                                                    <svg class="flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                                                    <span>Free updates: <span class="font-semibold">6 months</span></span>
                                                </li>
                                            </ul>
                                            <a href="#" class="text-blue-500 bg-primary-600 hover:bg-gray-700 focus:ring-4 focus:ring-primary-200 font-medium rounded-lg text-sm px-5 py-2.5 text-center">Get started</a>
                                        </div>

                                        // <div className="flex flex-col bg-white border shadow-m rounded-xl p-4 md:p-5" key={item}>
                                        //     <div className='flex justify-between'>
                                        //         <h3 className="text-lg font-bold text-gray-800">
                                        //             Arjun Athawale
                                        //         </h3>
                                        //         <div className="flex gap-2 items-center">
                                        //             <FaTrashArrowUp onClick={() => setIsOpen(true)} className='text-xl text-red-500 cursor-pointer' />
                                        //             <FaEdit className='text-xl text-green-500 cursor-pointer' onClick={() => {
                                        //                 setIsDrawerPricingOpen(true)
                                        //                 setSelectedData({})
                                        //             }} />
                                        //         </div>
                                        //     </div>
                                        //     <p className="mt-0 text-sm font-medium text-gray-500 dark:text-neutral-500">
                                        //         arjunathawale08@gmail.com
                                        //     </p>
                                        //     <p className=" text-sm text-gray-500 dark:text-neutral-60">
                                        //         9876543210
                                        //     </p>
                                        //     <p className=" text-sm uppercase text-gray-500 dark:text-neutral-60">
                                        //         CREPA0413L
                                        //     </p>
                                        //     <p className=" text-sm uppercase text-gray-500 dark:text-neutral-60">
                                        //         CREPA0413LSSDfsasdRD
                                        //     </p>
                                        //     <p className=" text-sm text-gray-500 dark:text-neutral-60">
                                        //         New York No. 1 Lake Park
                                        //     </p>
                                        // </div>
                                    ))
                                }
                            </div>
                        </> : isLoading ? <span className="animate-spin inline-block size-6 border-[2px] border-current border-t-transparent text-blue text-center rounded-full" aria-label="loading"></span> :
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