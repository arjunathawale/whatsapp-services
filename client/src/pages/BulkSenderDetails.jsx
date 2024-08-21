import React, { useEffect } from 'react'
import Header from '../components/Header'
import { FaFilter } from 'react-icons/fa6'
import { useState } from 'react'
import DatepickerComponent from '../components/DatepickerComponent'
import { FaEye } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { useSelector } from 'react-redux'
import { getAPI } from '../constants/constants'
import moment from 'moment'
import BulkSenderDetailReport from '../Forms/BulkSenderDetailReport'
import LoadingSpinner from '../components/LoadingSpinner'


const BulkSenderDetails = () => {

    const { _id } = useSelector(state => state.user.userData)
    const [page, setPage] = useState(1)

    const [filter, setFilter] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [isLoadingMore, setIsLoadingMore] = useState(false)
    const [isReportOpen, setIsReportOpen] = useState(false)
    const [bulkMasterId, setBulkMasterId] = useState('')

    const [selectedFromDate, setSelectedFromDate] = useState(new Date())
    const [selectedToDate, setSelectedToDate] = useState(new Date())

    const [applyFilter, setFilterApply] = useState(false)
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

    useEffect(() => {
        if (search.length > 0) {
            const timerId = setTimeout(fetchData, 1000);
            return () => {
                clearTimeout(timerId)
            }
        }
        fetchData()

    }, [applyFilter, search])

    const fetchData = async () => {

        setIsLoading(true)

        let res = await getAPI("/bulksender/get", {
            wpClientId: _id,
            fromDate: moment(selectedFromDate, 'ddd MMM DD YYYY HH:mm:ss [GMT]ZZ').startOf('day').utc().format(),
            toDate: moment(selectedToDate, 'ddd MMM DD YYYY HH:mm:ss [GMT]ZZ').endOf('day').utc().format(),
            campaignName: search
        })
        if (res.status) {
            setDataCount(res.count)
            setData(res.data)
            setIsLoading(false)
        } else {
            toast.error("Something went wrong")
            setIsLoading(false);
        }
    }

    const fetchMoreData = async () => {
        setIsLoadingMore(true)
        setPage(prev => prev + 1)
        let res = await getAPI("/bulksender/get", {
            wpClientId: _id,
            fromDate: moment(selectedFromDate, 'ddd MMM DD YYYY HH:mm:ss [GMT]ZZ').startOf('day').utc().format(),
            toDate: moment(selectedToDate, 'ddd MMM DD YYYY HH:mm:ss [GMT]ZZ').endOf('day').utc().format(),
            page: page
            // templateCategory: 
        })
        if (res.status) {
            setData([...data, ...res.data])
            setIsLoadingMore(false)
        } else {
            toast.error("Something went wrong")
            setIsLoadingMore(false);
        }
    }

    const openDialog = () => {
        setIsOpen(true);
    };

    const closeDialog = () => {
        setIsOpen(false);
    };


    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0]?.isIntersecting) {
                observer.unobserve(lastCard);
                if (data.length < dataCount) {
                    fetchMoreData()
                }
            }
        }, { threshold: 0.5 })

        const lastCard = document.querySelector('.detail-card:last-child');
        if (!lastCard) {
            return;
        }
        observer.observe(lastCard)

        return () => {
            if (lastCard) observer.unobserve(lastCard)
            observer.disconnect()
        }
    }, [data])



    return (
        <div className='p-1'>
            <div className="sticky top-0 bg-white z-10">
                <Header name="Bulk Sender Details" />
            </div>
            {/* Add Btn, filter btn search box */}
            <div className="w-full h-2/4 mt-5 p-1 ">
                <div className='flex justify-between py-2'>
                    <input type="text" id="input-email-label" className="py-1 h-10 px-4 block w-1/4  rounded-lg text-sm focus:outline-none bg-gray-100 justify-center items-center" autoComplete='off' onChange={(e) => setSearch(e.target.value)} placeholder="Search here" value={search} />
                    <div className='flex justify-end'>
                        <button type="button" onClick={() => setFilter(prev => !prev)} className="h-10 mx-1 py-1 px-4 flex justify-center items-center size-[45px] text-s font-regular rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600">
                            <FaFilter />
                        </button>
                    </div>
                </div>
                {/* Filterr */}
                {
                    filter &&
                    <div className='w-full h-auto p-2 bg-gray-100 rounded-md my-2 flex duration-1000 transition-all gap-2'>
                        <div>
                            <label className='text-black  text-xs'>From Date</label>
                            <DatepickerComponent selectedDate={selectedFromDate} handleDateChange={handleFromDateChange} />
                        </div>
                        <div>
                            <label className='text-black text-xs'>To Date</label>
                            <DatepickerComponent selectedDate={selectedToDate} handleDateChange={handleToDateChange} />
                        </div>
                        <button className='text-white self-end text-sm h-[30px] py-1 hover:bg-blue-400 w-24 rounded-sm bg-blue-500' onClick={() => {
                            setFilterApply(prev => !prev)
                            setFilter(false)
                            setPage(1)
                        }}>Apply</button>
                    </div>
                }
                {
                    data && data.length > 0 ?
                        <>
                            <div className="grid grid-cols-3 gap-4">
                                {
                                    data.map((item, index) => (
                                        <div className="flex flex-col bg-white border shadow-lg rounded-xl py-5 px-5 transition-transform transform hover:scale-105  duration-200 detail-card overflow-hidden" key={index}>
                                            <div className='flex justify-between items-center mb-3'>
                                                <h3
                                                    className="text-lg font-bold cursor-pointer text-gray-800 hover:text-blue-600 transition-colors"
                                                    onClick={() => {
                                                        setTemplateData(item);
                                                        setIsModelOpen(true);
                                                    }}
                                                >
                                                    {item?.campaignName}
                                                </h3>
                                                <FaEye
                                                    onClick={() => {
                                                        setBulkMasterId(item?._id);
                                                        setIsReportOpen(true);
                                                    }}
                                                    className='text-xl text-blue-500 hover:text-blue-700 cursor-pointer transition-colors'
                                                />
                                            </div>
                                            <p className="text-sm text-gray-600">
                                                <span className="font-medium text-gray-800">Category:</span>
                                                <span className='font-semibold text-black'> {item?.templateCategory}</span>
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                <span className="font-medium text-gray-800">Scheduled:</span>
                                                <span className='font-semibold text-black'> {item?.isScheduled ? "Yes" : "No"}</span>
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                <span className="font-medium text-gray-800">Scheduled At:</span>
                                                <span className='font-semibold text-black'> {item?.scheduledDateTime ? moment(item?.scheduledDateTime).format("DD-MMM-YYYY hh:mm:ss A") : "NIL"}</span>
                                            </p>
                                            <p className="text-sm text-gray-600 mb-3">
                                                <span className="font-medium text-gray-800">Sent Date:</span>
                                                <span className='font-semibold text-black'> {moment(item?.createdAt).format("DD-MMM-YYYY hh:mm:ss A")}</span>
                                            </p>
                                            <div className='grid grid-cols-2 gap-2'>
                                                <p className="text-sm bg-green-500 py-1 text-center text-white rounded-lg flex items-center justify-center">
                                                    Sent | {item?.sentCount}
                                                </p>
                                                <p className="text-sm bg-yellow-300 py-1 text-center text-black rounded-lg flex items-center justify-center">
                                                    Delivered | {item?.deliveredCount}
                                                </p>
                                                <p className="text-sm bg-cyan-500 py-1 text-center text-white rounded-lg flex items-center justify-center">
                                                    Read | {item?.readCount}
                                                </p>
                                                <p className="text-sm bg-red-500 py-1 text-center text-white rounded-lg flex items-center justify-center">
                                                    Failed | {item?.failedCount}
                                                </p>
                                            </div>


                                        </div>


                                    ))
                                }
                            </div>

                            {/* {
                                data.length < dataCount && <div className='flex flex-row justify-center mt-2 cursor-pointer' onClick={fetchMoreData}>
                                    {
                                        isLoadingMore ? <span className="animate-spin inline-block size-6 border-[2px] border-current border-t-transparent text-blue text-center rounded-full" aria-label="loading"></span> :
                                            <h4 className='text-lg text-center text-white rounded-lg self-center bg-blue-500 p-1 w-32'>Load More</h4>
                                    }
                                </div>
                            } */}


                        </> : isLoading ? <LoadingSpinner /> : <h3 className='text-xl text-center font-regular mt-1'>No Data Found</h3>
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
                {
                    isReportOpen && <BulkSenderDetailReport drawerCondition={{ isReportOpen, setIsReportOpen }} bulkMasterId={bulkMasterId} />
                }
            </div>
        </div>
    )
}

export default BulkSenderDetails