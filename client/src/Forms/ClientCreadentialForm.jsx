import React, { useState, useRef, useEffect } from 'react';
import { FaArrowCircleDown, FaArrowDown, FaCheck, FaChevronDown, FaClosedCaptioning, FaCross, FaDoorClosed, FaWindowClose } from "react-icons/fa";
import { FaFolderClosed } from 'react-icons/fa6';
import { MdCancel } from 'react-icons/md';
import { toast } from 'react-toastify';
import { createAPI, getAPI, updateAPI } from '../constants/constants';
import { useDispatch, useSelector } from 'react-redux';
import { setUserCrendentials } from '../store/clientSlice';

const ClientCreadentialForm = ({ drawerCondition, btnName, data, wpClientId, fetchData = () => { } }) => {

  function isEmptyObject(obj) {
    return Object.entries(obj).length === 0;
  }

  const [createOrUpdate, setCreateOrUpdate] = useState(isEmptyObject(data));

  const routeUrl = createOrUpdate ? `/clientConfig/create` : '/clientConfig/update';
  const [loadingSpin, setLoadingSpin] = useState(false);
  const [wpMobileNo, setWpMobileNo] = useState(data.wpRegisteredMobileNo ? data?.wpRegisteredMobileNo : '');
  const [wpPhoneNoId, setWphoneNoId] = useState(data.wpPhoneNoId ? data?.wpPhoneNoId : '');
  const [wpBussinessAccId, setWpBussinessAccId] = useState(data.wpBussinessAccId ? data?.wpBussinessAccId : '');
  const [wpToken, setWpToken] = useState(data.wpPermanentToken ? data?.wpPermanentToken : '');
  const [wpApiVersion, setWpApiVersion] = useState(data.wpApiVersion ? data?.wpApiVersion : '');
  const [wpAppId, setWpAppId] = useState(data.wpAppId ? data?.wpAppId : '');
  const [allRequirdFilled, setAllRequirdFilled] = useState(false);



  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const drawerRef = useRef(null);
  const toggleDrawer = () => {
    drawerCondition.setIsDrawerCredentialOpen(false);
  };

  const handleClickOutside = (event) => {
    if (drawerRef.current && !drawerRef.current.contains(event.target)) {
      drawerCondition.setIsDrawerCredentialOpen(false);
    }
  };




  const handleSubmit = async (event) => {
    event.preventDefault();
    setAllRequirdFilled(true);
    if (!wpMobileNo || !wpPhoneNoId || !wpBussinessAccId || !wpToken || !wpAppId || !wpApiVersion) {
      toast.info("All Fields are required!")
    } else {
      setLoadingSpin(true);
      let objectData = {}
      if (createOrUpdate) {
        objectData = {
          wpClientId: wpClientId,
          wpRegisteredMobileNo: wpMobileNo,
          wpPhoneNoId: wpPhoneNoId,
          wpBussinessAccId: wpBussinessAccId,
          wpPermanentToken: wpToken,
          wpApiVersion: wpApiVersion,
          wpAppId: wpAppId,
        }

        const res = await createAPI(routeUrl, {
          ...objectData
        })
        if (res.status) {
          // const resConfig = await getAPI("/client/getClientConfigInfo", { id: wpClientId })
          // if (resConfig.status) {
          //   const config = resConfig.data[0].clinetConfig.length > 0 ? resConfig.data[0].clinetConfig[0] : {}
          //   dispatch(setUserCrendentials(config))
          // }
          fetchData()
          toast.success(res.message)
          setWpMobileNo('');
          setWphoneNoId('');
          setWpBussinessAccId('');
          setWpToken('');
          setWpApiVersion('');
          setWpAppId('');
          setLoadingSpin(false);
          drawerCondition.setIsDrawerCredentialOpen(false);
        } else {
          toast.error(res.message)
          setLoadingSpin(false);
        }
      } else {
        objectData = {
          wpClientId: wpClientId,
          id: data?._id,
          wpClientId: wpClientId,
          wpRegisteredMobileNo: wpMobileNo,
          wpPhoneNoId: wpPhoneNoId,
          wpBussinessAccId: wpBussinessAccId,
          wpPermanentToken: wpToken,
          wpApiVersion: wpApiVersion,
          wpAppId: wpAppId,
        }

        const res = await updateAPI(routeUrl, {
          ...objectData
        })
        if (res.status) {
          // const resConfig = await getAPI("/client/getClientConfigInfo", { id: wpClientId })
          // if (resConfig.status) {
          //   const config = resConfig.data[0].clinetConfig.length > 0 ? resConfig.data[0].clinetConfig[0] : {}
          //   dispatch(setUserCrendentials(config))
          // }
          fetchData()
          toast.success(res.message)
          setWpMobileNo('');
          setWphoneNoId('');
          setWpBussinessAccId('');
          setWpToken('');
          setWpApiVersion('');
          setWpAppId('');
          setLoadingSpin(false);
          data = {}
          drawerCondition.setIsDrawerCredentialOpen(false);
        } else {
          toast.error(res.message)
          setLoadingSpin(false);
        }
      }
    }
  }


  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const dropDownData = [
    {
      "id": 1,
      "name": "v16.0"
    },
    {
      "id": 2,
      "name": "v17.0"
    },
    {
      "id": 3,
      "name": "v18.0"
    },
    {
      "id": 4,
      "name": "v19.0"
    },
    {
      "id": 5,
      "name": "v20.0"
    }
  ]


  return (
    <div ref={drawerRef} className={`fixed inset-y-0 right-0 z-10 w-96 bg-white border-l border-gray-300 shadow-lg ${drawerCondition.isDrawerCredentialOpen ? 'block' : 'hidden'}`}>
      <div className="flex justify-between p-4">
        <h4 className="text-black text-xl font-semibold">{btnName}</h4>
        <button onClick={toggleDrawer} className="text-black hover:text-red-500 hover:scale-110 duration-200 text-2xl">
          <FaWindowClose />
        </button>
      </div>
      <div className="px-4">
        <div className=" overflow-y-auto max-h-[85vh]">
          <label htmlFor="input-label" className="block text-xs mb-1"><span className='text-sm text-red-500 font-medium'>* </span> Registered Mobile No</label>
          <input type="text" value={wpMobileNo} id="input-label" onChange={(e) => setWpMobileNo(e.target.value)} className={`py-2 px-4 block w-full rounded-lg text-sm border  mb-1 outline-none ${allRequirdFilled && wpMobileNo.length == 0 ? "border-red-500" : "border-gray-400"} `} placeholder="9115550109647" />
          {
            (allRequirdFilled && wpMobileNo.length === 0) && <label for="input-label" className="block text-xs mb-1 ml-1 text-red-500">Registered Mobile No is Required</label>
          }

          <label htmlFor="input-label" className="block text-xs  mb-1"><span className='text-sm text-red-500 font-medium'>* </span>Phone Number ID</label>
          <input type="email" value={wpPhoneNoId} id="input-label" onChange={(e) => setWphoneNoId(e.target.value)} className={`py-2 px-4 block w-full rounded-lg text-sm border  mb-1 outline-none ${allRequirdFilled && wpPhoneNoId.length == 0 ? "border-red-500" : "border-gray-400"} `} placeholder="111327325250381" />
          {
            (allRequirdFilled && wpPhoneNoId.length === 0) && <label for="input-label" className="block text-xs mb-1 ml-1 text-red-500">Phone No Id is Required</label>
          }


          <label htmlFor="input-label" className="block text-xs  mb-1"><span className='text-sm text-red-500 font-medium'>* </span>Bussiness Account ID</label>
          <input type="text" value={wpBussinessAccId} id="input-label" onChange={(e) => setWpBussinessAccId(e.target.value)} className={`py-2 px-4 block w-full rounded-lg text-sm border  mb-1 outline-none ${allRequirdFilled && wpBussinessAccId.length == 0 ? "border-red-500" : "border-gray-400"} `} placeholder="106503405738287" />
          {
            (allRequirdFilled && wpBussinessAccId.length === 0) && <label for="input-label" className="block text-xs mb-1 ml-1 text-red-500">Bussiness Acc Id is Required</label>
          }




          <label htmlFor="input-label" className="block text-xs  mb-1"><span className='text-sm text-red-500 font-medium'>* </span>App ID</label>
          <input type="text" value={wpAppId} id="input-label" onChange={(e) => setWpAppId(e.target.value)} className={`py-2 px-4 block w-full rounded-lg text-sm border  mb-1 outline-none ${allRequirdFilled && wpAppId.length == 0 ? "border-red-500" : "border-gray-400"} `} placeholder="581563910221967" />
          {
            (allRequirdFilled && wpAppId.length === 0) && <label for="input-label" className="block text-xs mb-1 ml-1 text-red-500">App Id is Required</label>
          }




          <label htmlFor="input-label" className="block text-xs  mb-1"><span className='text-sm text-red-500 font-medium'>* </span>API Version</label>
          {/* <div className='mt-2' />   */}
          {/* <input type="text" id="input-label" onChange={(e) => wpApiVersion(e.target.value)} className="py-2 px-4 block w-full  rounded-lg text-sm border border-gray-400 mb-1" placeholder="v17.0" /> */}

          <div className="relative inline-block text-left w-full">
            <div>
              <button
                type="button"
                className={`inline-flex w-full justify-between items-center rounded-md border ${allRequirdFilled && wpApiVersion.length == 0 ? "border-red-500 " : "border-gray-400 "}shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50`}
                id="options-menu"
                aria-haspopup="true"
                aria-expanded="true"
                onClick={toggleDropdown}
              >
                {wpApiVersion.length > 0 ? wpApiVersion : "Select API Version"}
                {wpApiVersion.length > 0 ? <div className='flex gap-1'>
                  <MdCancel className='text-red-400 text-m' onClick={() => {
                    setWpApiVersion("")
                    setIsOpen(true)
                  }} />
                  <FaCheck className='text-green-400 text-m' />
                </div> : <FaChevronDown />}


              </button>
            </div>

            {isOpen && (
              <div
                className="origin-top-right absolute mt-2 w-[90%] left-4 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
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
                          setWpApiVersion(item.name)
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
          {
            (allRequirdFilled && wpApiVersion.length === 0) && <label for="input-label" className="block text-xs mb-1 ml-1 text-red-500">Api Version is Required</label>
          }


          <label htmlFor="input-label" className="block text-xs  mb-1"><span className='text-sm text-red-500 font-medium'>* </span>Permanant Access Token</label>
          {/* <input type="text" id="input-label" onChange={(e) => wpToken(e.target.value)} className="py-2 px-4 block w-full  rounded-lg text-sm border border-gray-400 mb-1" placeholder="CREPA0189L" /> */}
          {/* <div class="max-w-sm space-y-3"> */}
          <textarea value={wpToken} className={`py-2 px-4 block w-full rounded-lg text-sm border  mb-1 outline-none ${allRequirdFilled && wpToken.length == 0 ? "border-red-500" : "border-gray-400"} `} onCa rows="5" onChange={(e) => setWpToken(e.target.value)} placeholder="Paste or Enter token"></textarea>
          {
            (allRequirdFilled && wpToken.length === 0) && <label for="input-label" className="block text-xs mb-1 ml-1 text-red-500">Token is Required</label>
          }



        </div>


        <div className="flex justify-end gap-2 fixed inset-x-2 bottom-2">
          <button type="button" className="py-2  px-4 inline-flex items-center gap-x-2 text-sm  rounded-lg border border-transparent bg-gray-400 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600" onClick={toggleDrawer}>
            Close
          </button>
          <button type="button" className="py-2  px-4 inline-flex items-center gap-x-2 text-sm  rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600" onClick={handleSubmit}>
            {
              loadingSpin && <span className="animate-spin inline-block size-4 border-[2px] border-current border-t-transparent text-white rounded-full" role="status" aria-label="loading"></span>
            }
            {createOrUpdate ? "Add Credential" : "Update Credential"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ClientCreadentialForm
