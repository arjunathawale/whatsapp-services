import React, { useEffect } from 'react'
import Header from '../components/Header'
import { FaUserGear, FaTrash, FaTrashArrowUp, FaGear } from 'react-icons/fa6'
import Drawer from '../components/Drawer'
import { useState } from 'react'
import DatepickerComponent from '../components/DatepickerComponent'
import ClientForm from '../Forms/ClientForm'
import { FaEdit, FaFilter, FaShoppingBag } from 'react-icons/fa'
import ClientCreadentialForm from '../Forms/ClientCreadentialForm'
import ClientPlanMapForm from '../Forms/ClientPlanMapForm'
import { deleteAPI, getAPI } from '../constants/constants'
import { toast } from 'react-toastify'
import moment from 'moment'
import LoadingSpinner from '../components/LoadingSpinner'
const Client = () => {
    const [filter, setFilter] = useState(false)
    const [applyFilter, setApplyFilter] = useState(false)
    const [filterString, setFilterString] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [isPricingOpen, setIsPricingOpen] = useState(false)
    const [isDrawerCredentialOpen, setIsDrawerCredentialOpen] = useState(false)

    const [selectedFromDate, setSelectedFromDate] = useState(new Date())
    const [selectedToDate, setSelectedToDate] = useState(new Date())

    const [selectedData, setSelectedData] = useState({})
    const [_id, setId] = useState("")
    const [wpClientId, setWpClientId] = useState("")


    const handleFromDateChange = (date) => {
        setSelectedFromDate(date);
    };
    const handleToDateChange = (date) => {
        setSelectedToDate(date);
    };

    const [isOpen, setIsOpen] = useState(false);
    const [data, setData] = useState([]);

    const openDialog = () => {
        setIsOpen(true);
    };

    const closeDialog = () => {
        setIsOpen(false);
    };
    // console.log("selectedFromDate", moment(selectedFromDate).format("DD-MM-YYYY"), "selectedToDate", moment(selectedToDate).format("DD-MM-YYYY"), selectedFromDate,selectedToDate);
    let filterObject = {}
    if (filterString.length > 0 || selectedFromDate || selectedToDate) {
        filterObject = {
            "clientname": filterString,
            // "fromDate": moment(selectedFromDate).utcOffset("+05:30").format("YYYY-MM-DDT00:00:00 Z"),
            // "toDate": moment(selectedToDate).utcOffset("+05:30").format("YYYY-MM-DDT23:59:59 Z")
            // "panNo": filterString,
            // "gstNo": filterString,
            // "mobileNo": filterString,
            // "emailId": filterString,
            // "address": filterString
        }
    }

    useEffect(() => {
        if (filterString.length > 0) {
            const timerId = setTimeout(fetchData, 1000);
            return () => {
                clearTimeout(timerId)
            }
        }
        fetchData()
    }, [isDrawerOpen, filterString, isDrawerCredentialOpen])
    const fetchData = async () => {
        // let filterObject = {}
        setIsLoading(true)
        let res = await getAPI("/client/get", filterObject)
        if (res.status) {
            setData(res.data)
            setIsLoading(false)
        } else {
            toast.error("Something went wrong")
            setIsLoading(false)
        }
    }

    const deleteClient = async () => {
        const res = await deleteAPI("client/delete", _id)
        if (res.status) {
            toast.success(res.message)
            fetchData()
            setIsOpen(false)
        } else {
            toast.error(res.message)
        }
    }

    return (
        <div className='p-1'>
            <Header name="Clients" />
            {/* Add Btn, filter btn search box */}
            <div className="w-full h-2/4 mt-5 p-1 ">
                <div className='flex justify-between py-2'>
                    <input type="text" id="input-email-label" value={filterString} onChange={(e) => setFilterString(e.target.value)} className="py-1 h-10 px-4 block w-1/4  rounded-lg text-sm focus:outline-none bg-slate-200 justify-center items-center" placeholder="Search here" />
                    <div className='flex justify-end'>
                        <button type="button" onClick={() => setFilter(prev => !prev)} className="h-10 mx-1 py-1 px-4 flex justify-center items-center size-[45px] text-s font-regular rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600">
                            <FaFilter />
                        </button>
                        <button onClick={() => {
                            setSelectedData({})
                            setIsDrawerOpen(true)
                        }} type="button" className="py-1 h-10 px-4 inline-flex items-center gap-x-2 text-sm rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600">
                            Add Client
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
                            <button onClick={() => setApplyFilter(prev => !prev)} className='text-white text-sm h-8 py-1 w-24 rounded-sm bg-blue-500'>Apply</button>
                        </div>
                    </div>
                }

                {
                    data && data.length > 0 ?
                        <>
                            <div className="grid grid-cols-3 gap-4 overflow-auto">
                                {
                                    data.map(item => (
                                        <div className="flex flex-col bg-white border shadow-m rounded-xl p-4 md:p-5" key={item._id}>
                                            <div className='flex justify-between'>
                                                <h3 className="text-lg font-bold text-gray-800">
                                                    {item?.clientname}
                                                </h3>
                                                <div className="flex gap-2 items-center">
                                                    <FaTrashArrowUp onClick={() => {
                                                        setId(item._id)
                                                        setIsOpen(true)
                                                        // deleteClient(item?._id)
                                                    }} className='text-xl text-red-500 cursor-pointer' />
                                                    <FaShoppingBag className='text-xl text-blue-500 cursor-pointer' onClick={() => setIsPricingOpen(true)} />
                                                    <FaGear onClick={() => {
                                                        setWpClientId(item._id)
                                                        setSelectedData(item?.clinetConfig[0] || {})
                                                        setIsDrawerCredentialOpen(true)
                                                    }} className='text-xl text-gray-500 cursor-pointer' />
                                                    <FaEdit className='text-xl text-green-500 cursor-pointer' onClick={() => {
                                                        setSelectedData(item)
                                                        setIsDrawerOpen(true)
                                                    }} />
                                                </div>
                                            </div>
                                            <p className="mt-0 text-sm font-medium text-gray-500 dark:text-neutral-500">
                                                {item?.emailId}
                                            </p>
                                            <p className=" text-sm text-gray-500 dark:text-neutral-60">
                                                {item?.mobileNo}
                                            </p>
                                            <p className=" text-sm uppercase text-gray-500 dark:text-neutral-60">
                                                {item?.panNo}
                                            </p>
                                            <p className=" text-sm uppercase text-gray-500 dark:text-neutral-60">
                                                {item?.gstNo}
                                            </p>
                                            <p className=" text-sm text-gray-500 dark:text-neutral-60">
                                                {item?.address}
                                            </p>
                                        </div>
                                    ))
                                }
                            </div>
                        </> : isLoading ? <LoadingSpinner /> : <h3 className='text-2xl text-center font-medium mt-1'>No Data Found</h3>
                }


                {isOpen && (
                    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
                        <div className="bg-white rounded-lg p-4">
                            <span className="absolute top-0 right-0 cursor-pointer" onClick={closeDialog}>&times;aaa</span>
                            <p>Are you sure you want to delete this client?</p>
                            <div className="flex justify-end gap-2 fixed inset-x-2 bottom-2">
                            </div>
                            <div className='mt-1 flex justify-end gap-2'>
                                <button type="button" onClick={() => {
                                    setId("")
                                    setIsOpen(false)
                                }} className="py-1  px-4 inline-flex items-center gap-x-2 text-xs  rounded-lg border border-transparent bg-red-500 text-white hover:bg-gray-700 disabled:opacity-50 disabled:pointer-events-none dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600" >
                                    Close
                                </button>
                                <button type="button" onClick={deleteClient} className="py-1  px-4 inline-flex items-center gap-x-2 text-xs  rounded-lg border border-transparent bg-blue-400 text-white hover:bg-gray-700 disabled:opacity-50 disabled:pointer-events-none dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600" >
                                    Sure
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            {
                isDrawerOpen && <ClientForm drawerCondition={{ isDrawerOpen, setIsDrawerOpen }} btnName="Add Client" data={selectedData} />
            }
            {
                isDrawerCredentialOpen && <ClientCreadentialForm drawerCondition={{ isDrawerCredentialOpen, setIsDrawerCredentialOpen }} btnName="Add Credential" data={selectedData} wpClientId={wpClientId} />
            }
            {
                isPricingOpen && <ClientPlanMapForm drawerCondition={{ isPricingOpen, setIsPricingOpen }} btnName="Add Plan" />
            }
        </div>
    )
}

export default Client