import React, { useEffect, useState } from 'react'
import Header from '../components/Header'
import { FaFilter } from 'react-icons/fa6'
import Pagination from '../components/Pagination'
import { useSelector } from 'react-redux'
import { getAPI } from '../constants/constants'
import { toast } from 'react-toastify'
import moment from 'moment'
import DatepickerComponent from '../components/DatepickerComponent'

const MessageHistory = () => {

    const { _id } = useSelector(state => state.user.userData)
    const [filterString, setFilterString] = useState("")
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [dataCount, setDataCount] = useState(0);
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const [selectedFromDate, setSelectedFromDate] = useState(new Date())
    const [selectedToDate, setSelectedToDate] = useState(new Date())

    const [filter, setFilter] = useState(false)
    const [applyFilter, setFilterApply] = useState(false)

    let filterObject = {}
    if (filterString) {
        filterObject = {
            mobileNumber: filterString,
            templateName: filterString,
            sender: filterString,
            messageType: filterString,
            messageStatus: filterString,
            wpMessageId: filterString,
        }
    }
    const fetchData = async () => {
        setIsLoading(true)
        let res = await getAPI("/messageHistory/get", {
            wpClientId: _id,
            page: currentPage,
            limit: pageSize,
            ...filterObject,
            fromDate: moment(selectedFromDate, 'ddd MMM DD YYYY HH:mm:ss [GMT]ZZ').startOf('day').utc().format(),
            toDate: moment(selectedToDate, 'ddd MMM DD YYYY HH:mm:ss [GMT]ZZ').endOf('day').utc().format(),

        })
        if (res.status) {
            console.log("res.data", res.data);
            setDataCount(res.count)
            setData(res.data)
            setIsLoading(false)
        } else {
            toast.error("Something went wrong")
            setIsLoading(false);
        }
    }


    const onPageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };


    useEffect(() => {
        if (filterString.length > 0) {
            const timerId = setTimeout(fetchData, 1000);
            return () => {
                clearTimeout(timerId)
            }
        }
        fetchData()
    }, [currentPage, pageSize, filterString, applyFilter])


    const handleFromDateChange = (date) => {
        setSelectedFromDate(date);
    };

    const handleToDateChange = (date) => {
        setSelectedToDate(date);
    };

    return (
        <div className='p-1'>
            <Header name="Message History" />
            <div className="w-full h-2/4 mt-1 p-1 ">
                <div className='flex justify-between py-2 '>
                    <input type="text" id="input-email-label" value={filterString} onChange={(e) => setFilterString(e.target.value)} className="py-1 h-10 px-4 block w-1/4  rounded-lg text-sm focus:outline-none bg-gray-100 justify-center items-center" placeholder="Search here" autoComplete='off' />
                    <div className='flex justify-end'>
                        <button type="button" onClick={() => setFilter(prev => !prev)} className="h-10 mx-1 py-1 px-4 flex justify-center items-center size-[45px] text-s font-regular rounded-lg bg-blue-600 text-white">
                            <FaFilter />
                        </button>
                    </div>
                </div>

                {
                    filter &&
                    <div className='w-full h-auto p-2 bg-gray-100 rounded-md my-2 flex duration-300 gap-2'>
                        <div>
                            <label className='text-black  text-xs'>From Date</label>
                            <DatepickerComponent selectedDate={selectedFromDate} handleDateChange={handleFromDateChange} />
                        </div>
                        <div>
                            <label className='text-black text-xs'>To Date</label>
                            <DatepickerComponent selectedDate={selectedToDate} handleDateChange={handleToDateChange} />
                        </div>
                        <button className='text-white self-end text-sm h-[30px] py-1 hover:bg-blue-400 w-24 rounded-sm bg-blue-500' onClick={() => setFilterApply(prev => !prev)}>Apply</button>
                    </div>
                }
            </div>
            <div className="px-1">
                <div className="overflow-y-auto h-[380px]">
                    <div className="flex flex-col">
                        <div className="-m-1.5 ">
                            <div className="p-1.5 min-w-full inline-block align-middle">
                                <div className="overflow-hidden">
                                    <table className="min-w-full  divide-gray-200">
                                        <thead className="divide divide-gray-200">
                                            <tr className="border border-gray-200 bg-slate-400">
                                                <th scope="col" className="px-4 py-2 text-start text-xs font-semibold text-black uppercase border-r border-gray-200">Sender</th>
                                                <th scope="col" className="px-4 py-2 text-start text-xs font-semibold text-black uppercase border-r border-gray-200">Mobile No</th>
                                                <th scope="col" className="px-4 py-2 text-start text-xs font-semibold text-black uppercase border-r border-gray-200">Message DateTime</th>
                                                <th scope="col" className="px-4 py-2 text-start text-xs font-semibold text-black uppercase border-r border-gray-200">Template Name</th>
                                                <th scope="col" className="px-4 py-2 text-start text-xs font-semibold text-black uppercase border-r border-gray-200">Template Category</th>
                                                <th scope="col" className="px-4 py-2 text-start text-xs font-semibold  w-[200px] text-black uppercase border-r border-gray-200">Message Content</th>
                                                <th scope="col" className="px-4 py-2 text-start text-xs font-semibold text-black uppercase border-r border-gray-200">Status</th>
                                            </tr>
                                        </thead>

                                        <tbody className="divide divide-gray-200">

                                            {
                                                data.length > 0 ? data.map((item, index) => {
                                                    return (
                                                        <tr className="border border-gray-200" key={index}>
                                                            <td className="px-4 whitespace-nowrap text-xs text-gray-800 font-medium py-2 border border-gray-200">{item?.sender}</td>
                                                            <td className="px-4 whitespace-nowrap text-xs text-gray-800 font-medium py-2 border border-gray-200">{item?.mobileNumber}</td>
                                                            <td className="px-4 whitespace-nowrap text-xs text-gray-800 font-medium py-2 border border-gray-200">{item?.messageDateTime && moment(item?.messageDateTime).format("DD-MMM-YYYY hh:mm:ss A")}</td>
                                                            <td className="px-4 whitespace-nowrap text-xs text-gray-800 font-medium py-2 border border-gray-200">{item?.templateName}</td>
                                                            <td className="px-4 whitespace-nowrap text-xs text-gray-800 font-medium py-2 border border-gray-200">{item?.messageType}</td>
                                                            <td className="px-4 text-xs w-96 text-gray-800  font-medium py-2 border border-gray-200">{item?.messsageDetails}</td>
                                                            <td className="px-4 whitespace-nowrap text-center text-xs text-gray-800 font-medium py-2 border border-gray-200"><span className={`${item?.messageStatus === "failed" ? "bg-red-500" : item?.messageStatus === "sent" || item?.messageStatus === "received" ? "bg-green-500" : item?.messageStatus === "delivered" ? "bg-gray-400" : item?.messageStatus === "read" ? "bg-blue-400" : item?.messageStatus === "pending" ? "bg-yellow-300" : ""} rounded-md text-xs uppercase text-gray-800 font-medium mr-2 px-2.5 py-0.5 rounde`}>{item?.messageStatus}</span></td>
                                                        </tr>
                                                    )
                                                }) : <h4 className="text-center">No Data</h4>
                                            }
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
                    totalPages={Math.ceil(dataCount / pageSize)}
                    onPageChange={onPageChange}
                    setPageSize={setPageSize}
                />
            </div>
        </div>
    )
}

export default MessageHistory
