import React, { useEffect, useState } from 'react'
import Header from '../components/Header'
import { createAPI, deleteAPI, FILE_BASE_URL, fileUploadAPI, getAPI } from '../constants/constants';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { FaEye, FaFilter, FaRegCopy, FaTrash } from 'react-icons/fa';
import moment from 'moment';
import { SiMicrosoftexcel } from "react-icons/si";
import { FaFilePdf } from "react-icons/fa";
import { IoVideocamOutline } from "react-icons/io5";
import { FaRegFileImage } from "react-icons/fa";
import { IoMdVideocam } from 'react-icons/io';
import LoadingSpinner from '../components/LoadingSpinner';
import Pagination from '../components/Pagination';

function formatBytes(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const size = (bytes / Math.pow(1024, i)).toFixed(2);
    return `${size} ${sizes[i]}`;
}



const ManageFiles = () => {

    const { _id } = useSelector(state => state.user.userData)
    const storageLimit = 104857600;
    const [filterString, setFilterString] = useState("")
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false)
    const [totalUsed, setTotalUsed] = useState(0)
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10);
    const [dataCount, setDataCount] = useState(0)
    const [uploadProgress, setUploadProgress] = useState(0)



    const handleFileChange = async (event) => {
        const mimTypeArray = ["image/jpeg", "image/png", "application/pdf", "video/mp4"]

        if ((event.target.files[0].size + totalUsed) > storageLimit) {
            toast.info("Storage limit reached")
            return;
        }
        if (mimTypeArray.includes(event.target.files[0].type)) {
            const fileData = {
                "file": event.target.files[0],
            }

            let originalName = event.target.files[0].name,
                type = event.target.files[0].name.split('.')[1],
                fileSize = event.target.files[0].size;

            const data = await fileUploadAPI('/upload/clientMediaFiles', fileData, setUploadProgress)
            if (data.status) {
                let newName = data.fileName;
                const saveData = await createAPI('/manageFiles/create', {
                    wpClientId: _id,
                    fileOriginalName: originalName,
                    fileNewName: newName,
                    fileType: type,
                    fileSize: fileSize
                })

                if (saveData.status) {
                    setUploadProgress(0)
                    toast.success("File Uploaded Successfully")
                    getData()
                } else {
                    toast.error("File Upload Failed")
                }
            } else {
                toast.error("File Upload Failed")
            }
        } else {
            toast.info("Select only jpeg or png image, mp4 video file or pdf files")
        }

    };

    const handleDeleteFile = () => {
        document.getElementById('fileInput').value = '';
    };



    useEffect(() => {
        let timerId = 0;
        setPage(1);
        if (filterString) {
            timerId = setTimeout(getData, 1000);
        } else {
            getData()
        }
        return () => {
            clearTimeout(timerId)
        }
    }, [filterString])

    useEffect(() => {
        // if (page > 1) getDataOnScroll()
        getData()
    }, [page])

    const getData = async () => {
        setIsLoading(true)
        let res = await getAPI('/manageFiles/get', {
            wpClientId: _id,
            fileOriginalName: filterString,
            fileNewName: filterString,
            page: page
        })

        if (res.status) {
            setIsLoading(false)
            setData(res.data)
            setDataCount(res.count)
            setTotalUsed(res.totalFileSizeUsed || 0)
        } else {
            setIsLoading(false)
            toast.error("Something went wrong")
        }
    }

    const deleteFile = async (id) => {
        const res = await deleteAPI('manageFiles/delete', id)
        if (res.status) {
            toast.success(res.message)
            // setPage(1)
            getData()
        } else {
            toast.error(res.message)
        }
    }

    const getDataOnScroll = async () => {
        setIsLoading(true)
        let res = await getAPI('/manageFiles/get', {
            wpClientId: _id,
            fileOriginalName: filterString,
            fileNewName: filterString,
            page: page
        })

        if (res.status) {
            setData((prev) => [...prev, ...res.data])
            setDataCount(res.count)
            setTotalUsed(res.totalFileSizeUsed || 0)
            setIsLoading(false)
        } else {
            toast.error("Something went wrong")
            setIsLoading(false)
        }
    }

    const onPageChange = (pageNumber) => {
        setPage(pageNumber);
    };


    // useEffect(() => {
    //     const observer = new IntersectionObserver((entries) => {
    //         if (entries[0].isIntersecting) {
    //             console.log(data.length, dataCount);
                
    //             if (data.length < dataCount) {
    //                 observer.unobserve(hiddenElement);
    //                 setPage((prev) => prev + 1)
    //             }
    //                 console.log(page);
                    
    //         }
    //     }, { threshold: 0.5 });


    //     const hiddenElement = document.querySelector('.last-item:last-child');
    //     if (!hiddenElement) {
    //         return;
    //     }
    //     observer.observe(hiddenElement);
    //     return () => {
    //         if (hiddenElement) {
    //             observer.unobserve(hiddenElement);
    //         }
    //         observer.disconnect();
    //     }
    // }, [data])

    return (
        <div className="p-1">
            <Header name="Manage Files" />
            <div className='flex justify-between py-2 px-1 mt-5'>
                <input type="text" id="input-email-label" value={filterString} onChange={(e) => setFilterString(e.target.value)} className="py-1 h-10 px-4 block w-1/4  rounded-lg text-sm focus:outline-none bg-gray-100 justify-center items-center" placeholder="Search here" autoComplete='off' />
                <div>

                    <label className="block">
                        <input type="file" id='fileInput' accept='video/*, image/*, application/pdf' onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:me-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:disabled:opacity-50 file:disabled:pointer-events-none" />
                    </label>
                    {uploadProgress > 0 && (
                        <div className="mt-0">
                            <div className="relative pt-1">
                                <div className="flex h-1 mb-0 overflow-hidden text-xs bg-gray-200 rounded">
                                    <div
                                        style={{ width: `${uploadProgress}%` }}
                                        className={`flex flex-col text-center text-white justify-center bg-blue-500 transition-all duration-500`}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="px-1">
                <div className="overflow-y-auto  h-[360px]">
                    <div className="flex flex-col">
                        <div className="-m-1.5 ">
                            <div className="p-1.5 min-w-full inline-block align-middle">
                                <div className="overflow-hidden">
                                    <table className="min-w-full  divide-gray-200">
                                        <thead className="divide divide-gray-200">
                                            <tr className="border border-gray-200 bg-slate-400">
                                                <th scope="col" className="px-4 py-2 text-center text-xs font-semibold text-black uppercase border-r border-gray-200">Type</th>
                                                <th scope="col" className="px-4 py-2 text-center text-xs font-semibold text-black uppercase border-r border-gray-200">Original Name</th>
                                                {/* <th scope="col" className="px-4 py-2 text-center text-xs font-semibold text-black uppercase border-r border-gray-200">New Name</th> */}
                                                <th scope="col" className="px-4 py-2 text-center text-xs font-semibold text-black uppercase border-r border-gray-200">Upload Datetime</th>
                                                <th scope="col" className="px-4 py-2 text-center text-xs font-semibold text-black uppercase border-r border-gray-200">File Size</th>
                                                <th scope="col" className="px-4 py-2 text-center text-xs font-semibold text-black uppercase border-r border-gray-200">View</th>
                                                <th scope="col" className="px-4 py-2 text-center text-xs font-semibold text-black uppercase border-r border-gray-200">Copy Link</th>
                                                <th scope="col" className="px-4 py-2 text-center text-xs font-semibold text-black uppercase border-r border-gray-200">Delete</th>
                                            </tr>
                                        </thead>

                                        <tbody className="divide divide-gray-200">
                                            {
                                                data?.length > 0 && data?.map((item, index) => {
                                                    return (
                                                        <tr className="border border-gray-200 cursor-pointer last-item" key={index}>
                                                            <td className="px-4 whitespace-nowrap text-center text-lg text-gray-800 font-medium py-2 border border-gray-200 ">{(item?.fileType === "jpg" || item?.fileType === "jpeg" || item?.fileType === "png" ) ? <FaRegFileImage className='ml-2' /> : (item?.fileType === "pdf") ? <FaFilePdf className='ml-2 text-red-500' /> : (item?.fileType === 'mp4' || item?.fileType === 'xls') ? < IoMdVideocam className='ml-2 text-blue-400' /> : <FaRegFileImage className='ml-2' />}</td>
                                                            <td className="px-4 whitespace-nowrap text-center text-xs text-gray-800 font-medium py-2 border border-gray-200">{item?.fileOriginalName}</td>
                                                            {/* <td className="px-4 whitespace-nowrap text-center text-xs text-gray-800 font-medium py-2 border border-gray-200">{item?.fileNewName}</td> */}
                                                            <td className="px-4 whitespace-nowrap text-center text-xs text-gray-800 font-medium py-2 border border-gray-200">{item?.createdAt && moment(item?.createdAt).format("DD-MMM-YYYY hh:mm:ss A")}</td>
                                                            <td className="px-4 whitespace-nowrap text-center text-xs text-gray-800 font-medium py-2 border border-gray-200">{item?.fileSize ? formatBytes(item.fileSize) : formatBytes(0)}</td>
                                                            <td className="px-4 whitespace-nowrap text-center text-xs text-gray-800 font-medium py-2 border border-gray-200"><FaEye onClick={() => {
                                                                window.open(`${FILE_BASE_URL}/clientMediaFiles/${item?.fileNewName}`, "_blank");
                                                            }} className='cursor-pointer text-blue-400 self-center ml-[30%] text-lg' /></td>
                                                            <td className="px-4 whitespace-nowrap text-center text-xs text-gray-800 font-medium py-2 border border-gray-200"><FaRegCopy onClick={() => {
                                                                navigator.clipboard.writeText(`${FILE_BASE_URL}/clientMediaFiles/${item?.fileNewName}`);
                                                                toast.success("Link Copied");
                                                            }} className='cursor-pointer self-center items-center ml-[35%] text-lg' /></td>
                                                            <td className="px-4 whitespace-nowrap text-center text-xs text-gray-800 font-medium py-2 border border-gray-200"><FaTrash className='text-red-500 cursor-pointer self-center ml-[30%] text-lg' onClick={() => deleteFile(item?._id)} /></td>
                                                        </tr>
                                                    )
                                                })
                                            }
                                        </tbody>
                                    </table>
                                </div>
                                {isLoading ? <LoadingSpinner /> : data.length === 0 && <h4 className="text-center text-lg mt-5">No Data Found.</h4>
                                }
                            </div>
                        </div>
                    </div>
                </div>

                {/* <Pagination
                    currentPage={currentPage}
                    pageSize={pageSize}
                    totalPages={Math.ceil(dataCount / pageSize)}
                    onPageChange={onPageChange}
                    setPageSize={setPageSize}
                /> */}
            </div>
            <p className='text-xs -mb-2 text-red-500 font-medium pt-2 mr-2'>{formatBytes(totalUsed)} out of 100 MB used</p>

            <Pagination
                    currentPage={page}
                    pageSize={pageSize}
                    totalPages={Math.ceil(dataCount / pageSize)}
                    onPageChange={onPageChange}
                    setPageSize={setPageSize}
                />

        </div>
    )
}

export default ManageFiles
