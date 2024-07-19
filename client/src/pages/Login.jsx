import React, { useEffect, useState } from 'react'
import { loginAPI } from '../constants/constants'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { setLogin, setUserData, setRole, setUserCrendentials, setAuthToken, setPlanData } from '../store/clientSlice'
import { useDispatch } from 'react-redux'
import { FaEye, FaEyeSlash } from 'react-icons/fa6'

const Login = () => {
    const navigate = useNavigate()
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const dispatch = useDispatch()

    const handleLogin = async (e) => {
        e.preventDefault()
        if (!username || !password) {
            toast.info("Please fill all the fields")
        } else {
            const res = await loginAPI("/client/clientLogin", {
                username: username,
                password: password
            })
            if (res.status) {
                toast.success(res.message)
                dispatch(setLogin(true))
                dispatch(setUserData(res?.data))
                dispatch(setRole(res?.data?.role))
                dispatch(setAuthToken(res?.AuthToken))
                dispatch(setUserCrendentials(res?.data?.clinetConfig ? res?.data?.clinetConfig[0] : {}))
                dispatch(setPlanData(res.planData ? res.planData : {}))
                navigate("/")
            } else {
                toast.error(res.message)
            }
        }
    }
    return (
        <>
            <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                    <img
                        className="mx-auto h-14 w-auto"
                        src="./mail.png"
                        alt="Your Company"
                    />
                    <h2 className="mt-5 text-center text-3xl font-bold leading-9 tracking-tight text-gray-900">
                        <span className='text-green-400'>WhatsUp </span><span className='text-orange-400'>In</span><span className='text-gray-100'>d</span><span className='text-green-400'>ia</span>
                        <p className='text-sm font-normal'>Revolutionizing Messaging for India</p>
                    </h2>
                </div>

                <div className="mt-5 sm:mx-auto sm:w-full sm:max-w-sm">
                    <form className="space-y-6" action="#" method="POST">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                                Email address
                            </label>
                            <div className="mt-2">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 outline-none px-4 sm:text-sm sm:leading-6"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between">
                                <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                                    Password
                                </label>
                                <div className="text-sm">
                                    <a href="#" className="font-semibold text-blue-600 hover:text-blue-500">
                                        Forgot password?
                                    </a>
                                </div>
                            </div>
                            <div className="mt-2">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full  rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 outline-none px-4 sm:text-sm sm:leading-6"
                                />
                                {
                                    showPassword ? <FaEyeSlash className='absolute cursor-pointer right-[36%] top-[62.4%]' onClick={() => setShowPassword(!showPassword)}/> : <FaEye className='absolute cursor-pointer right-[36%] top-[62.4%]' onClick={() => setShowPassword(!showPassword)}/>
                                }

                                
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="flex w-full justify-center rounded-md bg-blue-500 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm"
                                onClick={handleLogin}
                            >
                                Login
                            </button>
                        </div>
                    </form>

                    <p className="mt-10 text-center text-sm text-gray-500">
                        Not a member?{' '}
                        <a href="#" className="font-semibold leading-6 text-blue-500 hover:text-blue-600">
                            Start a 14 day free trial
                        </a>
                    </p>
                </div>
            </div>
        </>
    )
}


export default Login