import React, { useEffect } from 'react'
import Header from '../components/Header'
import { useState } from 'react'
import { createAPI, getAPI, getCurrentDateTime, getDateTimeAfterDays } from '../constants/constants'
import { toast } from 'react-toastify'
import { MdCheck, MdClose } from 'react-icons/md'
import { useSelector, useDispatch } from 'react-redux'
import { setPlanData } from '../store/clientSlice'

const PurchasePlan = () => {
    const { _id, clientname, mobileNo } = useSelector(state => state.user.userData)
    const [isLoading, setIsLoading] = useState(true)
    const [data, setData] = useState([]);
    const dispatch = useDispatch()
    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        // let filterObject = {}
        setIsLoading(true)
        let res = await getAPI("/pricingPlan/get", {})
        if (res.status) {
            setData(res.data)
            setIsLoading(false)
        } else {
            toast.error("Something went wrong")
            setIsLoading(false)
        }
    }



    const buyPlan = async (item) => {
        setIsLoading(true)
        let res = await createAPI("/purchaseClientPlan/create", {
            planId: item?._id,
            wpClientId: _id,
            startDatetime: getCurrentDateTime(),
            expireDatetime: getDateTimeAfterDays(item?.planExpireIn)
            // planExpireIn: item?.planExpireIn,
            // amount: item?.planPrice,
            // name: clientname,
            // mobileNo: mobileNo

        })
        if (res.status) {
            toast.success("Plan Purchased Successfully")
            dispatch(setPlanData(res.planData))
            setIsLoading(false)
        } else {
            toast.error("Something went wrong")
            setIsLoading(false)
        }
    }

    return (
        <div className='p-1'>
            <Header name="Purchase Plan" />
            <div className="w-full h-2/4 mt-5 p-1 ">
                {
                    data && data.length > 0 ?
                        <div className="grid grid-cols-3 gap-12 overflow-auto">
                            {
                                data.map((item, index) => (

                                    <div key={index} class="flex flex-col p-6 mx-auto max-w-lg text-center text-gray-900 bg-white rounded-lg border border-gray-100 shadow xl:p-8">
                                        <h3 class="mb-2 text-2xl font-semibold">{item?.planName}</h3>
                                        <p class="font-light text-gray-500 sm:text-lg dark:text-gray-400">{item?.description}</p>
                                        <div class="flex justify-center items-baseline my-2">
                                            <span class="mr-2 text-3xl font-extrabold">₹{item?.planPrice}</span>
                                            <span class="text-gray-500 dark:text-gray-400">/month</span>
                                        </div>

                                        <ul role="list" class="mb-8 space-y-4 text-left">
                                            <div class="flex justify-center items-baseline my-2">
                                                <span class="mr-2 text-1xl font-medium">{item?.bulkLimit}</span>
                                                <span class="text-gray-500 dark:text-gray-400">Bulk Send Limit</span>
                                            </div>

                                            <li class="flex items-center space-x-3">

                                                <MdCheck className='text-green-400 text-xl' />
                                                <span>Team size: 1 Agent</span>
                                            </li>
                                            <li class="flex items-center space-x-3">

                                                {
                                                    item?.messageSendAPI ? <MdCheck className='text-green-400 text-xl' /> : <MdClose className='text-red-500 text-xl' />
                                                }

                                                <span>Message Send RestAPI </span>
                                            </li>
                                            <li class="flex items-center space-x-3">
                                                {
                                                    item?.chatBotFeature ? <MdCheck className='text-green-400 text-xl' /> : <MdClose className='text-red-500 text-xl' />
                                                }

                                                <span>Chatbot Automation</span>
                                            </li>
                                            <li class="flex items-center space-x-3">
                                                {
                                                    item?.manageTemplate ? <MdCheck className='text-green-400 text-xl' /> : <MdClose className='text-red-500 text-xl' />
                                                }

                                                <span>Manage Template</span>
                                            </li>
                                            <li class="flex items-center space-x-3">
                                                <MdCheck className='text-green-400 text-xl' />
                                                <span>No setup, or hidden fees</span>
                                            </li>
                                        </ul>
                                        <button class="text-white bg-blue-500 hover:bg-blue-600 font-medium rounded-lg text-sm px-5 py-2.5 text-center" onClick={() => buyPlan(item)}>Buy Now</button>
                                    </div>
                                ))
                            }
                        </div>
                        : isLoading ? <div className="min-h-60 flex flex-col rounded-xl">
                            <div className="flex flex-auto flex-col justify-center items-center p-4 md:p-5">
                                <div className="flex justify-center">
                                    <div className="animate-spin inline-block size-6 border-[3px] border-current border-t-transparent text-blue-600 rounded-full dark:text-blue-500" role="status" aria-label="loading">
                                        <span className="sr-only">Loading...</span>
                                    </div>
                                </div>
                            </div>
                        </div> :
                            <h3 className='text-2xl text-center font-medium mt-1'>No Data Found</h3>

                }
            </div>
        </div>
    )
}

export default PurchasePlan