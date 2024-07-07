import React, { useState, useRef, useEffect } from 'react';
import { FaWindowClose } from "react-icons/fa";
import Pagination from '../components/Pagination';
import { toast } from 'react-toastify';
import { getAPI } from '../constants/constants';
import { useSelector } from 'react-redux'
import moment from 'moment';


const BulkSenderDetailReport = ({ drawerCondition, bulkMasterId }) => {
  const { _id } = useSelector(state => state.user.userData)
  const [loadingSpin, setLoadingSpin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState([]);

  const drawerRef = useRef(null);
  const toggleDrawer = () => {
    drawerCondition.setIsReportOpen(false);
  };

  const handleClickOutside = (event) => {
    if (drawerRef.current && !drawerRef.current.contains(event.target)) {
      drawerCondition.setIsReportOpen(false);
    }
  };




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
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [dataCount, setDataCount] = useState(0);


  const onPageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const fetchData = async () => {

    setIsLoading(true)

    let res = await getAPI("/bulkSenderDetail/get", {
      // wpClientId: _id,
      bulkMasterId: bulkMasterId,
      page: currentPage,
      limit: pageSize
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

  useEffect(() => {
    fetchData()
  }, [currentPage, pageSize])


  return (
    <div ref={drawerRef} className={`fixed inset-y-0 right-0 z-10 w-[80.60%] bg-white border-l border-gray-300 shadow-lg ${drawerCondition.isReportOpen ? 'block' : 'hidden'}`}>
      <div className="flex justify-between p-4">
        <h4 className="text-black text-xl font-medium">Bulk Sender Detail</h4>
        <button onClick={toggleDrawer} className="text-black hover:text-red-500 hover:scale-110 duration-200 text-2xl">
          <FaWindowClose />
        </button>
      </div>
      <div className="px-4">
        <div className=" overflow-y-auto h-[450px]">
          <div className="flex flex-col">
            <div className="-m-1.5 ">
              <div className="p-1.5 min-w-full inline-block align-middle">
                <div className="overflow-hidden">
                  <table className="min-w-full divide-gray-200">
                    <thead className="divide divide-gray-200">
                      <tr className="border border-gray-200 bg-slate-400">
                        <th scope="col" className="px-2 py-2 text-start text-sm font-medium text-black uppercase border border-gray-200 ">Mobile No</th>
                        <th scope="col" className="px-2 py-2 text-start text-sm font-medium text-black uppercase border border-gray-200">Send Datetime</th>
                        <th scope="col" className="px-2 py-2 text-start text-sm font-medium text-black uppercase border border-gray-200">Sent Datetime</th>
                        <th scope="col" className="px-2 py-2 text-start text-sm font-medium text-black uppercase border border-gray-200">Delivered Datetime</th>
                        <th scope="col" className="px-2 py-2 text-start text-sm font-medium text-black uppercase border border-gray-200">Read Datetime</th>
                        <th scope="col" className="px-2 py-2 text-start text-sm font-medium text-black uppercase border border-gray-200">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-gray-200">
                      {
                        data.length > 0 ? data.map((item, index) => {
                          return (
                            <tr key={index} className='border border-gray-200'>
                              <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-800 font-medium border border-gray-200">{item?.mobileNumber}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-800 font-medium border border-gray-200">{item?.createdAt && moment(item?.createdAt).format("DD-MMM-YYYY hh:mm:ss A")}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-800 font-medium border border-gray-200">{item?.sentDateTime && moment(item?.sentDateTime).format("DD-MMM-YYYY hh:mm:ss A")}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-800 font-medium border border-gray-200">{item?.deliveredDateTime && moment(item?.deliveredDateTime).format("DD-MMM-YYYY hh:mm:ss A")}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-800 font-medium border border-gray-200">{item?.seenDateTime && moment(item?.seenDateTime).format("DD-MMM-YYYY hh:mm:ss A")}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-xs text-center text-gray-800 font-medium border border-gray-200"><span className={`${item?.messageStatus === "failed" ? "bg-red-500" : item?.messageStatus === "sent" ? "bg-green-500" : item?.messageStatus === "delivered" ? "bg-yellow-300" : item?.messageStatus === "read" ? "bg-blue-400" : item?.messageStatus === "pending" ? "bg-yellow-300" : ""} rounded-md text-sm uppercase text-gray-800 font-medium mr-2 px-2.5 py-0.5 rounde`}>{item?.messageStatus}</span></td>
                            </tr>
                          )
                        }) : ""
                      }

                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='-mt-1'>

        <Pagination
          currentPage={currentPage}
          pageSize={pageSize}
          totalPages={Math.ceil(dataCount / pageSize)}
          onPageChange={onPageChange}
          setPageSize={setPageSize}
          />
          </div>
      </div>
    </div >
  );
}

export default BulkSenderDetailReport
