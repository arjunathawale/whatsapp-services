import React, { useCallback, useEffect, useState } from 'react'
import Header from '../components/Header'
import { FaTrashArrowUp, FaGear } from 'react-icons/fa6'
import DatepickerComponent from '../components/DatepickerComponent'
import { FaArrowCircleDown, FaArrowDown, FaChevronDown, FaEdit, FaEye, FaFilter, FaPlus, FaShoppingBag, FaSortDown } from 'react-icons/fa'
import TemplateForm from '../Forms/TemplateForm'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { createAPI, deleteAPI, getAPI } from '../constants/constants'
import moment from 'moment'
import ShowTemplateModel from '../components/ShowTemplateModel'
import { MdCancel } from 'react-icons/md'


const Template = () => {
    const { _id } = useSelector(state => state.user.userData)
    const [page, setPage] = useState(1)
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

    // const data = []
    // const data = [1, 2, 3]

    const [categoryFilter, setCategoryFilter] = useState("")
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const [filterApply, setFilterApply] = useState(false);
    const [data, setData] = useState([])
    let filterObject = {}
    if (filterString.length > 0 || categoryFilter.length > 0 || selectedToDate) {
        filterObject = {
            "templateName": filterString,
            "templateCategory": categoryFilter,
            // "toDate": moment(selectedToDate).utcOffset("+05:30").format("YYYY-MM-DDT23:59:59 Z")
            // "panNo": filterString,
            // "gstNo": filterString,
            // "mobileNo": filterString,
            // "emailId": filterString,
            // "address": filterString
        }
    }
    useEffect(() => {
        fetchData()
    }, [isDrawerTemplateOpen, filterString, page, filterApply])

    const fetchData = async () => {
        // let filterObject = {}
        setLoading(true);
        setIsLoading(true)
        let res = await getAPI("/template/get", {
            wpClientId: _id,
            ...filterObject,
            page: page
            // fbTemplateStatus: "APPROVED"
            // templateCategory: 
        })
        if (res.status) {
            setData(res.data)
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
            fetchData()
            setIsTemplateGetting(false)
        } else {
            toast.error(res.message)
            setIsTemplateGetting(false)
        }
    }

    const handleScroll = useCallback(() => {
        if (window.innerHeight + document.documentElement.scrollTop !== document.documentElement.offsetHeight || loading) return;
        setPage((prevPage) => prevPage + 1);
    }, [loading]);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    console.log("page", page);


    return (
        <div className='p-1'>
            <Header name="Templates" />
            <div className="w-full h-2/4 mt-5 p-1 ">
                <div className='flex justify-between py-2'>
                    <input type="text" id="input-email-label" value={filterString} onChange={(e) => setFilterString(e.target.value)} className="py-1 h-10 px-4 block w-1/4  rounded-lg text-sm focus:outline-none bg-slate-200 justify-center items-center" placeholder="Search here" />
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
                    <div className='w-full h-12 p-2 bg-slate-500 my-2 flex duration-300 gap-2'>
                        <div>
                            <DatepickerComponent selectedDate={selectedFromDate} handleDateChange={handleFromDateChange} />
                        </div>
                        <div >
                            <DatepickerComponent selectedDate={selectedToDate} handleDateChange={handleToDateChange} />
                        </div>
                        <div className="inline-block text-left">
                            <div>
                                <button
                                    onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                                    type="button"
                                    className="inline-flex h-8 py-1 justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
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

                        <div className='flex justify-end'>
                            <button onClick={() => setFilterApply(!filterApply)} className='text-white text-sm h-8 py-1 w-24 rounded-sm bg-blue-500'>Apply</button>
                        </div>
                    </div>
                }
                {
                    data && data.length > 0 ?
                        <>
                            <div className="grid grid-cols-3 gap-4 overflow-auto">
                                {
                                    data.map(item => (
                                        <div className="flex flex-col bg-white border  shadow-m rounded-xl p-4 md:p-5" key={item._id} >
                                            <div className='flex justify-between'>
                                                <h3 className="text-lg font-bold cursor-pointer text-gray-800" onClick={() => {
                                                    setTemplateData(item)
                                                    setIsModelOpen(true)
                                                }}>
                                                    {item?.templateName}
                                                </h3>
                                                <div className="flex gap-2 items-center">
                                                    <FaTrashArrowUp onClick={() => {
                                                        setTemplateId(item?._id)
                                                        setFbTemplateId(item?.fbTemplateId)
                                                        setIsOpen(true)
                                                    }} className='text-lg text-red-500 cursor-pointer' />
                                                    {/* <FaEye onClick={() => setIsOpen(true)} className='text-xl text-green-500 cursor-pointer' /> */}
                                                    {/* <FaShoppingBag className='text-xl text-blue-500 cursor-pointer' onClick={() => setIsPricingOpen(true)} /> */}
                                                    {/* <FaGear onClick={() => {
                                                        setSelectedData({})
                                                        setIsDrawerCredentialOpen(true)
                                                    }} className='text-xl text-gray-500 cursor-pointer' />
                                                    <FaEdit className='text-xl text-green-500 cursor-pointer' onClick={() => setIsDrawerOpen(true)} /> */}
                                                </div>
                                            </div>
                                            <p className="mt-0 text-sm font-medium text-gray-500 dark:text-neutral-500">
                                                {item?.templateCategory}
                                            </p>
                                            <p className=" text-sm text-gray-500 dark:text-neutral-60">
                                                {item?.languages}
                                            </p>
                                            <p className=" text-sm uppercase text-gray-500 dark:text-neutral-60">
                                                {item?.fbTemplateId}
                                            </p>
                                            <p className={`text-sm text-gray-500 dark:text-neutral-60`}>
                                                {moment(item?.submittedAt).format("DD-MMM-YYYY hh:mm A")}
                                            </p>
                                            <p className={`text-sm ${item?.fbTemplateStatus == "APPROVED" ? "bg-green-500 p-1 max-w-max text-white rounded-lg text-xs" : item?.fbTemplateStatus == "PENDING" ? " bg-yellow-400 p-1 max-w-max text-white rounded-lg text-xs" : item?.fbTemplateStatus == "REJECTED" ? " bg-red-400 p-1 max-w-max text-white rounded-lg text-xs" : ""} text-gray-500 dark:text-neutral-60`}>
                                                {item?.fbTemplateStatus}
                                            </p>
                                        </div>
                                    ))
                                }
                            </div>
                        </> : isLoading ? <div className="flex justify-center items-center"> <span className="animate-spin inline-block size-6 border-[2px] border-current border-t-transparent text-blue items-center rounded-full" role="status" aria-label="loading"></span></div> :
                            <h3 className='text-2xl text-center font-medium mt-1'>No Template Found</h3>

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
            {
                isDrawerTemplateOpen && <TemplateForm drawerCondition={{ isDrawerTemplateOpen, setIsDrawerTemplateOpen }} btnName="Add Credential" data={selectedData} />
            }
            {/* {
                isModelOpen && <ShowTemplateModel />
            } */}
        </div>
    )
}

export default Template