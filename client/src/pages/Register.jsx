import React, { useState } from 'react'
import { FaEye, FaEyeSlash } from 'react-icons/fa6'
import { useNavigate } from 'react-router-dom'
import { postAPI } from '../constants/constants'
import { toast } from 'react-toastify'

const Register = () => {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [mobileNo, setMobileNo] = useState("")
    const [city, setCity] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [password, setPassword] = useState("")
    const navigate = useNavigate()

    const handleRegister = async (e) => {
        e.preventDefault()
        if (!name || !email || !mobileNo || !city || !password) {
            toast.info("Please fill all the fields")
        } else {
            const res = await postAPI("/client/register", {
                clientname: name,
                emailId: email,
                mobileNo: mobileNo,
                address: city,
                password: password
            })
            if (res.status) {
                toast.success("Registration Successfull")
                navigate("/login")
            } else {
                toast.error(res.message)
            }
        }
    }
    return (
        <div className="min-h-full flex-1  bg-gray-50 flex h-screen gap-4 justify-center px-6 py-12 lg:px-8">
            <div className='w-1/2 justify-center items-center flex'>
                <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                    <img
                        className="mx-auto h-12 w-auto"
                        src="./mail.png"
                        alt="Your Company"
                    />
                    <h2 className="mt-1 text-center text-3xl font-bold mb-5 leading-9 tracking-tight text-gray-900">
                        <span className='text-green-400'>WhatsUp </span><span className='text-orange-400'>In</span><span className='text-gray-100'>d</span><span className='text-green-400'>ia</span>
                        <p className='text-xs font-normal'>Revolutionizing Messaging for India</p>
                    </h2>
                    <p className='text-sm mt-2'><span>✔️ </span>Targeted Campaigns to deliver personalized offers</p>
                    <p className='text-sm mt-2'><span>✔️ </span>24x7 instant engagement with no-code chatbots</p>
                    <p className='text-sm mt-2'><span>✔️ </span>Powerful automations to resolve issues faster</p>
                    <p className='text-sm mt-2'><span>✔️ </span>24x7 support</p>
                    <h5 className='mt-7 font-semibold'>Trusted by 50+ customers</h5>
                    <div className="mt-5 flex gap-1 justify-between items-center">
                        <img
                            className="mx-auto h-8 w-10"
                            src="./mail.png"
                            alt="Your Company"
                        />
                        <img
                            className="mx-auto h-8 w-10"
                            src="./mail.png"
                            alt="Your Company"
                        />
                        <img
                            className="mx-auto h-8 w-10"
                            src="./mail.png"
                            alt="Your Company"
                        />
                        <img
                            className="mx-auto h-8 w-10"
                            src="./mail.png"
                            alt="Your Company"
                        />
                        <img
                            className="mx-auto h-8 w-10"
                            src="./mail.png"
                            alt="Your Company"
                        />
                    </div>
                </div>
            </div>
            <div className='w-1/2 justify-center items-center flex flex-col'>
                <h3 className='text-2xl font-semibold'>Create Your Account</h3>
                <div className="mt-5 sm:mx-auto sm:w-full sm:max-w-sm">
                    <form className="space-y-6" action="#" method="POST">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">
                                Full Name
                            </label>
                            <div className="mb-1">
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    autoComplete='off'
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 outline-none px-4 sm:text-sm sm:leading-6"
                                />
                            </div>
                            <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                                Email address
                            </label>
                            <div className="mb-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="off"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 outline-none px-4 sm:text-sm sm:leading-6"
                                />
                            </div>
                            <label htmlFor="mobile" className="block text-sm font-medium leading-6 text-gray-900">
                                Mobile No
                            </label>
                            <div className="mb-1">
                                <input
                                    id="mobile"
                                    name="mobile"
                                    type="text"
                                    autoComplete="off"
                                    value={mobileNo}
                                    onChange={(e) => setMobileNo(e.target.value)}
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 outline-none px-4 sm:text-sm sm:leading-6"
                                />
                            </div>
                            <label htmlFor="mobile" className="block text-sm font-medium leading-6 text-gray-900">
                                City
                            </label>
                            <div className="mb-1">
                                <input
                                    id="city"
                                    name="city"
                                    type="text"
                                    autoComplete="off"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 outline-none px-4 sm:text-sm sm:leading-6"
                                />
                            </div>
                            <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                                Password
                            </label>
                            <div className="mb-1 relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="off"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block  w-full  rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 outline-none px-4 sm:text-sm sm:leading-6"
                                />
                                {
                                    !showPassword ? <FaEyeSlash className='absolute cursor-pointer text-gray-500 right-[3%] top-[30%]' onClick={() => setShowPassword(!showPassword)} /> : <FaEye className='absolute text-gray-500 cursor-pointer right-[3%] top-[30%]' onClick={() => setShowPassword(!showPassword)} />
                                }

                            </div>
                        </div>

                        <div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="flex w-full justify-center rounded-md bg-blue-500 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm"
                                onClick={handleRegister}
                            >
                                Register
                            </button>
                        </div>
                    </form>

                    <p className="mt-6 text-center text-sm text-gray-500">
                        Do you have an account?{' '}
                        <a className="font-semibold cursor-pointer leading-6 text-blue-500 hover:text-blue-600" onClick={() => navigate("/login")}>
                            Login
                        </a>
                    </p>
                </div>
            </div>
        </div>

    )
}

export default Register