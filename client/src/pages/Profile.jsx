import React, { useEffect, useState } from 'react'
import Header from '../components/Header'
import { useSelector } from 'react-redux';
import { getAPI } from '../constants/constants';
import { toast } from 'react-toastify';
import ClientForm from '../Forms/ClientForm';
import ClientCreadentialForm from '../Forms/ClientCreadentialForm';

const Profile = () => {
  const { _id } = useSelector(state => state.user.userData)
  const [userData, setUserData] = useState({})
  const [userCrendentials, setUserCrendentials] = useState({})
  const [loading, setLoading] = useState(false)

  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isDrawerCredentialOpen, setIsDrawerCredentialOpen] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])




  const fetchData = async () => {
    setLoading(true)
    let res = await getAPI("/client/getClientConfigInfo", {
      id: _id,
    })
    if (res.status) {
      setUserData(res.data[0])
      setUserCrendentials(res.data[0].clinetConfig[0])
      setLoading(false)
    } else {
      toast.error("Something went wrong")
      setLoading(false)
    }
  }
  return (
    <div className='p-1'>
      <Header name="Profile" />
      {
        loading ? <h1 className='w-full h-full flex justify-center items-center mt-5'>Loading....</h1> : <div>
          <div className='w-full h-42 bg-gray-100 rounded-sm mt-2 p-2'>
            <div className='w-full flex justify-between p-2'>
              <h6 className='text-black text-lg font-medium '>Personal Info</h6>
              <p className='flex text-sm gap-2 self-center bg-blue-500 rounded-sm cursor-pointer text-center px-4 text-white' onClick={() => setIsDrawerOpen(true)}>Edit</p>
            </div>
            <div className='flex justify-between py-1 px-2'>
              <div className='w-1/2 gap-1 px-1'>
                <div className='flex justify-between'>
                  <p className='text-black text-sm font-light w-[40%]'>Client Name</p>
                  <span className='text-l text-l font-light w-[10%]'>:</span>
                  <p className='text-black text-sm font-medium w-[50%]'>{userData?.clientname}</p>
                </div>
                <div className='flex justify-between'>
                  <p className='text-black text-sm font-light w-[40%]'>Client Email</p>
                  <span className='text-l text-l font-light w-[10%]'>:</span>
                  <p className='text-black text-sm font-medium w-[50%]  break-all'>{userData?.emailId}</p>
                </div>
                <div className='flex justify-between'>
                  <p className='text-black text-sm font-light w-[40%]'>Client PAN</p>
                  <span className='text-l text-l font-light w-[10%]'>:</span>
                  <p className='text-black text-sm font-medium w-[50%] uppercase'>{userData?.panNo}</p>
                </div>
                <div className='flex justify-between'>
                  <p className='text-black text-sm font-light w-[40%]'>Client GST</p>
                  <span className='text-l text-l font-light w-[10%]'>:</span>
                  <p className='text-black text-sm font-medium w-[50%] uppercase  break-all'>{userData?.gstNo}</p>
                </div>
              </div>
              <div className='w-1/2 gap-1 px-1'>
                <div className='flex justify-between'>
                  <p className='text-black text-sm font-light w-[40%]'>Client Address</p>
                  <span className='text-l text-l font-light w-[10%]'>:</span>
                  <p className='text-black text-sm font-medium w-[50%]'>{userData?.address}</p>
                </div>
                <div className='flex justify-between'>
                  <p className='text-black text-sm font-light w-[40%]'>Client Mobile No.</p>
                  <span className='text-l text-l font-light w-[10%]'>:</span>
                  <p className='text-black text-sm font-medium w-[50%]'>{userData?.mobileNo}</p>
                </div>
                <div className='flex justify-between'>
                  <p className='text-black text-sm font-light w-[40%]'>Client Status</p>
                  <span className='text-l text-l font-light w-[10%]'>:</span>
                  <p className='text-black text-sm font-medium w-[50%]'>{userData?.isActive ? <span className='bg-green-500 p-1 rounded-md px-2'>Active</span> : <span className='bg-red-500 p-1 rounded-md px-2'>InActive</span>}</p>
                </div>
              </div>
            </div>
          </div>
          <div className='w-full h-[305px] bg-gray-100 rounded-sm mt-2 p-2'>
            <div className='w-full flex justify-between p-2'>
              <h6 className='text-black text-lg font-medium '>Meta Config Details</h6>
              <p className='flex text-sm gap-2 self-center bg-blue-500 rounded-sm cursor-pointer text-center px-4 text-white' onClick={() => setIsDrawerCredentialOpen(true)}>Edit</p>
            </div>
            <div className='flex justify-between py-1 px-2'>


              <div className='w-1/2 gap-1 px-1'>
                <div className='flex justify-between'>
                  <p className='text-black text-sm font-light w-[40%]'>Whatsapp No</p>
                  <span className='text-l text-l font-light w-[10%]'>:</span>
                  <p className='text-black text-sm font-medium w-[50%]'>{userCrendentials?.wpRegisteredMobileNo}</p>
                </div>
                <div className='flex justify-between'>
                  <p className='text-black text-sm font-light w-[40%]'>Phone No ID</p>
                  <span className='text-l text-l font-light w-[10%]'>:</span>
                  <p className='text-black text-sm font-medium w-[50%] break-all'>{userCrendentials?.wpPhoneNoId}</p>
                </div>
                <div className='flex justify-between'>
                  <p className='text-black text-sm font-light w-[40%]'>Bussiness Account ID</p>
                  <span className='text-l text-l font-light w-[10%]'>:</span>
                  <p className='text-black text-sm font-medium w-[50%]  break-all'>{userCrendentials?.wpBussinessAccId}</p>
                </div>
                <div className='flex justify-between'>
                  <p className='text-black text-sm font-light w-[40%]'>App ID </p>
                  <span className='text-l text-l font-light w-[10%]'>:</span>
                  <p className='text-black text-sm font-medium w-[50%]  break-all'>{userCrendentials?.wpAppId}</p>
                </div>
              </div>
              <div className='w-1/2 gap-1 px-1'>
                <div className='flex justify-between'>
                  <p className='text-black text-sm font-light w-[25%]'>API Version</p>
                  <span className='text-l text-l font-light w-[5%]'>:</span>
                  <p className='text-black text-sm font-medium w-[70%] break-all'>{userCrendentials?.wpApiVersion}</p>
                </div>
                <div className='flex justify-between'>
                  <p className='text-black text-sm font-light w-[25%]'>Webhook Url</p>
                  <span className='text-l text-l font-light w-[5%]'>:</span>
                  <p className='text-black text-sm font-medium w-[70%] break-all'>http://www.bookmyappointment.com/webhook</p>
                </div>
                <div className='flex justify-between'>
                  <p className='text-black text-sm font-light w-[25%]'>Verify Token</p>
                  <span className='text-l text-l font-light w-[5%]'>:</span>
                  <p className='text-black text-sm font-medium w-[70%] break-all'>HlnKLTOoELo0Bmpj7jc2yZAnli</p>
                </div>
                <div className='flex justify-between'>
                  <p className='text-black text-sm font-light w-[25%]'>Secret Key</p>
                  <span className='text-l text-l font-light w-[5%]'>:</span>
                  <p className='text-black text-sm font-medium w-[70%] break-all'>{userData?.clientSecretKey}</p>
                </div>
              </div>
            </div>

            <div className='w-full gap-1 px-3'>
              <div className='flex w-full justify-between'>
                <p className='text-black text-sm font-light w-[20%]'>Permanent Token</p>
                <p className='text-black text-sm font-medium w-[80%] break-all'>{userCrendentials?.wpPermanentToken}</p>
              </div>
            </div>
          </div>
        </div>
      }


      {
        isDrawerOpen && <ClientForm drawerCondition={{ isDrawerOpen, setIsDrawerOpen }} btnName="Update Details" data={userData} />
      }

      {
        isDrawerCredentialOpen && <ClientCreadentialForm drawerCondition={{ isDrawerCredentialOpen, setIsDrawerCredentialOpen }} btnName="Update Credential" data={userCrendentials} wpClientId={_id} />
      }

    </div>

  )
}

export default Profile
