import React, { useState, useRef, useEffect } from 'react'
import Header from '../components/Header'
import * as XLSX from 'xlsx';
import { FaChevronDown, FaMessage } from 'react-icons/fa6';
import { createAPI, getAPI } from '../constants/constants';
import { useSelector } from 'react-redux'
import { MdCancel, MdContentCopy, MdLocationPin } from 'react-icons/md';
import DynamicForm from '../components/DynamicForm';
import wpBg from '../assets/wpBg.jpeg'
import { toast } from 'react-toastify';
import { HiOutlineArrowTopRightOnSquare } from 'react-icons/hi2';
import { IoMdCall } from 'react-icons/io';
import { PiArrowBendUpLeft } from 'react-icons/pi';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';

const BulkSender = () => {
    const { _id } = useSelector(state => state.user.userData)
    const { activePlanData } = useSelector((state) => state.user)
    const [page, setPage] = useState(1)
    const [data, setData] = useState([])
    const [column, setColumn] = useState([])
    const [loading, setLoading] = useState(false)
    const dropdownMobileRef = useRef(null);
    const navigate = useNavigate()

    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [mobileSearch, setMobileSearch] = useState('');
    const [selectedMobileColumn, setSelectedMobileColumn] = useState('');
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [sendingData, setSendingData] = useState([]);
    const [sendingLoading, setSendingLoading] = useState(false);
    const [campaignName, setCampaignName] = useState('');

    const [selectedLocationOptions, setSelectedLocationOptions] = useState([]);
    const [isChecked, setIsChecked] = useState(false);
    const expireDatetime = new Date(activePlanData.expireDatetime);
    const currentDatetime = new Date()
    const getAllKeys = (arr) => {
        const allKeys = arr.reduce((keys, obj) => {
            Object.keys(obj).forEach((key) => keys.add(key));
            return keys;
        }, new Set());

        return Array.from(allKeys);
    };

    const handleFileUpload = (event) => {
        event.preventDefault();
        setLoading(true)
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            const binaryStr = e.target.result;
            const workbook = XLSX.read(binaryStr, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(sheet);
            if (jsonData.length > activePlanData.bulkLimit) {
                return toast.error(`You have ${activePlanData.bulkLimit} sending limit `)
            }
            setData(jsonData);
            const data = getAllKeys(jsonData)
            setColumn(data);
        };


        reader.readAsBinaryString(file);
        setLoading(false)

    };



    const filteredOptions = column.filter(option =>
        option?.toLowerCase().includes(mobileSearch.toLowerCase())
    );

    const handlePageChange = (pageNumber) => {
        setPage(pageNumber);
    };


    const handleClickOutside = (event) => {
        if (dropdownMobileRef.current && !dropdownMobileRef.current.contains(event.target)) {
            setIsMobileOpen(false);
        }

        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setIsOpen(false);
        }

    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleToggle = () => {
        setIsChecked(!isChecked);
    };


    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [dataTemplate, setDataTemplate] = useState([]);
    const dropdownRef = useRef(null);

    const templateData = dataTemplate.filter(option =>
        option?.templateName?.toLowerCase().includes(searchTerm.toLowerCase())
    );


    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        let res = await getAPI("/template/get", {
            wpClientId: _id,
        })
        if (res.status) {
            setDataTemplate(res.data)
        } else {
            toast.error("Something went wrong")
        }
    }


    const [headerkey, setHeaderKey] = useState("");
    const [headerValue, setHeaderValue] = useState("");
    const [bodykey, setBodyKey] = useState([]);
    const [headerReplacedValue, setHeaderReplacedValue] = useState("");
    const [bodyReplacedValue, setBodyReplacedValue] = useState("");

    useEffect(() => {
        // setHeaderKey(selectedTemplate?.headerType)
        let inputString = selectedTemplate?.bodyValues?.text || "";
        let headerString = selectedTemplate?.headerValues?.text || "";
        let regex = /{{\d+}}/g;
        let match;
        let matches = [];
        while ((match = regex.exec(inputString)) !== null) {
            matches.push(match[0]);
        }


        if (selectedTemplate?.headerValues?.format == "TEXT") {
            let match1;
            while ((match1 = regex.exec(headerString)) !== null) {
                setHeaderKey("TEXT")
            }
        } else {
            if (selectedTemplate?.headerValues?.format == "IMAGE") {
                setHeaderKey("IMAGE")
            } else if (selectedTemplate?.headerValues?.format == "VIDEO") {
                setHeaderKey("VIDEO")
            } else if (selectedTemplate?.headerValues?.format == "DOCUMENT") {
                setHeaderKey("DOCUMENT")
            } else if (selectedTemplate?.headerValues?.format == "LOCATION") {
                setHeaderKey("LOCATION")
                setHeaderLocationkey(["latitude", "longitude", "name", "address"])

            } else {
                setHeaderKey("")
            }

        }


        setBodyKey(matches);
    }, [selectedTemplate])

    useEffect(() => {
        let object = {}
        let Array = []
        for (let i = 0; i < data.length; i++) {
            const element = data[i];
            const TEXT = {
                "type": "header",
                "parameters": [
                    {
                        "type": "text",
                        "text": element[headerValue] || ""
                    }
                ]
            }
            const IMAGE = {
                "type": "header",
                "parameters": [
                    {
                        "type": "image",
                        "image": {
                            "link": element[headerValue] || ""
                        }
                    }
                ]
            }
            const VIDEO = {
                "type": "header",
                "parameters": [
                    {
                        "type": "video",
                        "video": {
                            "link": element[headerValue] || ""
                        }
                    }
                ]
            }
            const DOCUMENT = {
                "type": "header",
                "parameters": [
                    {
                        "type": "document",
                        "document": {
                            "link": element[headerValue] || ""
                        }
                    }
                ]
            }
            let LOCATION = {
                "location": selectedLocationOptions.reduce((acc, item) => {
                    acc[item?.ACTUAL_VALUE] = element[item?.COL_NAME];
                    return acc;
                }, {})
            }

            object = {
                MOBILE_NO: element[selectedMobileColumn],
                HEADER_PARAMS: headerValue.length > 0 || headerkey.length > 0 ? (headerkey === "TEXT" ? TEXT : headerkey === "IMAGE" ? IMAGE : headerkey === "VIDEO" ? VIDEO : headerkey === "DOCUMENT" ? DOCUMENT : headerkey === "LOCATION" ? LOCATION : {}) : {},
                BODY_PARAMS: selectedOptions.length > 0 ? {
                    "type": "body",
                    "parameters": selectedOptions.map((item) => {
                        return {
                            "type": "text",
                            "text": element[item?.COL_NAME]
                        }
                    })
                } : {},
                BUTTON_PARAMS: {}
            }

            Array.push(object)

        }
        setSendingData(Array)
        let headerString = selectedTemplate?.headerValues?.text || "";
        let newHeaderString = headerString;

        if (headerValue != "" && headerValue != "Select" && data.length > 0) {
            newHeaderString = newHeaderString.replaceAll(/{{\d}}/g, data[0][headerValue]);

        }
        // > 0 && headerValue != "Select" && headerValue != "" && data[0][headerValue] !== undefined && data[0][headerValue] !== null && data[0][headerValue] !== ""
        // if (data.length > 0 && headerValue != "Select" && headerValue != "" && data[0][headerValue] !== undefined && data[0][headerValue] !== null && data[0][headerValue] !== "") {
        //     newHeaderString = newHeaderString.replaceAll(/{{\d}}/g, data[0][headerValue]);
        // }



        // if ((data.length > 0 && headerValue != "Select" && headerValue.length != 0) && (data[0][headerValue] != undefined || data[0][headerValue] != null || data[0][headerValue] != "")) {
        //     newHeaderString = newHeaderString.replaceAll(/{{\d}}/g, data.length > 0 ? data[0][headerValue] : "");
        // }
        let bodyString = selectedTemplate?.bodyValues?.text || "";
        let newBodyString = bodyString;
        for (let i = 0; i < selectedOptions.length; i++) {
            const element = selectedOptions[i];
            if (data[0][element?.COL_NAME] != "Select" && data[0][element?.COL_NAME] != undefined && data[0][element?.COL_NAME] != null && data[0][element?.COL_NAME] != "") {
                newBodyString = newBodyString.replaceAll(element?.ACTUAL_VALUE, data[0][element?.COL_NAME]);
            }
        }
        setHeaderReplacedValue(newHeaderString);
        setBodyReplacedValue(newBodyString);
    }, [selectedMobileColumn, headerValue, selectedOptions, selectedTemplate, selectedLocationOptions])


    function transformString(inputString) {
        // Replace *...* with <strong>...</strong>
        inputString = inputString.replace(/\*(.*?)\*/g, '<strong>$1</strong>');

        // Replace _..._ with <em>...</em>
        inputString = inputString.replace(/_(.*?)_/g, '<em>$1</em>');

        // Replace ~...~ with <s>...</s>
        inputString = inputString.replace(/~(.*?)~/g, '<s>$1</s>');

        // Replace \n with <br>
        inputString = inputString.replace(/\n/g, '<br>');

        return inputString;
    }

    const sendMessages = async (event) => {
        setSendingLoading(true);
        event.preventDefault();
        if (!_id || !selectedTemplate || !data.length > 0 || !campaignName) {
            toast.info("All Fields are Required")
            setSendingLoading(false);
        } else {
            const res = await createAPI('/bulkSender/create', {
                wpClientId: _id,
                templateId: selectedTemplate._id,
                templateName: selectedTemplate.templateName,
                templateLanguages: selectedTemplate.languages,
                templateCategory: selectedTemplate.templateCategory,
                campaignName: campaignName,
                isScheduled: false,
                scheduledDateTime: null,
                bulkData: sendingData
            })
            if (res.status) {
                toast.success(res.message)
                setPage(3)
                setSendingLoading(false);

                // navigate('/bulk-sender')

            } else {
                setSendingLoading(false);
                toast.error(res.message)
            }
        }
    }


    const [headerLocationkey, setHeaderLocationkey] = useState([]);
    const [scheduledDate, setsScheduledDate] = useState(new Date())
    const handleScheduledDateChange = (date) => {
        console.log("date", date);
        setsScheduledDate(new Date(date));
    };


    return (
        <div className="p-1">
            <Header name="Bulk Sender" />

            {
                expireDatetime <= currentDatetime  ?
                    <div className="flex items-center justify-center min-h-screen p-6">
                        <div className="text-center p-3 max-w-md mx-auto bg-white rounded-xl shadow-md space-y-4 transition transform duration-500 ease-in-out hover:scale-105">
                            <div className="">
                                <h2 className="text-2xl text-red-500 font-semibold mb-4 animate-bounce">Plan Expired</h2>
                                <p className="text-m">Your plan expired on {moment(activePlanData?.expireDatetime).format("DD-MMM-YYYY hh:mm:ss A")}.</p>
                                <button className="mt-6 px-4 py-1.5 bg-red-500 text-white rounded-lg shadow hover:bg-red-700 outline-none transition duration-300" onClick={()=> navigate("/purchase-plan")}>
                                    Buy New Plan
                                </button>
                            </div>
                        </div>
                    </div>
                    : <div>

                        {
                            (page === 1) && <div>
                                <div className='flex justify-end'>
                                    <p className='text-xs text-center mt-3 p-1 max-w-max rounded-md cursor-pointer bg-red-600 text-white'>Download Sample Excel</p>
                                </div>
                                <div className='flex justify-center'>
                                    <p className='text-xs text-center'>You can use Excel file (.xlsx format) with phone numbers.You can also add extra columns that you wish to connect to the template.</p>
                                </div>
                                <div className="w-full justify-center flex mt-2">
                                    <label className="block">
                                        <input type="file" accept='.xlsx, .xls' onChange={handleFileUpload} className="block w-full text-sm text-gray-500 file:me-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:disabled:opacity-50 file:disabled:pointer-events-none" />
                                    </label>
                                </div>

                                {
                                    data.length > 0 ?
                                        <div className="px-1 mt-2">
                                            <div className=" overflow-y-auto h-auto">
                                                <div className="flex flex-col">
                                                    <div className="-m-1.5 ">
                                                        <div className="p-1.5 min-w-full min-h-96 max-h-96 inline-block align-middle">
                                                            <div className="overflow-hidden">
                                                                <table className="min-w-full divide-gray-200">
                                                                    <thead>
                                                                        <tr>
                                                                            {
                                                                                column.length > 0 && column.map((item, index) => (<th scope="col" key={index} className="px-4 py-2 text-start text-sm font-semibold text-black uppercase">{item}</th>))
                                                                            }
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody className="divide-gray-200">
                                                                        {
                                                                            data.length > 0 ? data.map((item, index) => (
                                                                                <tr key={index}>
                                                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">{item?.NAME}</td>
                                                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">{item?.MOBILE_NO}</td>
                                                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">{item?.HEADER_NAME_OR_LINK}</td>
                                                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">{item?.BODY_1}</td>
                                                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">{item?.BODY_2}</td>
                                                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">{item?.BODY_3}</td>
                                                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">{item?.BODY_4}</td>
                                                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">{item?.BODY_5}</td>
                                                                                </tr>
                                                                            )) : "No Data"
                                                                        }

                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <h3 className='mt-4'>Imported <span className='text-red-500 font-medium'>{data.length}</span> contacts</h3>
                                            <div className="flex justify-end gap-2 fixed inset-x-2 bottom-2">
                                                {/* <button type="button" className="py-2  px-4 inline-flex items-center gap-x-2 text-sm  rounded-lg border border-transparent bg-gray-400 text-white hover:bg-red-500 disabled:opacity-50 disabled:pointer-events-none dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600" onClick={{}}>
        Close
    </button> */}
                                                <button type="button" className="py-2  px-4 inline-flex items-center gap-x-2 text-sm  rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600" onClick={() => handlePageChange(2)}>

                                                    {
                                                        false && <span className="animate-spin inline-block size-4 border-[2px] border-current border-t-transparent text-white rounded-full" role="status" aria-label="loading"></span>
                                                    }
                                                    Next
                                                </button>
                                            </div>
                                        </div> : loading && <div className='text-center mt-4'>Loading........</div>
                                }


                            </div>
                        }

                        {
                            (page === 2) &&
                            <div className='py-5 flex flex-row gap-3'>
                                <div className='w-3/4'>
                                    <div className='bg-gray-100 w-full h-42 p-2'>
                                        <div className=' relative flex items-center justify-between space-x-4'>
                                            <div className="w-2/4 ">
                                                <label for="input-label" className="block text-xs  mb-1">Campaign Name.</label>
                                                <input type="text" id="input-label" value={campaignName} maxLength={64} onChange={(e) => setCampaignName(e.target.value)} className="py-2 px-4 block w-full rounded-lg text-m border border-gray-200 mb-1  outline-none" autoComplete='off' placeholder="Campaign Name" />

                                            </div>
                                            {/* scheduled datetime */}
                                            {/* <div className="w-1/4 ">
                                    <label for="input-label" className="block text-xs  mb-1">Schedule?</label>
                                    <div className='mt-0'>
                                        <input
                                            type="checkbox"
                                            id="toggle"
                                            checked={isChecked}
                                            onChange={handleToggle}
                                            className="hidden"
                                        />
                                        <label
                                            htmlFor="toggle"
                                            className={`flex items-center cursor-pointer w-12 h-6 rounded-full p-1 transition-colors duration-300 ${isChecked ? 'bg-blue-500' : 'bg-gray-400'
                                                }`}
                                        >
                                            <span
                                                className={`inline-block w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-300 ${isChecked ? 'translate-x-6' : 'translate-x-0'
                                                    }`}
                                            />
                                        </label>
                                    </div>

                                </div>
                                <div className="w-3/4 ">
                                    {
                                        isChecked && <div>
                                            <label for="input-label" className=" text-xs  mb-1">Select Date & Time</label>
                                            <DatepickerComponent selectedDate={scheduledDate} handleDateChange={handleScheduledDateChange} timeSelect={true} format="dd/MM/yyyy hh:mm a" />
                                        </div>
                                    }
                                </div> */}
                                        </div>
                                        <div className=' relative flex items-center justify-between space-x-4'>
                                            <div className="w-1/2 ">

                                                <label htmlFor="templateSearch" className='text-xs'>Select Template</label>
                                                <div ref={dropdownRef} className="relative w-full bg-white border border-gray-300 rounded shadow-lg">
                                                    <input
                                                        id="templateSearch"
                                                        type="text"
                                                        className="w-full px-4 py-2 border-b border-gray-300 outline-none placeholder:text-black"
                                                        placeholder={selectedTemplate?.templateName || "Select Template"}
                                                        value={searchTerm}
                                                        onClick={() => setIsOpen(!isOpen)}
                                                        onChange={(e) => {
                                                            setIsOpen(true);
                                                            setSearchTerm(e.target.value);
                                                        }}
                                                        autoComplete='off'
                                                    />
                                                    {
                                                        searchTerm.length > 0 && <MdCancel className='cursor-pointer absolute text-red-500 right-8 top-[12px]' onClick={() => {
                                                            setSearchTerm("")
                                                            setSelectedTemplate(null)
                                                            setSelectedOptions([])
                                                            setIsOpen(true)
                                                        }} />
                                                    }

                                                    <FaChevronDown className='cursor-pointer absolute right-3 top-[12px]' onClick={() => setIsOpen(!isOpen)} />
                                                    {isOpen && (
                                                        <ul className="max-h-60 absolute bg-white w-full overflow-y-auto">
                                                            {templateData.map((option, index) => (
                                                                <li
                                                                    className='p-2 hover:bg-gray-200 cursor-pointer'
                                                                    key={index}
                                                                    onClick={() => {
                                                                        setSelectedTemplate(option);
                                                                        setSearchTerm(option.templateName);
                                                                        setIsOpen(false);
                                                                    }}
                                                                >
                                                                    {option.templateName}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                </div>
                                            </div>


                                            <div className="w-1/2">
                                                <label htmlFor="templateSearch" className='text-xs'>Reciever Mobile No</label>
                                                <div ref={dropdownMobileRef} className="relative z-100 w-full bg-white border border-gray-300 rounded shadow-lg">
                                                    <input
                                                        id="templateSearch"
                                                        type="text"
                                                        className="w-full px-4 py-2 border-b border-gray-300 outline-none placeholder:text-black"
                                                        placeholder={"Select Mobile No. Column"}
                                                        value={mobileSearch}
                                                        onClick={() => setIsMobileOpen(!isMobileOpen)}
                                                        onChange={(e) => {
                                                            setIsMobileOpen(true);
                                                            setMobileSearch(e.target.value);
                                                        }}
                                                        autoComplete='off'
                                                    />
                                                    {
                                                        mobileSearch.length > 0 && <MdCancel className='cursor-pointer absolute text-red-500 right-8 top-[12px]' onClick={() => {
                                                            setMobileSearch("")
                                                            setSelectedMobileColumn(null)
                                                            setIsMobileOpen(true)
                                                        }} />
                                                    }

                                                    <FaChevronDown className='cursor-pointer absolute right-3 top-[12px]' onClick={() => setIsMobileOpen(!isMobileOpen)} />
                                                    {isMobileOpen && (
                                                        <ul className="max-h-60 absolute bg-white w-full overflow-y-auto">
                                                            {filteredOptions.map((option, index) => (
                                                                <li
                                                                    className='p-2 hover:bg-gray-200 cursor-pointer'
                                                                    key={index}
                                                                    onClick={() => {
                                                                        setSelectedMobileColumn(option);
                                                                        setMobileSearch(option);
                                                                        setIsMobileOpen(false);
                                                                    }}
                                                                >
                                                                    {option}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {
                                        headerkey == "TEXT" ?
                                            <div className='bg-gray-100 w-full h-auto p-2 mt-5'>
                                                <h5>Header Values</h5>
                                                <p className='text-xs text-red-500 mb-2'>{'{{1}}' + " " + 'will replace with which column you have selected value'}</p>
                                                <div className="">
                                                    <div className="flex items-center mb-4">
                                                        <input
                                                            type="text"
                                                            value={"{{1}}"}
                                                            disabled
                                                            className="border w-1/2 border-gray-300 p-2 mr-4 text-center rounded"
                                                        />
                                                        <select
                                                            value={headerValue}
                                                            onChange={(e) => setHeaderValue(e.target.value)}
                                                            className="border w-1/2 h-10 outline-none border-gray-300 p-2 rounded">
                                                            <option className='w-12 py-3' value={"Select"}>{"Select"}</option>

                                                            {
                                                                column.map((column, index) => (
                                                                    <option key={index} className='w-12 py-3' value={column}>{column}</option>
                                                                ))
                                                            }
                                                        </select>
                                                    </div>

                                                </div>
                                            </div> :
                                            (headerkey == "IMAGE" || headerkey == "VIDEO" || headerkey == "DOCUMENT") ?
                                                <div className='bg-gray-100 w-full h-auto p-2 mt-5'>
                                                    <h5>Header Key Mapping</h5>
                                                    <p className='text-xs text-red-500 mb-2'>{'HEADER_LINK' + " " + 'will replace with which column you have selected. png,jpeg,mp4,pdf'}</p>
                                                    <div className="">
                                                        <div className="flex items-center mb-4">
                                                            <input
                                                                type="text"
                                                                value={"HEADER_LINK"}
                                                                disabled
                                                                className="border w-1/2 border-gray-300 p-2 mr-4 text-center rounded"
                                                            />
                                                            <select
                                                                value={headerValue}
                                                                onChange={(e) => setHeaderValue(e.target.value)}
                                                                className="border w-1/2 h-10 outline-none border-gray-300 p-2 rounded">
                                                                <option className='w-12 py-3' value={"Select"}>{"Select"}</option>
                                                                {
                                                                    column.map((column, index) => (
                                                                        <option key={index} className='w-12 py-3' value={column}>{column}</option>
                                                                    ))
                                                                }
                                                            </select>
                                                        </div>

                                                    </div>
                                                </div> : null
                                    }

                                    {
                                        bodykey.length > 0 &&
                                        <div className='bg-gray-100 w-full h-auto p-2 mt-5'>
                                            <h5>Body Key Mapping</h5>
                                            <p className='text-xs text-red-500 mb-2'>{'{{1}}' + " " + 'will replace with which column you have selected value'}</p>
                                            <DynamicForm items={bodykey} column={column} selectedOptions={selectedOptions} setSelectedOptions={setSelectedOptions} />
                                        </div>
                                    }
                                    {
                                        headerLocationkey.length > 0 &&
                                        <div className='bg-gray-100 w-full h-auto p-2 mt-5'>
                                            <h5>Header Location Key Mapping</h5>
                                            <p className='text-xs text-red-500 mb-2'>{'{{1}}' + " " + 'will replace with which column you have selected value'}</p>
                                            <DynamicForm items={headerLocationkey} column={column} selectedOptions={selectedLocationOptions} setSelectedOptions={setSelectedLocationOptions} />
                                        </div>
                                    }


                                </div>

                                <div className='relative max-h-full w-1/4'>
                                    <img src={wpBg} alt="" className='w-full h-max' />
                                    <div className='absolute inset-0 p-2'>
                                        {
                                            (selectedTemplate?.headerType == "IMAGE" || selectedTemplate?.headerType == "VIDEO" || selectedTemplate?.headerType == "DOCUMENT" || selectedTemplate?.headerType == "LOCATION") &&
                                            <div className='w-full h-36 mb-1 bg-gray-400 rounded-md'>
                                                {
                                                    selectedTemplate?.headerType == "IMAGE" ?
                                                        <img src={(sendingData.length > 0 && Object.keys(sendingData[0].HEADER_PARAMS).length > 0) ? sendingData[0]?.HEADER_PARAMS?.parameters[0][headerkey.toLowerCase()]?.link : selectedTemplate?.headerValues?.example?.header_handle[0]} alt="Header" className="w-full h-full object-fit rounded-md" /> :
                                                        selectedTemplate?.headerType == "VIDEO" ?
                                                            <video src={(sendingData.length > 0 && Object.keys(sendingData[0].HEADER_PARAMS).length > 0) ? sendingData[0]?.HEADER_PARAMS?.parameters[0][headerkey.toLowerCase()]?.link : selectedTemplate?.headerValues.example.header_handle[0]} alt="Header" className="w-full h-full object-cover rounded-md" autoPlay={true} controls /> :
                                                            selectedTemplate?.headerType == "LOCATION" ? <div className='w-full h-full rounded-md bg-gray-300 content-center'>

                                                                <MdLocationPin className='text-[80px] ml-24 text-white' />
                                                                <div className=' absolute top-[105px] px-2'>
                                                                    <p className='text-sm text-black'>Visharambagh,Sangli</p>
                                                                    <p className='text-xs text-black'>414414</p>
                                                                </div>
                                                            </div> : <iframe src={selectedTemplate?.headerValues?.link} alt="Header" className="w-full h-full object-cover rounded-md" />
                                                }
                                            </div>

                                        }


                                        <div className='w-full bg-white p-2'>


                                            <h2 className='text-black text-sm'>{headerReplacedValue}</h2>
                                            <h2 className='text-black text-sm' dangerouslySetInnerHTML={{ __html: transformString(bodyReplacedValue) }}></h2>
                                            <h2 className='text-gray-500 text-xs'>{selectedTemplate?.footerValues && selectedTemplate?.footerValues.text}</h2>
                                            <hr className='mt-2' />
                                            <div className='px-2'>

                                                {
                                                    selectedTemplate?.buttonValues?.buttons?.length > 0 && selectedTemplate?.buttonValues?.buttons?.map((item, index) => {
                                                        return (
                                                            <div className='flex justify-center mt-[3px] gap-1' key={index}>
                                                                {
                                                                    item?.type == "URL" ? <HiOutlineArrowTopRightOnSquare className='w-4 h-4 text-blue-600 flex justify-center items-center cursor-pointer' /> : item?.type == "PHONE_NUMBER" ? <IoMdCall className='w-4 h-4 text-blue-600 flex justify-center items-center cursor-pointer' /> : item.type == "COPY_CODE" ? <MdContentCopy className='w-4 h-4 text-blue-600 flex justify-center items-center cursor-pointer' /> : <PiArrowBendUpLeft className='w-4 h-4 text-blue-600 flex justify-center items-center cursor-pointer' />
                                                                }

                                                                <p className='text-sm text-blue-600 font-medium text-center'>{item?.text}</p>
                                                                <hr />
                                                            </div>
                                                        )
                                                    })
                                                }
                                            </div>
                                        </div>

                                    </div>
                                </div>


                                <div className="flex justify-end gap-2 fixed inset-x-2 bottom-2">
                                    <button type="button" className="py-2  px-4 inline-flex items-center gap-x-2 text-sm  rounded-lg border border-transparent bg-gray-400 text-white hover:bg-red-500 disabled:opacity-50 disabled:pointer-events-none dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600" onClick={() => handlePageChange(1)}>
                                        Prev
                                    </button>
                                    <button type="button" className="py-2  px-4 inline-flex items-center gap-x-2 text-sm  rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600" onClick={sendMessages}>

                                        {
                                            sendingLoading && <span className="animate-spin inline-block size-4 border-[2px] border-current border-t-transparent text-white rounded-full" role="status" aria-label="loading"></span>
                                        }
                                        Send
                                    </button>
                                </div>
                            </div>
                        }

                        {
                            (page === 3) &&
                            <div className='w-full h-full flex justify-center items-center'>
                                <div className="flex items-center justify-center py-4 px-4 bg-gray-100 mt-[20%] rounded-md shadow-sm">
                                    <div className="flex items-center mr-4">
                                        <FaMessage className={`w-8 h-8 text-blue-500 mr-2`} />
                                        <span className="text-xl font-bold text-gray-800">{sendingData.length}</span>
                                    </div>
                                    <span className="text-base text-gray-500">Messages are Processing</span>
                                </div>
                            </div>
                        }

                    </div>
            }




        </div >
    )
}

export default BulkSender
