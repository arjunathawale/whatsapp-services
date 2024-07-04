import React, { useEffect } from 'react'
import Header from '../components/Header'
import { FaFilter, FaTrashArrowUp } from 'react-icons/fa6'
import { useState } from 'react'
import DatepickerComponent from '../components/DatepickerComponent'
import ClientForm from '../Forms/ClientForm'
import { FaEdit, FaEye } from 'react-icons/fa'
import PricingPlanForm from '../Forms/PricingPlanForm'
import { toast } from 'react-toastify'
import { useSelector } from 'react-redux'
import { getAPI } from '../constants/constants'
import moment from 'moment'
import BulkSenderDetailReport from '../Forms/BulkSenderDetailReport'
const BulkSenderDetails = () => {
    const { _id } = useSelector(state => state.user.userData)
    const [page, setPage] = useState(1)

    const [filter, setFilter] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [isLoadingMore, setIsLoadingMore] = useState(false)
    const [isReportOpen, setIsReportOpen] = useState(false)
    const [bulkMasterId, setBulkMasterId] = useState('')
    const [isDrawerPricingOpen, setIsDrawerPricingOpen] = useState(false)

    const [selectedFromDate, setSelectedFromDate] = useState(new Date())
    const [selectedToDate, setSelectedToDate] = useState(new Date())

    const [selectedData, setSelectedData] = useState({})
    const [search, setSearch] = useState('')


    const handleFromDateChange = (date) => {
        setSelectedFromDate(date);
    };
    const handleToDateChange = (date) => {
        setSelectedToDate(date);
    };
    const [data, setData] = useState([])
    const [dataCount, setDataCount] = useState(0)
    const [isOpen, setIsOpen] = useState(false);

    console.log("bulkMasterId", bulkMasterId);
    useEffect(() => {
        fetchData()
    }, [selectedFromDate, search])
    const fetchData = async () => {

        setIsLoading(true)

        let res = await getAPI("/bulksender/get", {
            wpClientId: _id,
            // createdAt:  moment(selectedFromDate, 'ddd MMM DD YYYY HH:mm:ss [GMT]ZZ').utc().format()
            campaignName: search,
        })
        if (res.status) {
            setDataCount(res.count)
            setData(res.data)
            setIsLoading(false)
            // setLoading(false);
        } else {
            toast.error("Something went wrong")
            setIsLoading(false);
            // setIsLoading(false)
        }
    }
    const fetchMoreData = async () => {
        setIsLoadingMore(true)
        setPage(prev => prev + 1)
        let res = await getAPI("/bulksender/get", {
            wpClientId: _id,
            // createdAt:  moment(selectedFromDate, 'ddd MMM DD YYYY HH:mm:ss [GMT]ZZ').utc().format(),
            page: page
            // templateCategory: 
        })
        if (res.status) {
            //     console.log("res.", res.data);
            //    function removeDuplicatesByKey(array, key) {
            //         return [...new Map(array.map(item => [item[key], item])).values()];
            //       }
            //       let uniqueArray =  removeDuplicatesByKey(res.data, _id)
            //     setDataCount(res.count)
            setData([...data, ...res.data])
            setIsLoadingMore(false)
            // setLoading(false);
        } else {
            toast.error("Something went wrong")
            setIsLoadingMore(false);
            // setIsLoading(false)
        }
    }

    const openDialog = () => {
        setIsOpen(true);
    };

    const closeDialog = () => {
        setIsOpen(false);
    };
    return (
        <div className='p-1'>
            <Header name="Bulk Sender Details" />
            {/* Add Btn, filter btn search box */}
            <div className="w-full h-2/4 mt-5 p-1 ">
                <div className='flex justify-between py-2'>
                    <input type="text" id="input-email-label" className="py-1 h-10 px-4 block w-1/4  rounded-lg text-sm focus:outline-none bg-slate-200 justify-center items-center" autoComplete='off' onChange={(e) => setSearch(e.target.value)} placeholder="Search here" value={search} />
                    <div className='flex justify-end'>
                        <button type="button" onClick={() => setFilter(prev => !prev)} className="h-10 mx-1 py-1 px-4 flex justify-center items-center size-[45px] text-s font-regular rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600">
                            <FaFilter />
                        </button>
                        {/* <button onClick={() => setIsDrawerPricingOpen(true)} type="button" className="py-1 h-10 px-4 inline-flex items-center gap-x-2 text-sm rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600">
                            Add Plan
                        </button> */}
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
                                    data.map((item, index) => (
                                        <div className="flex flex-col bg-white border  shadow-m rounded-xl py-4 px-4" key={index} >
                                            <div className='flex justify-between'>
                                                <h3 className="text-lg font-bold cursor-pointer text-gray-800" onClick={() => {
                                                    setTemplateData(item)
                                                    setIsModelOpen(true)
                                                }}>
                                                    {item?.campaignName}
                                                </h3>
                                                <div className="flex gap-2 items-center">
                                                    <FaEye onClick={() => {
                                                        setBulkMasterId(item?._id)
                                                        setIsReportOpen(true)
                                                    }} className='text-lg text-blue-500 cursor-pointer' />
                                                </div>
                                            </div>
                                            <p className=" text-sm text-gray-500 dark:text-neutral-60">
                                                Category :- <span className='text-sm font-semibold text-black'>{item?.templateCategory}</span>
                                            </p>
                                            <p className=" text-sm text-gray-500 dark:text-neutral-60">
                                                Scheduled :- <span className='text-sm font-semibold text-black'>{item?.isScheduled ? "Yes" : "No"}</span>
                                            </p>
                                            <p className={`text-sm text-gray-500 dark:text-neutral-60`}>
                                                Scheduled At :- <span className='text-sm font-semibold text-black'>{item?.scheduledDateTime ? moment(item?.scheduledDateTime).format("DD-MMM-YYYY hh:mm A") : "NIL"}</span>
                                            </p>
                                            <p className={`text-sm text-gray-500 dark:text-neutral-60`}>
                                                Created At :- <span className='text-sm font-semibold text-black'>{moment(item?.createdAt).format("DD-MMM-YYYY hh:mm A")}</span>
                                            </p>
                                            {/* <div className='flex flex-row gap-2 justify-between mt-2'>
                                                <p className={`text-sm bg-purple-500 p-1 max-w-max text-white rounded-lg w-24 `}>
                                                    Total | <span className='font-semibold text-l'> {item?.pendingCount} </span>
                                                </p>
                                                <p className={`text-sm bg-yellow-500 p-1 max-w-max text-white rounded-lg w-24 `}>
                                                    Pending | {item?.pendingCount}
                                                </p>
                                               
                                                <p className={`text-sm bg-red-500 p-1 max-w-max text-white rounded-lg w-24 `}>
                                                    Failed | {item?.failedCount}
                                                </p>
                                            </div> */}
                                            <div className='flex flex-row justify-between mt-1'>
                                              
                                                <p className={`text-sm bg-green-500 p-1 max-w-max text-white rounded-lg w-24 `}>
                                                    Sent | {item?.sentCount}
                                                </p>
                                                <p className={`text-sm bg-yellow-300 p-1 max-w-max text-black rounded-lg w-24 `}>
                                                    Deliver  {item?.deliveredCount}
                                                </p>
                                                <p className={`text-sm bg-cyan-500 p-1 max-w-max text-white rounded-lg w-24 `}>
                                                    Read | {item?.readCount}
                                                </p>
                                                <p className={`text-sm bg-red-500 p-1 max-w-max text-white rounded-lg w-24 `}>
                                                    Fail | {item?.failedCount}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>

                            {
                                data.length < dataCount && <div className='flex flex-row justify-center mt-2 cursor-pointer' onClick={fetchMoreData}>
                                    {
                                        isLoadingMore ? <span className="animate-spin inline-block size-6 border-[2px] border-current border-t-transparent text-blue text-center rounded-full" aria-label="loading"></span> :
                                            <h4 className='text-lg text-center text-white rounded-lg self-center bg-blue-500 p-1 w-32'>Load More</h4>
                                    }
                                </div>
                            }


                        </> : isLoading ? <p className='text-2xl text-center'> <span className="animate-spin inline-block size-6 border-[2px] border-current border-t-transparent text-blue text-center rounded-full" aria-label="loading"></span></p> :
                            <h3 className='text-2xl text-center font-medium mt-1'>No Data Found</h3>
                }
                {/* <p className='mt-16 text-lg font-medium'>Total Records:- {data.length}</p> */}




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
                {
                    isReportOpen && <BulkSenderDetailReport drawerCondition={{ isReportOpen, setIsReportOpen }} bulkMasterId={bulkMasterId} />
                }
            </div>
        </div>
    )
}

export default BulkSenderDetails