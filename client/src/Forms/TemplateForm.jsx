import React, { useState, useRef, useEffect } from 'react';
import { FaArrowCircleDown, FaArrowDown, FaCheck, FaChevronDown, FaClosedCaptioning, FaCross, FaDoorClosed, FaEdit, FaTrash, FaWindowClose } from "react-icons/fa";
import { FaFolderClosed } from 'react-icons/fa6';
import { MdCancel } from 'react-icons/md';
import { HiOutlineArrowTopRightOnSquare } from "react-icons/hi2";
import { IoMdCall } from "react-icons/io";
import { PiArrowBendUpLeft } from "react-icons/pi";
import { MdContentCopy } from "react-icons/md";


import ReactQuill from 'react-quill'; // Import ReactQuill component
import 'react-quill/dist/quill.snow.css';
import { toast } from 'react-toastify';
import { createAPI, fileUploadAPI } from '../constants/constants';
import bgUrlImage from '../assets/wpBg.jpeg'
import { useSelector } from 'react-redux';
const TemplateForm = ({ drawerCondition, btnName, data }) => {
  const { _id } = useSelector(state => state.user.userData);
  function isEmptyObject(obj) {
    return Object.entries(obj).length === 0;
  }


  const dropDownData = [
    {
      "id": 1,
      "name": "MARKETING"
    },
    {
      "id": 2,
      "name": "UTILITY"
    },
    {
      "id": 3,
      "name": "AUTHENTICATION"
    }
  ]


  const [createOrUpdate, setCreateOrUpdate] = useState(isEmptyObject(data));
  const [loadingSpin, setLoadingSpin] = useState(false);
  const [allRequirdFilled, setAllRequirdFilled] = useState(false);

  // first row
  const [tempName, setTempName] = useState(data.mbl ? data?.mbl : '');
  const [category, setCategory] = useState(data.api ? data?.api : '');

  const languageData = [
    {
      "id": 1,
      "name": "English(en)",
      "code": "en"
    },
    {
      "id": 2,
      "name": "English(en_US)",
      "code": "en_US"
    },
    {
      "id": 3,
      "name": "English(en_UK)",
      "code": "en_UK"
    },
    {
      "id": 4,
      "name": "Marathi(mr)",
      "code": "mr"
    },
    {
      "id": 5,
      "name": "Hindi(hn)",
      "code": "hn"
    }
  ]
  const [language, setLanguage] = useState(data.api ? data?.api : '');
  const [isOpenLang, setIsOpenLang] = useState(false);
  const toggleDropdownLang = () => {
    setIsOpenLang(!isOpenLang);
  };
  // header states
  const headerData = [
    {
      "id": 1,
      "name": "NONE"
    },
    {
      "id": 2,
      "name": "TEXT"
    },
    {
      "id": 3,
      "name": "IMAGE"
    },
    {
      "id": 4,
      "name": "VIDEO"
    },
    {
      "id": 5,
      "name": "DOCUMENT"
    },
    {
      "id": 6,
      "name": "LOCATION"
    }
  ]
  const [header, setHeader] = useState(headerData[0].name);
  const [headerText, setHeaderText] = useState(data.mbl ? data?.mbl : '');
  const [headerValues, setHeaderValues] = useState([]);
  const [isOpenHeader, setIsOpenHeader] = useState(false);
  const toggleDropdownHeader = () => {
    setIsOpenHeader(!isOpenHeader);
  };


  const [tags, setTags] = useState([]);
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter' && inputValue) {
      setTags([...tags, inputValue]);
      setInputValue('');
    }
  };

  const handleTagRemove = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // body states
  const [bodyTags, setBodyTags] = useState([]);
  const [inputBodyValue, setInputBodyValue] = useState('');
  const [bodyValues, setBodyValues] = useState([]);
  const [allButtonArray, setAllButtonArray] = useState([]);
  const handleInputBodyChange = (e) => {
    setInputBodyValue(e.target.value);
  };

  const handleInputKeyBodyDown = (e) => {
    if (e.key === 'Enter' && inputBodyValue) {
      setBodyTags([...bodyTags, inputBodyValue]);
      setInputBodyValue('');
    }
  };
  const handleBodyTagRemove = (tagToRemove) => {
    setBodyTags(bodyTags.filter(tag => tag !== tagToRemove));
  };



  // Footer states
  const [footerText, setFooterText] = useState('');

  function cleanHtml(html) {
    // Replace <strong> and </strong> with *
    html = html.replace(/<\/?strong>/g, '*');
    // Replace <em> and </em> with _
    html = html.replace(/<\/?em>/g, '_');
    // Replace <s> and </s> with ~
    html = html.replace(/<\/?s>/g, '~');
    // html = html.replace(/<br\s*\/?>/gi, '\n');

    html = html.replaceAll("</p><p>", '\n');
    html = html.replaceAll("<p>", '');
    html = html.replaceAll("</p>", '');
    html = html.replace(/<\/?em>/g, '_');
    // Remove all other HTML tags
    html = html.replace(/<[^>]+>/g, '');
    // Remove <br> tags


    return html;
  }
  // Button States
  const buttonData = [
    {
      "id": 1,
      "name": "Visit Website",
      "count": 2,
      "code": "URL",
      "disabled": allButtonArray.filter(button => button.type === "URL").length >= 2
    },
    {
      "id": 2,
      "name": "Call Phone Number",
      "count": 1,
      "code": "PHONE_NUMBER",
      "disabled": allButtonArray.filter(button => button.type === "PHONE_NUMBER").length >= 1
    },
    {
      "id": 3,
      "name": "Send Offer Code",
      "count": 1,
      "code": "COPY_CODE",
      "disabled": allButtonArray.filter(button => button.type === "COPY_CODE").length >= 1
    },
    {
      "id": 4,
      "name": "Custom",
      "count": 10,
      "code": "QUICK_REPLY",
      "disabled": allButtonArray.length >= 10
    }
  ]


  const urlData = [
    {
      "id": 1,
      "name": "STATIC"
    },
    {
      "id": 2,
      "name": "DYNAMIC",
    }
  ]

  const [mediaId, setMediaId] = useState("");
  const [isOpenButton, setIsOpenButton] = useState(false);
  const [buttonType, setButtonType] = useState("");
  const [button, setButton] = useState("");

  const [buttonName, setButtonName] = useState("");
  const [urlType, setUrlType] = useState("");
  const [buttonUrlString, setButtonUrlString] = useState("");
  const [buttonUrlDynamicString, setButtonUrlDynamicString] = useState("");
  const [isOpenUrlType, setIsOpenUrlType] = useState(false);


  const [buttonCallString, setButtonCallString] = useState("");
  const btnNameOfferCode = "Copy Offer Code"
  const [buttonOfferCodeString, setButtonOfferCodeString] = useState("");

  const toggleDropdownButton = () => {
    setIsOpenButton(!isOpenButton);
  };
  const toggleDropdownUrlType = () => {
    setIsOpenUrlType(!isOpenUrlType);
  };


  const [isOpen, setIsOpen] = useState(false);



  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };




  const drawerRef = useRef(null);
  const toggleDrawer = () => {
    drawerCondition.setIsDrawerTemplateOpen(false);
  };

  const handleClickOutside = (event) => {
    if (drawerRef.current && !drawerRef.current.contains(event.target)) {
      drawerCondition.setIsDrawerTemplateOpen(false);
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

  const [bodyText, setBodyText] = useState('');

  const regex = /{{\d+}}/g;

  useEffect(() => {
    let matches = headerText.match(regex) ? headerText.match(regex) : []
    let matches2 = bodyText.match(regex) ? bodyText.match(regex) : []
    setHeaderValues(matches)
    setBodyValues(matches2)
  }, [headerText, bodyText])





  const handleChange = (content, delta, source, editor) => {
    setBodyText(content);
  };


  // header JSON 
  let headerJson = null
  let example = {}
  if (header === "TEXT") {
    if (headerValues.length > 0) {
      example = {
        "example": {
          "header_text": [
            ...tags
          ]
        }
      }
      headerJson = {
        "type": "HEADER",
        "format": "TEXT",
        "text": headerText,
        ...example
      }
    } else {
      headerJson = {
        "type": "HEADER",
        "format": "TEXT",
        "text": headerText,
      }
    }

  } else if (header === "IMAGE") {
    if (header.length > 0) {
      example = {
        "example": {
          "header_handle": [
            mediaId
          ]
        }
      }
      headerJson = {
        "type": "HEADER",
        "format": "IMAGE",
        ...example
      }
    }
  } else if (header === "VIDEO") {
    if (header.length > 0) {
      example = {
        "example": {
          "header_handle": [
            mediaId
          ]
        }
      }
      headerJson = {
        "type": "HEADER",
        "format": "VIDEO",
        ...example
      }
    }
  } else if (header === "DOCUMENT") {
    if (header.length > 0) {
      example = {
        "example": {
          "header_handle": [
            mediaId
          ]
        }
      }
      headerJson = {
        "type": "HEADER",
        "format": "DOCUMENT",
        ...example
      }
    }
  }

  let bodyJson = null
  let exampleBody = {}
  console.log("bodyText", bodyText);
  if (bodyText) {
    if (bodyValues.length > 0) {
      exampleBody = {
        "example": {
          "body_text": [
            ...bodyTags
          ]
        }
      }
      bodyJson = {
        "type": "BODY",
        "text": cleanHtml(bodyText),
        ...exampleBody
      }

    } else {
      bodyJson = {
        "type": "BODY",
        "text": cleanHtml(bodyText),
      }
      console.log("bodyJson", cleanHtml(bodyText));
    }

  }


  // console.log("cleanHtml(bodyText)", cleanHtml(bodyText));

  let footerJson = null
  if (footerText) {
    footerJson = {
      "type": "FOOTER",
      "text": footerText
    }
  }


  const [currentButtonObject, setCurrentButtonObject] = useState({});

  const handleButtonAdd = () => {
    setAllRequirdFilled(true)
    if (buttonType === "PHONE_NUMBER") {
      if (buttonName && buttonCallString) {
        let currentButtonObject = {
          "type": "PHONE_NUMBER",
          "text": buttonName,
          "phone_number": "+910" + buttonCallString
        }
        setAllButtonArray([...allButtonArray, currentButtonObject])
        setButtonName("");
        setButtonCallString("");
        setButtonType("");
      }

    } else if (buttonType === "URL") {
      if (buttonName && buttonUrlString && urlType) {
        if (urlType == "DYNAMIC") {
          let currentButtonObject = {
            "type": "URL",
            "text": buttonName,
            "url": buttonUrlString + "/{{1}}",
            "example": [
              buttonUrlDynamicString
            ]
          }
          setAllButtonArray([...allButtonArray, currentButtonObject])
          setButtonName("");
          setButtonUrlString("");
          setButtonUrlDynamicString("");
          setButtonType("");
          setUrlType("");
        } else {
          let currentButtonObject = {
            "type": "URL",
            "text": buttonName,
            "url": buttonUrlString
          }
          setAllButtonArray([...allButtonArray, currentButtonObject])
          setButtonName("");
          setButtonUrlString("");
          setButtonType("");
          setUrlType("");
        }
      }
    } else if (buttonType === "COPY_CODE") {
      if (btnNameOfferCode && buttonOfferCodeString) {
        let currentButtonObject = {
          "type": "COPY_CODE",
          "text": btnNameOfferCode,
          "example": [
            buttonOfferCodeString
          ]
        }
        setAllButtonArray([...allButtonArray, currentButtonObject])
        setButtonOfferCodeString("");
        setButtonType("");
      }

    } else if (buttonType === "QUICK_REPLY") {
      if (btnNameOfferCode) {
        let currentButtonObject = {
          "type": "QUICK_REPLY",
          "text": buttonName
        }
        setAllButtonArray([...allButtonArray, currentButtonObject])
        setButtonName("");
        // setButtonType("");
      }

    }

    setTimeout(() => {
      setAllRequirdFilled(false)
    }, 1000);
  }



  // const [selectedFile, setSelectedFile] = useState(null);
  const [tempMediaUrl, setTempMediaUrl] = useState("http://dramabookings.uvtechsoft.com:7896/static/currentSeatStatus/CharChoughi_SHOW_ID_1.png");


  const handleFileChange = async (event) => {
    const fileData = {
      "file": event.target.files[0],
      "wpClientId": _id
    }
    const mimetypeData = header === "IMAGE" ? ["image/jpeg", "image/png"] : header === "VIDEO" ? ["video/mp4"] : header === "DOCUEMENT" ? ["application/pdf"] : []
    if (mimetypeData.includes(event.target.files[0].type)) {
      const data = await fileUploadAPI('/upload/templateMedia', fileData)
      if (data.status) {
        setTempMediaUrl(`http://localhost:8989/static/templateMedia/${data.fileName}`);
        setMediaId(data.data[0].mediaId);
        toast.success("File Uploaded Successfully")
      } else {
        toast.error("File Upload Failed")
      }
    } else {
      header === "IMAGE" ? toast.info("Select only jpeg or png image") : header === "VIDEO" ? toast.info("Select only mp4 video file") : header === "DOCUMENT" ? toast.info("Select only pdf files") : ''
    }
  };

  const handleSubmit = async (event) => {

    setLoadingSpin(true);
    event.preventDefault();
    if (!tempName || !category || !language || !bodyText || (header == "TEXT" && !headerText) || (buttonType && allButtonArray.length == 0)) {
      setAllRequirdFilled(true)
      toast.info("All Fields are Required")
      setLoadingSpin(false);
    } else {
      const res = await createAPI('/template/createTemplate', {
        wpClientId: _id,
        templateName: tempName,
        templateCategory: category,
        languages: language,
        headerType: header,
        headerValues: headerJson,
        bodyValues: bodyJson,
        footerValues: footerJson,
        buttonValues: allButtonArray.length > 0 ? {
          "type": "BUTTONS",
          "buttons": allButtonArray
        } : {},
        status: "S",
        mediaUrl: (header == "TEXT" || header.length == 0) ? "" : tempMediaUrl,
        mediaId: mediaId,
      })
      if (res.status) {
        toast.success(res.message)
        setLoadingSpin(false);
        await drawerCondition.setIsDrawerTemplateOpen(false);

      } else {
        setLoadingSpin(true);
        toast.error(res.message)
      }
    }
  }


  return (
    <div ref={drawerRef} className={`fixed inset-y-0 right-0 z-10 w-[75%] bg-white border-l border-gray-300 shadow-lg ${drawerCondition.isDrawerTemplateOpen ? 'block' : 'hidden'}`}>
      <div className="flex justify-between p-4">
        <h4 className="text-black text-xl font-semibold">Add New Template</h4>
        <button onClick={toggleDrawer} className="text-black hover:text-red-500 hover:scale-110 duration-200 text-2xl">
          <FaWindowClose />
        </button>
      </div>
      <div className="px-4">
        <div className="flex overflow-y-auto">
          <div className='w-3/4 p-2 h-[90vh] overflow-y-auto'>
            <div className='flex gap-1 w-full'>
              <div className='w-1/3 inline-block'>
                <label htmlFor="input-label" className="block text-sm mb-1 font-medium"><span className='text-sm text-red-500 font-medium'>*</span>Template Name</label>
                <input type="text" value={tempName} id="input-label" onChange={(e) => setTempName(e.target.value.replaceAll(" ", "_"))} className={`py-2 px-4 w-full block rounded-lg text-sm border mb-1 outline-none ${allRequirdFilled && tempName.length == 0 ? "border-red-500" : "border-gray-400"} `} placeholder="Enter Template Name" />

                {
                  (allRequirdFilled && tempName.length === 0) ? <label for="input-label" className="block text-xs mb-1 ml-1 text-red-500">Template Name is Required</label> : <p className='text-[9px] font-semibold text-red-600 ml-1'>{tempName.length}/512</p>
                }
              </div>
              <div className="relative inline-block w-1/3">
                <label htmlFor="input-label" className="block text-sm mb-1 font-medium"><span className='text-sm text-red-500 font-medium'>*</span>Category</label>

                <div>
                  <button
                    type="button"
                    className={`inline-flex w-full justify-between items-center rounded-md border ${allRequirdFilled && category.length == 0 ? "border-red-500 " : "border-gray-400 "}shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50`}
                    id="options-menu"
                    aria-haspopup="true"
                    aria-expanded="true"
                    onClick={toggleDropdown}
                  >
                    {category.length > 0 ? category : "Select Category"}
                    {category.length > 0 ? <div className='flex gap-1'>
                      <MdCancel className='text-red-400 text-m' onClick={() => {
                        setCategory("")
                        setIsOpen(true)
                      }} />
                      <FaCheck className='text-green-400 text-m' />
                    </div> : <FaChevronDown />}


                  </button>
                  {
                    (allRequirdFilled && category.length === 0) && <label for="input-label" className="block text-xs mb-1 ml-1 text-red-500">Category is Required</label>
                  }
                </div>

                {isOpen && (
                  <div
                    className="origin-top-right absolute mt-2 w-[100%] rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="options-menu"
                  >
                    <div className="py-1 duration-200" role="none">
                      {
                        dropDownData.map(item => (
                          <h6
                            key={item.id}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                            onClick={() => {
                              setCategory(item.name)
                              setIsOpen(false)
                            }}
                          >{item.name}
                          </h6>
                        ))
                      }
                    </div>
                  </div>
                )}
              </div>
              <div className="relative inline-block w-1/3">
                <label htmlFor="input-label" className="block text-sm font-medium mb-1"><span className='text-sm text-red-500 font-medium'>*</span>Language</label>
                <div>
                  <button
                    type="button"
                    className={`inline-flex w-full justify-between items-center rounded-md border ${allRequirdFilled && language.length == 0 ? "border-red-500 " : "border-gray-400 "}shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50`}
                    id="options-menu"
                    aria-haspopup="true"
                    aria-expanded="true"
                    onClick={toggleDropdownLang}
                  >
                    {language.length > 0 ? language : "Select Language"}
                    {language.length > 0 ? <div className='flex gap-1'>
                      <MdCancel className='text-red-400 text-m' onClick={() => {
                        setLanguage("")
                        setIsOpenLang(true)
                      }} />
                      <FaCheck className='text-green-400 text-m' />
                    </div> : <FaChevronDown />}


                  </button>
                  {
                    (allRequirdFilled && language.length === 0) && <label for="input-label" className="block text-xs mb-1 ml-1 text-red-500">Language is Required</label>
                  }
                </div>

                {isOpenLang && (
                  <div
                    className="origin-top-right absolute mt-2 w-[100%] rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="options-menu"
                  >
                    <div className="py-1 duration-200" role="none">

                      {
                        languageData.map(item => (
                          <h6
                            key={item.id}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                            onClick={() => {
                              setLanguage(item.code)
                              setIsOpenLang(false)
                            }}
                          >{item.name}
                          </h6>

                        ))
                      }
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className='flex gap-1 w-full mt-1'>
              <div className="relative inline-block w-1/3">
                <label htmlFor="input-label" className="block text-sm font-medium mb-1">Header Type</label>
                <div>
                  <button
                    type="button"
                    className={`inline-flex w-full justify-between items-center rounded-md border ${allRequirdFilled && header.length == 0 ? "border-red-500 " : "border-gray-400 "}shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50`}
                    id="options-menu"
                    aria-haspopup="true"
                    aria-expanded="true"
                    onClick={toggleDropdownHeader}
                  >
                    {header.length > 0 ? header : "Select header"}
                    {header.length > 0 && header != "NONE" ? <div className='flex gap-1'>
                      <MdCancel className='text-red-400 text-m' onClick={() => {
                        setHeader("")
                        setIsOpenHeader(true)
                      }} />
                      <FaCheck className='text-green-400 text-m' />
                    </div> : <FaChevronDown />}


                  </button>
                </div>

                {isOpenHeader && (
                  <div
                    className="origin-top-right relative mt-2 w-2/3 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="options-menu"
                  >
                    <div className="py-1 duration-200" role="none">

                      {
                        headerData.map(item => (
                          <h6
                            key={item.id}
                            className="block  px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                            onClick={() => {
                              setHeader(item.name)
                              setIsOpenHeader(false)
                            }}
                          >{item.name}
                          </h6>
                        ))
                      }
                    </div>
                  </div>
                )}
              </div>
              {
                header == "TEXT" && <div className='inline-block w-2/3'>
                  <label htmlFor="input-label" className="block text-sm mb-1 font-medium"><span className='text-sm text-red-500 font-medium'>*</span>Header Text</label>
                  <input type="text" maxLength={60} value={headerText} id="input-label" onChange={(e) => setHeaderText(e.target.value)} className={`py-2 px-4 block w-full rounded-lg text-sm border mb-1 outline-none ${allRequirdFilled && headerText.length == 0 ? "border-red-500" : "border-gray-400"} `} placeholder="Enter header text" />

                  {
                    (allRequirdFilled && headerText.length === 0) ? <label for="input-label" className="block text-xs mb-1 ml-1 text-red-500">Header Text is Required</label> : <p className='text-[9px] font-semibold text-red-600 ml-1'>{headerText.length}/60</p>
                  }
                </div>
              }
              {
                (header == "IMAGE" || header == "VIDEO" || header == "DOCUMENT") && <div className='inline-block w-2/3' >
                  <label htmlFor="input-label" className="block text-sm mb-1 font-medium">Media file</label>
                  <label htmlFor="file-input" class="sr-only">Choose file</label>
                  <input type="file" onChange={handleFileChange} name="file-input" id="file-input" class="block w-full border border-gray-400 shadow-sm rounded-lg text-sm focus:z-10 cursor-pointer  file:bg-gray-50 file:border-0 file:me-4 file:py-2"></input>

                  {
                    (allRequirdFilled && mediaId.length === 0) && <p className='text-red-500 text-xs'>{header === "IMAGE" ? "Select jpeg or png image" : header === "VIDEO" ? "Select mp4 video file" : header === "DOCUMENT" ? "Select pdf files" : ''}</p>
                  }
                </div>
              }

            </div>
            {
              (headerValues.length > 0 && header == "TEXT") && <div className="flex flex-wrap items-center mt-3">
                <label htmlFor="input-label" className="block text-sm mb-1 font-medium"><span className='text-sm text-red-500 font-medium'>* </span>Sample Header Value</label>
                <input
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyDown={handleInputKeyDown}
                  className="border border-gray-400 rounded-md h-8 text-sm p-2 w-full outline-none"
                  placeholder="Enter Sample Header Value"
                />
                {tags.map((tag, index) => (
                  <div key={index} className="bg-gray-200 rounded-full px-3 py-0 mr-2 mb-2 mt-2 flex items-center">
                    <span>{tag}</span>
                    <button onClick={() => handleTagRemove(tag)} className="ml-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M10 0c-5.522 0-10 4.477-10 10s4.478 10 10 10 10-4.477 10-10-4.478-10-10-10zm4.95 13.536c.39.39.39 1.023 0 1.414-.391.39-1.024.39-1.415 0l-3.536-3.535-3.535 3.535c-.391.39-1.024.39-1.415 0-.39-.391-.39-1.024 0-1.414l3.535-3.536-3.535-3.535c-.39-.391-.39-1.024 0-1.415.391-.39 1.024-.39 1.415 0l3.536 3.535 3.535-3.535c.391-.39 1.024-.39 1.415 0 .39.391.39 1.024 0 1.415l-3.535 3.536 3.535 3.535z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            }

            <label htmlFor="input-label" className="block text-sm mb-1 mt-2 font-medium"><span className='text-sm text-red-500 font-medium'>*</span>Body Text</label>
            {/* <label htmlFor="input-label" className="block text-sm mt-2 mb-1 font-medium">Body Text</label> */}
            <ReactQuill
              value={bodyText}
              onChange={handleChange}
              className={`mt-0 ${(allRequirdFilled && bodyText.length == 0) ? "border-red-500" : "border-gray-400"}`}
              modules={{
                toolbar: [
                  ['bold', 'italic', 'strike'],
                ]
              }}
              formats={[
                'header', 'font', 'size',
                'bold', 'italic', 'underline', 'strike', 'blockquote',
                'list', 'bullet',
                'link', 'image', 'video'
              ]}
            />

            {
              (allRequirdFilled && bodyText.length === 11) ? <label for="input-label" className="block text-xs mb-1 ml-1 mt-2 text-red-500">Body Text is Required</label> : <p className='text-[9px] font-semibold text-red-600 ml-1'>{bodyText.length}/1024</p>
            }

            {
              bodyValues.length > 0 && <div className="flex flex-wrap items-center mt-3">
                <label htmlFor="input-label" className="block text-sm mb-1 font-medium"><span className='text-sm text-red-500 font-medium'>* </span>Sample Body Value</label>
                <input
                  type="text"
                  value={inputBodyValue}
                  onChange={handleInputBodyChange}
                  onKeyDown={handleInputKeyBodyDown}
                  className="border border-gray-400 rounded-md h-8 text-sm p-2 w-full outline-none"
                  placeholder="Enter Sample Body Value"
                />
                {bodyTags.map((tag, index) => (
                  <div key={index} className="bg-gray-200 rounded-full px-3 py-0 mr-2 mb-2 mt-2 flex items-center">
                    <span>{tag}</span>
                    <button onClick={() => handleBodyTagRemove(tag)} className="ml-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M10 0c-5.522 0-10 4.477-10 10s4.478 10 10 10 10-4.477 10-10-4.478-10-10-10zm4.95 13.536c.39.39.39 1.023 0 1.414-.391.39-1.024.39-1.415 0l-3.536-3.535-3.535 3.535c-.391.39-1.024.39-1.415 0-.39-.391-.39-1.024 0-1.414l3.535-3.536-3.535-3.535c-.39-.391-.39-1.024 0-1.415.391-.39 1.024-.39 1.415 0l3.536 3.535 3.535-3.535c.391-.39 1.024-.39 1.415 0 .39.391.39 1.024 0 1.415l-3.535 3.536 3.535 3.535z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            }

            <label htmlFor="input-label" className="block text-sm mb-1 mt-4 font-medium">Footer Text</label>
            <input type="text" value={footerText} maxLength={60} id="input-label" onChange={(e) => setFooterText(e.target.value)} className={`py-2 px-4 w-full block rounded-lg text-sm border mb-1 outline-none border-gray-400 `} placeholder="Enter footer text" />
            <p className='text-[9px] font-semibold text-red-600 ml-1'>{footerText.length}/60</p>

            {/* Button Dropdown */}
            <div className='w-full flex'>
              <div className="relative inline-block w-1/3 mt-2">
                <label htmlFor="input-label" className="block text-sm font-medium mb-1">Buttons</label>
                <div>
                  <button
                    type="button"
                    className={`inline-flex w-full justify-between items-center rounded-md border border-gray-400shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50`}
                    id="options-menu"
                    aria-haspopup="true"
                    aria-expanded="true"
                    onClick={toggleDropdownButton}
                  >
                    {buttonType.length > 0 ? button : "Select Buttons"}
                    {buttonType.length > 0 ? <div className='flex gap-1'>
                      <MdCancel className='text-red-400 text-m' onClick={() => {
                        setButton("")
                        setButtonType("")
                        setIsOpenButton(true)
                      }} />
                      <FaCheck className='text-green-400 text-m' />
                    </div> : <FaChevronDown />}


                  </button>
                </div>

                {isOpenButton && (
                  <div
                    className="origin-top-right absolute mt-2 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="options-menu"
                  >
                    <div className="py-1 duration-200" role="none">

                      {
                        buttonData.map(item => (
                          <h6
                            key={item?.id}
                            // disabled={item.disabled}
                            className={`block px-4 py-2 text-sm font-medium  text-gray-700 hover:bg-gray-100 hover:text-gray-900  ${item.disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
                            onClick={() => {
                              if (!item.disabled) {
                                setButton(item?.name)
                                setButtonType(item?.code)
                                setIsOpenButton(false)
                              }
                            }}
                          >{item?.name}
                            <p className='text-xs font-light'>{item?.count} max buttons</p>
                          </h6>
                        ))
                      }
                    </div>
                  </div>
                )}
              </div>
              {
                buttonType.length > 0 && <button type="button" className="h-9 ml-4 mt-8 px-4 inline-flex items-center text-sm  rounded-lg border border-transparent bg-gray-600 text-white" onClick={handleButtonAdd}>
                  Add Button
                </button>
              }
            </div>



            {
              buttonType === "URL" && <><div className='flex gap-2 mt-3'>
                <div className='w-1/3 inline-block'>
                  <label htmlFor="input-label" className="block text-sm mb-1 font-medium"><span className='text-sm text-red-500 font-medium'>*</span>Button Name</label>
                  <input type="text" value={buttonName} maxLength={25} id="input-label" onChange={(e) => setButtonName(e.target.value)} className={`py-2 px-4 w-full block rounded-lg text-sm border mb-1 outline-none ${allRequirdFilled && buttonName.length == 0 ? "border-red-500" : "border-gray-400"} `} placeholder="Enter Template Name" />
                  <p className='text-[9px] font-semibold text-red-600 ml-1'>{buttonName.length}/25</p>
                </div>


                <div className="relative inline-block w-1/4">
                  <label htmlFor="input-label" className="block text-sm font-medium mb-1">Url Type</label>
                  <div>
                    <button
                      type="button"
                      className={`inline-flex w-full justify-between items-center rounded-md border ${allRequirdFilled && urlType.length == 0 ? "border-red-500 " : "border-gray-400 "}shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50`}
                      id="options-menu"
                      aria-haspopup="true"
                      aria-expanded="true"
                      onClick={toggleDropdownUrlType}
                    >
                      {urlType.length > 0 ? urlType : "Select Url Type"}
                      {urlType.length > 0 ? <div className='flex gap-1'>
                        <MdCancel className='text-red-400 text-m' onClick={() => {
                          setUrlType("")
                          setIsOpenUrlType(true)
                        }} />
                        <FaCheck className='text-green-400 text-m' />
                      </div> : <FaChevronDown />}


                    </button>
                  </div>

                  {isOpenUrlType && (
                    <div
                      className="origin-top-right absolute mt-2 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                      role="menu"
                      aria-orientation="vertical"
                      aria-labelledby="options-menu"
                    >
                      <div className="py-1 duration-200" role="none">
                        {
                          urlData.map(item => (
                            <h6
                              key={item?.id}
                              className="block px-4 py-2 text-sm font-medium  text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                              onClick={() => {
                                setUrlType(item?.name)
                                setIsOpenUrlType(false)
                              }}
                            >{item?.name}
                            </h6>
                          ))
                        }
                      </div>
                    </div>
                  )}
                </div>
                <div className='w-[50%] inline-block'>
                  <label htmlFor="input-label" className="block text-sm mb-1 font-medium"><span className='text-sm text-red-500 font-medium'>*</span>Website URL</label>
                  <input type="text" value={buttonUrlString} id="input-label" maxLength={2000} onChange={(e) => setButtonUrlString(e.target.value)} className={`py-2 px-4 w-full block rounded-lg text-sm border font-medium mb-1 outline-none ${allRequirdFilled && buttonUrlString.length == 0 ? "border-red-500" : "border-gray-400"} `} placeholder={urlType == "STATIC" ? "https://www.example.com" : "https://www.example.com/{{1}}"} />
                  <p className='text-[9px] font-semibold text-red-600 ml-1'>{buttonUrlString.length}/2000</p>
                </div>
              </div>
              {
                urlType == "DYNAMIC" && buttonUrlString && <>
                    <label htmlFor="input-label" className="block text-sm mb-0 font-medium"><span className='text-sm text-red-500 font-medium'>*</span>Add sample URL</label>
                <label htmlFor="input-label" className="block text-xs mb-1 font-medium">To help us review your message template, please add an example of the website URL. Do not use real customer information.</label>
                <input type="text" value={buttonUrlDynamicString} id="input-label" maxLength={2000} onChange={(e) => setButtonUrlDynamicString(e.target.value)} className={`py-2 px-4 w-full block rounded-lg text-sm border ont-medium mb-1 outline-none ${allRequirdFilled && buttonUrlString.length == 0 ? "border-red-500" : "border-gray-400"} `} placeholder={`Enter full URL for ${buttonUrlString}`+"/{{1}}"} />
                </>
              }
              
              </>
            }
            {
              buttonType === "PHONE_NUMBER" && <div className='flex gap-2 mt-3'>
                <div className='w-1/3 inline-block'>
                  <label htmlFor="input-label" className="block text-sm mb-1 font-medium"><span className='text-sm text-red-500 font-medium'>*</span>Button Name</label>
                  <input type="text" value={buttonName} maxLength={20} id="input-label" onChange={(e) => setButtonName(e.target.value)} className={`py-2 px-4 w-full block rounded-lg text-sm border mb-1 outline-none ${allRequirdFilled && buttonName.length == 0 ? "border-red-500" : "border-gray-400"} `} placeholder="Enter Button Name" />
                  <p className='text-[9px] font-semibold text-red-600 ml-1'>{buttonName.length}/25</p>
                </div>
                <div className='w-2/3 inline-block'>
                  <label htmlFor="input-label" className="block text-sm mb-1 font-medium"><span className='text-sm text-red-500 font-medium'>*</span>Phone Number (9199887766)</label>
                  <input maxLength={10} type="text" value={buttonCallString} id="input-label" onChange={(e) => setButtonCallString(e.target.value)} className={`py-2 px-4 w-full block rounded-lg text-sm border mb-1 outline-none ${allRequirdFilled && buttonCallString.length == 0 ? "border-red-500" : "border-gray-400"} `} placeholder="Enter Phone Number" />
                  <p className='text-[9px] font-semibold text-red-600 ml-1'>{buttonCallString.length}/10</p>
                </div>
              </div>
            }
            {
              buttonType === "COPY_CODE" && <div className='flex gap-2 mt-3'>
                <div className='w-1/3 inline-block'>
                  <label htmlFor="input-label" className="block text-sm mb-1 font-medium"><span className='text-sm text-red-500 font-medium'>*</span>Button Name</label>
                  <input disabled type="text" value={btnNameOfferCode} id="input-label" className={`py-2 px-4 w-full block rounded-lg text-sm border mb-1 outline-none ${allRequirdFilled && btnNameOfferCode.length == 0 ? "border-red-500" : "border-gray-400"} `} placeholder="Enter Button Name" />
                </div>
                <div className='w-2/3 inline-block'>
                  <label htmlFor="input-label" className="block text-sm mb-1 font-medium"><span className='text-sm text-red-500 font-medium'>*</span>Offer Code (XXHA25)</label>
                  <input maxLength={15} type="text" value={buttonOfferCodeString} id="input-label" onChange={(e) => setButtonOfferCodeString(e.target.value)} className={`py-2 px-4 w-full block rounded-lg text-sm border mb-1 outline-none ${allRequirdFilled && buttonOfferCodeString.length == 0 ? "border-red-500" : "border-gray-400"} `} placeholder="Enter Phone Number" />
                  <p className='text-[9px] font-semibold text-red-600 ml-1'>{buttonOfferCodeString.length}/15</p>
                </div>
              </div>
            }

            {
              buttonType === "QUICK_REPLY" && <div className='flex gap-2 mt-3'>
                <div className='w-1/3 inline-block'>
                  <label htmlFor="input-label" className="block text-sm mb-1 font-medium"><span className='text-sm text-red-500 font-medium'>*</span>Button Name</label>
                  <input type="text" value={buttonName} id="input-label" onChange={(e) => setButtonName(e.target.value)} className={`py-2 px-4 w-full block rounded-lg text-sm border mb-1 outline-none ${allRequirdFilled && buttonName.length == 0 ? "border-red-500" : "border-gray-400"} `} placeholder="Enter Button Name" />
                  <p className='text-[9px] font-semibold text-red-600 ml-1'>{buttonName.length}/2 5</p>
                </div>
              </div>
            }

            {
              allButtonArray.length > 0 && <div className=" overflow-y-auto h-auto mt-4">
                <div className="flex flex-col">
                  {/* <div className="- my-2 overflow-x-auto"> */}
                  <div className="">
                    <div className="p-1.5 min-w-full inline-block align-middle">
                      <div className="overflow-hidden">
                        <table className="min-w-full divide-gray-200">
                          <thead>
                            <tr>
                              <th scope="col" className="px-4 py-2 text-start text-sm font-semibold text-black uppercase">Action</th>
                              <th scope="col" className="px-4 py-2 text-start text-sm font-semibold text-black uppercase">Type</th>
                              <th scope="col" className="px-4 py-2 text-start text-sm font-semibold text-black uppercase">Button Text</th>
                              <th scope="col" className="px-4 py-2 text-start text-sm font-semibold text-black uppercase">Url Type</th>
                              <th scope="col" className="px-4 py-2 text-start text-sm whitespace-break-spaces font-semibold text-black uppercase">URL/Phone No</th>
                              {/* <th scope="col" className="px-4 py-2 text-start text-sm font-semibold text-black uppercase">Status</th> */}
                            </tr>
                          </thead>
                          <tbody className="divide-gray-200">
                            {
                              allButtonArray.map((item, index) => {
                                console.log("item", item);
                                return (
                                  <tr>
                                    <td className="px-4 py-3 flex gap-1 whitespace-nowrap text-sm text-gray-800 ">
                                      <FaTrash className='cursor-pointer text-lg text-red-500' onClick={() => setAllButtonArray(allButtonArray.filter((items, i) => i !== index))} />
                                      <FaEdit className='cursor-pointer text-lg text-green-500' onClick={() => {
                                        setButtonType(item?.type);
                                        setButtonName(item?.text);
                                        if (item?.type === "URL") {
                                          setButtonUrlString(item?.url);
                                          setUrlType(item?.example?.length > 0 ? "DYNAMIC" : "STATIC");
                                        } else if (item?.type === "PHONE_NUMBER") {
                                          setButtonCallString(item?.phone_number);
                                        } else if (item?.type === "QUICK_REPLY") {
                                          setButtonOfferCodeString(item?.text);
                                        } else {

                                        }
                                        // setButtonType(item?.type);
                                      }} />
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-800">{item?.type}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">{item?.text}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">{item?.example?.length > 0 ? "Dynamic" : item?.type == "URL" ? "Static" : "-"}</td>
                                    <td className="px-4 py-3 whitespace-nowrap w-24 text-sm text-gray-800">{item?.url || item?.phone_number || (item?.example && item?.example[0]) || "-"}</td>
                                  </tr>
                                )
                              })
                            }

                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            }






          </div>



          {/* live preview */}
          <div className=' w-1/3 px-4 '>
            {/* <img src={bgUrlImage} alt="Header" className="w-full h-full relative object-center rounded-lg mt-2" /> */}
            <h4 className='text-lg font-medium'>Template Preview</h4>
            {
              header === "IMAGE" && <img src={tempMediaUrl} alt="Header" className="w-full h-[150px] object-center rounded-lg mt-2" />
            }
            {
              header === "VIDEO" && <video
                src="https://watools.uvtechsoft.com:9888/static/clientMediafiles//closeup_of_insect_and_flower_in_wild_nature_6892017.mp4"
                controls
                className="w-full h-[150px] object-center rounded-lg mt-2"
                autoPlay={true}
              />
            }


            <article class="text-wrap ... bg-white p-2 rounded-lg">
              <p className='text-xs font-semibold'>{headerText}</p>
              <p className='text-xs' dangerouslySetInnerHTML={{ __html: bodyText }}></p>
              <p className='text-xs text-gray-400 '>{...footerText}</p>
              <p className='text-[10px] mt-2 text-end '>9.00 PM</p>
              <hr />
              <hr />
            </article>
            <div className='px-2'>

              {
                allButtonArray.length > 0 && allButtonArray.map((item, index) => {
                  return (
                    <div className='flex justify-center mt-[3px] gap-1'>
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
        <div className="flex justify-end right-3 w-[15%] gap-2 fixed  bottom-2">
          <button type="button" className="py-2  px-4 inline-flex items-center gap-x-2 text-sm  rounded-lg border border-transparent bg-gray-400 text-white hover:bg-red-500 disabled:opacity-50 disabled:pointer-events-none dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600" onClick={toggleDrawer}>
            Close
          </button>
          <button type="button" className="py-2  px-4 inline-flex items-center gap-x-2 text-sm  rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600" onClick={handleSubmit}>
            {
              loadingSpin && <span className="animate-spin inline-block size-4 border-[2px] border-current border-t-transparent text-white rounded-full" role="status" aria-label="loading"></span>
            }
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}

export default TemplateForm;
