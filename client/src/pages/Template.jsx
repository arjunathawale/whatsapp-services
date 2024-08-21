import React, { useCallback, useEffect, useState } from 'react'
import Header from '../components/Header'
import { FaTrashArrowUp } from 'react-icons/fa6'
import DatepickerComponent from '../components/DatepickerComponent'
import { FaFilter, FaPlus } from 'react-icons/fa'
import TemplateForm from '../Forms/TemplateForm'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { createAPI, getAPI, loginAPI } from '../constants/constants'
import moment from 'moment'
import ShowTemplateModel from '../components/ShowTemplateModel'
import { MdCancel } from 'react-icons/md'
import { useNavigate } from 'react-router-dom'
import LoadingSpinner from '../components/LoadingSpinner'


const Template = () => {
    const { _id } = useSelector(state => state.user.userData)
    const { userCrendentials } = useSelector(state => state.user)
    const navigate = useNavigate()
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(12)
    const [filter, setFilter] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isDrawerTemplateOpen, setIsDrawerTemplateOpen] = useState(false)

    const [selectedFromDate, setSelectedFromDate] = useState(new Date())
    const [selectedToDate, setSelectedToDate] = useState(new Date())

    const [selectedData, setSelectedData] = useState({})
    const [templateData, setTemplateData] = useState({})
    const [isModelOpen, setIsModelOpen] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const [filterString, setFilterString] = useState("")

    const handleFromDateChange = (date) => {
        setSelectedFromDate(date);
    };
    const handleToDateChange = (date) => {
        setSelectedToDate(date);
    };

    const [loading, setLoading] = useState(false);
    const [categoryFilter, setCategoryFilter] = useState("")
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);


    const [statusFilter, setStatusFilter] = useState("")
    const [isStatusOpen, setIsStatusOpen] = useState(false);
    const [filterApply, setFilterApply] = useState(false);
    const [data, setData] = useState([])
    const [dataCount, setDataCount] = useState(0)
    let filterObject = {}
    if (filterString.length > 0 || categoryFilter.length > 0) {
        filterObject = {
            "templateName": filterString,
            "templateCategory": categoryFilter,
            // fromDate: moment(selectedFromDate, 'ddd MMM DD YYYY HH:mm:ss [GMT]ZZ').startOf('day').utc().format(),
            // toDate: moment(selectedToDate, 'ddd MMM DD YYYY HH:mm:ss [GMT]ZZ').endOf('day').utc().format(),
        }
    }


    useEffect(() => {
        let timerId = 0;
        setPage(1);
        if (filterString) {
            timerId = setTimeout(fetchData, 1000);
        } else {
            fetchData()
        }
        return () => {
            clearTimeout(timerId)
        }
    }, [isDrawerTemplateOpen, filterString, filterApply])


    const handleLoadMore = () => {
        if (data.length < dataCount) {
            setPage(prev => prev + 1)
        }
    }

    useEffect(() => {
        if (page > 1) fetchDataOnScroll()
    }, [page])

    const fetchData = async () => {
        setLoading(true);
        setIsLoading(true)
        let res = await getAPI("/template/get", {
            wpClientId: _id,
            ...filterObject,
            page: page,
            fbTemplateStatus: statusFilter,
            limit: limit
        })
        if (res.status) {
            setData(res.data)
            setDataCount(res.count)
            setIsLoading(false)
            setLoading(false);
        } else {
            toast.error("Something went wrong")
            setLoading(false);
            setIsLoading(false)
        }
    }
    const fetchDataOnScroll = async () => {
        setLoading(true);
        setIsLoading(true)
        let res = await getAPI("/template/get", {
            wpClientId: _id,
            ...filterObject,
            page: page,
            fbTemplateStatus: statusFilter,
            limit: 9
        })
        if (res.status) {
            setData((prev) => [...prev, ...res.data])
            setDataCount(res.count)
            setIsLoading(false)
            setLoading(false);
        } else {
            toast.error("Something went wrong")
            setLoading(false);
            setIsLoading(false)
        }
    }
    const [templateId, setTemplateId] = useState("")
    const [fbTemplateId, setFbTemplateId] = useState("")
    const [isDeleting, setIsDeleting] = useState(false)


    const deleteTemplate = async () => {
        setIsDeleting(true)
        const res = await createAPI("/template/deleteTemplate", {
            id: templateId,
            fbTemplateId: fbTemplateId,
            wpClientId: _id
        })
        if (res.status) {
            toast.success(res.message)
            fetchData()
            setIsDeleting(false)
            setIsOpen(false)
        } else {
            toast.error(res.message)
            setIsDeleting(false)
        }
    }

    const [isTemplateGetting, setIsTemplateGetting] = useState(false)
    const getTemplateMeta = async () => {
        setIsTemplateGetting(true)
        const res = await createAPI("/template/getFBTemplate", { wpClientId: _id })
        if (res.status) {
            toast.success(res.message)
            setPage(1)
            fetchData()
            setIsTemplateGetting(false)
        } else {
            toast.error(res.message)
            setIsTemplateGetting(false)
        }
    }



    // useEffect(() => {
    //     const observer = new IntersectionObserver((entries) => {
    //         if (entries[0]?.isIntersecting) {
    //             console.log("Intersecting" ,data.length, dataCount);
    //             if (data.length < dataCount) setPage((prevPage) => prevPage + 1);
    //             observer.unobserve(lastCard);
    //         }
    //     }, { threshold: 0.5 })

    //     const lastCard = document.querySelector('.templateCard:last-child');
    //     if (!lastCard) {
    //         return;
    //     }
    //     observer.observe(lastCard)
    //     return () => {
    //         if (lastCard) observer.unobserve(lastCard)
    //         observer.disconnect()
    //     }
    // }, [data])
    return (
        <div className='p-1'>
            <div className="sticky top-0 bg-white z-10">
                <Header name="Templates" />
            </div>
            {Object.keys(userCrendentials).length === 0 ?
                <div className="flex items-center justify-center min-h-[90vh] p-6">
                    <div className="text-center p-10 max-w-md mx-auto bg-white rounded-xl shadow-md space-y-4 transition transform duration-500 ease-in-out hover:scale-105">
                        <div className="">
                            <h2 className="text-lg text-gray-900 font-medium mb-2 ">You have not updated your meta credentials</h2>
                            <button className="mt-1 px-4 text-sm py-1 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-700 outline-none transition duration-300" onClick={() => navigate("/profile")}>
                                Update Detail
                            </button>
                        </div>
                    </div>
                </div> :
                <div className="w-full h-2/4 mt-5 p-1 ">

                    <div className='flex justify-between py-2'>
                        <input type="text" id="input-email-label" value={filterString} onChange={(e) => setFilterString(e.target.value)} className="py-1 h-10 px-4 block w-1/4  rounded-lg text-sm focus:outline-none bg-gray-100 justify-center items-center" autoComplete='off' placeholder="Search here" />
                        <div className='flex justify-end'>
                            <button type="button" onClick={getTemplateMeta} className="h-10 mx-1 py-1 px-4 flex justify-center items-center size-[50px] text-s font-regular rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600">
                                {
                                    isTemplateGetting ? <span className="animate-spin inline-block size-4 border-[2px] border-current border-t-transparent text-white rounded-full" role="status" aria-label="loading"></span> : <FaPlus />
                                }
                            </button>
                            <button type="button" onClick={() => setFilter(prev => !prev)} className="h-10 mx-1 py-1 px-4 flex justify-center items-center size-[45px] text-s font-regular rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600">
                                <FaFilter />
                            </button>
                            <button onClick={() => setIsDrawerTemplateOpen(true)} type="button" className="py-1 h-10 px-4 inline-flex items-center gap-x-2 text-sm rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600">
                                New Template
                            </button>
                        </div>
                    </div>
                    {
                        filter &&
                        <div className={`w-full relative ${isCategoryOpen || isStatusOpen ? "h-44" : "h-12"} p-2 bg-gray-100 my-2 rounded-md flex duration-300 gap-2 ease-in-out`}>
                            {/* <div>
                            <DatepickerComponent selectedDate={selectedFromDate} handleDateChange={handleFromDateChange} />
                        </div>
                        <div >
                            <DatepickerComponent selectedDate={selectedToDate} handleDateChange={handleToDateChange} />
                        </div> */}
                            <div className="inline-block text-left">
                                <div>
                                    <button
                                        onClick={() => {
                                            setIsStatusOpen(false)
                                            setIsCategoryOpen(!isCategoryOpen)
                                        }}
                                        type="button"
                                        className="inline-flex h-8 py-1 justify-center w-full  rounded-md border border-gray-300 shadow-sm px-4 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                                        id="menu-button"
                                        aria-expanded="true"
                                        aria-haspopup="true"
                                    >
                                        {categoryFilter.length == 0 ? "Category" : categoryFilter}
                                        {categoryFilter.length > 0 && <MdCancel className='text-red-400 ml-2 text-m justify-center items-center  self-center' onClick={() => {
                                            setCategoryFilter("")
                                        }} />
                                        }
                                        <svg
                                            className="-mr-1 h-5 w-5"
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                            aria-hidden="true"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M5.293 7.707a1 1 0 011.414 0L10 11.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </button>
                                </div>

                                {isCategoryOpen && (
                                    <div
                                        className="origin-top-right absolute mt-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                                        role="menu"
                                        aria-orientation="vertical"
                                        aria-labelledby="menu-button"
                                        tabIndex="-1"
                                    >
                                        <div className="py-1" role="none">
                                            <a
                                                href="#"
                                                className="text-gray-700 block px-4 py-2 text-sm"
                                                role="menuitem"
                                                tabIndex="-1"
                                                id="menu-item-0"
                                                onClick={() => {
                                                    setCategoryFilter("UTILITY")
                                                    setIsCategoryOpen(false)
                                                }}
                                            >
                                                UTILITY
                                            </a>
                                            <a
                                                href="#"
                                                className="text-gray-700 block px-4 py-2 text-sm"
                                                role="menuitem"
                                                tabIndex="-1"
                                                id="menu-item-1"
                                                onClick={() => {
                                                    setCategoryFilter("MARKETING")
                                                    setIsCategoryOpen(false)
                                                }}

                                            >
                                                MARKETING
                                            </a>
                                            <a
                                                href="#"
                                                className="text-gray-700 block px-4 py-2 text-sm"
                                                role="menuitem"
                                                tabIndex="-1"
                                                id="menu-item-2"
                                                onClick={() => {
                                                    setCategoryFilter("AUTHENTICATION")
                                                    setIsCategoryOpen(false)
                                                }}

                                            >
                                                AUTHENTICATION
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>


                            <div className="inline-block text-left">
                                <div>
                                    <button
                                        onClick={() => {
                                            setIsCategoryOpen(false)
                                            setIsStatusOpen(!isStatusOpen)
                                        }}
                                        type="button"
                                        className="inline-flex h-8 py-1 justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                                        id="menu-button"
                                        aria-expanded="true"
                                        aria-haspopup="true"
                                    >
                                        {statusFilter.length == 0 ? "Template Status" : statusFilter}
                                        {statusFilter.length > 0 && <MdCancel className='text-red-400 ml-2 text-m justify-center items-center  self-center' onClick={() => {
                                            setStatusFilter("")
                                        }} />
                                        }
                                        <svg
                                            className="-mr-1 h-5 w-5"
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                            aria-hidden="true"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M5.293 7.707a1 1 0 011.414 0L10 11.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </button>
                                </div>

                                {isStatusOpen && (
                                    <div
                                        className="origin-top-right absolute mt-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                                        role="menu"
                                        aria-orientation="vertical"
                                        aria-labelledby="menu-button"
                                        tabIndex="-1"
                                    >
                                        <div className="py-1" role="none">
                                            <a
                                                href="#"
                                                className="text-gray-700 block px-4 py-2 text-sm"
                                                role="menuitem"
                                                tabIndex="-1"
                                                id="menu-item-0"
                                                onClick={() => {
                                                    setStatusFilter("PENDING")
                                                    setIsStatusOpen(false)
                                                }}
                                            >
                                                PENDING
                                            </a>
                                            <a
                                                href="#"
                                                className="text-gray-700 block px-4 py-2 text-sm"
                                                role="menuitem"
                                                tabIndex="-1"
                                                id="menu-item-1"
                                                onClick={() => {
                                                    setStatusFilter("APPROVED")
                                                    setIsStatusOpen(false)
                                                }}

                                            >
                                                APPROVED
                                            </a>
                                            <a
                                                href="#"
                                                className="text-gray-700 block px-4 py-2 text-sm"
                                                role="menuitem"
                                                tabIndex="-1"
                                                id="menu-item-2"
                                                onClick={() => {
                                                    setStatusFilter("REJECTED")
                                                    setIsStatusOpen(false)
                                                }}

                                            >
                                                REJECTED
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className='flex justify-end'>
                                <button onClick={() => {
                                    setFilterApply(!filterApply)
                                    setFilter(false)
                                    }} className='text-white text-sm h-[30px] py-1 w-24 rounded-sm bg-blue-500'>Apply</button>
                            </div>
                        </div>
                    }
                    {
                        data && data.length > 0 ?
                            <>
                                <div className="grid grid-cols-3 gap-4" >
                                    {
                                        data.map(item => (
                                            <div className="flex flex-col templateCard bg-white border shadow-lg rounded-xl p-4 md:p-5 transition-transform transform hover:scale-105 duration-200" key={item._id}>
                                                <div className='flex justify-between items-start'>
                                                    <h3
                                                        className="text-lg font-bold cursor-pointer text-gray-800 break-words hover:text-blue-600 transition-colors"
                                                        onClick={() => {
                                                            setTemplateData(item);
                                                            setIsModelOpen(true);
                                                        }}>
                                                        {item?.templateName}
                                                    </h3>
                                                    <div className="flex gap-3 items-center">
                                                        <FaTrashArrowUp
                                                            onClick={() => {
                                                                setTemplateId(item?._id);
                                                                setFbTemplateId(item?.fbTemplateId);
                                                                setIsOpen(true);
                                                            }}
                                                            className='text-xl text-red-500 hover:text-red-700 cursor-pointer transition-colors'
                                                        />
                                                        {/* Add any additional icons here if needed */}
                                                    </div>
                                                </div>
                                                <div className="mt-2 space-y-1">
                                                    <p className="text-sm font-medium text-gray-500">
                                                        Category: <span className="font-semibold text-gray-800">{item?.templateCategory}</span>
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        Language: <span className="font-semibold text-gray-800">{item?.languages}</span>
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        Template Id: <span className="font-semibold text-gray-800">{item?.fbTemplateId}</span>
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        Created At: <span className="font-semibold text-gray-800">{moment(item?.submittedAt).format("DD-MMM-YYYY hh:mm A")}</span>
                                                    </p>
                                                    <p className={`text-xs font-semibold p-1 max-w-max rounded-lg ${item?.fbTemplateStatus === "APPROVED" ? "bg-green-500 text-white" : item?.fbTemplateStatus === "PENDING" ? "bg-yellow-400 text-white" : item?.fbTemplateStatus === "REJECTED" ? "bg-red-400 text-white" : "bg-gray-300 text-black"}`}>
                                                        Status: {item?.fbTemplateStatus}
                                                    </p>
                                                </div>
                                            </div>

                                        ))
                                    }


                                </div>
                                {
                                    data.length < dataCount &&
                                    <div className='flex justify-center mt-5'>
                                        <button className='text-white text-sm h-[30px] py-1 w-24 rounded-lg bg-blue-500' onClick={handleLoadMore}>Load More</button>
                                    </div>
                                }
                            </> : isLoading ? <LoadingSpinner /> : <h3 className='text-xl text-center font-regular mt-1'>No Template Found</h3>

                    }
                    {isOpen && (
                        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
                            <div className="bg-white rounded-lg p-4">
                                <span className="absolute top-0 right-0 cursor-pointer" onClick={() => setIsOpen(false)}>&times;aaa</span>
                                <p>Are you sure you want to delete this template?</p>
                                <div className="flex justify-end gap-2 fixed inset-x-2 bottom-2">
                                </div>
                                <div className='mt-1 flex justify-end gap-2'>
                                    <button type="button" onClick={() => {
                                        setTemplateId("")
                                        setFbTemplateId("")
                                        setIsOpen(false)
                                    }} className="py-1  px-4 inline-flex items-center gap-x-2 text-xs  rounded-lg border border-transparent bg-red-500 text-white hover:bg-gray-700 disabled:opacity-50 disabled:pointer-events-none dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600" >
                                        Close
                                    </button>
                                    <button type="button" onClick={deleteTemplate} className="py-1  px-4 inline-flex items-center gap-x-2 text-xs  rounded-lg border border-transparent bg-blue-400 text-white hover:bg-gray-700 disabled:opacity-50 disabled:pointer-events-none dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600" >
                                        {
                                            isDeleting && <span className="animate-spin inline-block size-4 border-[2px] border-current border-t-transparent text-white rounded-full" role="status" aria-label="loading"></span>
                                        }
                                        Sure
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    <ShowTemplateModel isOpen={isModelOpen} onClose={() => setIsModelOpen(false)} data={templateData} />

                </div>
            }
            {
                isDrawerTemplateOpen && <TemplateForm drawerCondition={{ isDrawerTemplateOpen, setIsDrawerTemplateOpen }} btnName="Add Credential" data={selectedData} />
            }
        </div>
    )
}

export default Template