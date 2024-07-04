import React, { useState } from 'react'
import { GoGear } from "react-icons/go";
import { AiOutlineLogout, AiOutlineUser } from "react-icons/ai";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setLogin, setRole, setUserData } from '../store/clientSlice';
import UpdatePasswordForm from '../Forms/UpdatePasswordForm';

const Header = ({ name }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { role, userData } = useSelector((state) => state.user)

    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    return (
        <div className='w-full h-10 flex bg-gray-200 rounded-sm justify-between items-center px-3 sticky top-0'>
            <h1 className='text-black text-xl'>{name}</h1>
            <div className='flex'>
                {
                    role === "CLIENT" && <>
                        <AiOutlineUser onClick={() => {
                            navigate('/profile')
                        }} className='w-9 h-7 text-blue-500 hover:scale-110 cursor-pointer duration-300' />
                        <GoGear onClick={() => {
                            setIsDrawerOpen(true)
                        }} className='w-9 h-7 text-gray-500 hover:scale-110 cursor-pointer duration-300' />
                    </>
                }

                <AiOutlineLogout onClick={() => {
                    dispatch(setLogin(false))
                    dispatch(setUserData({}))
                    dispatch(setRole(""))
                    navigate('/login')
                }} className='w-9 h-7 text-red-500 hover:scale-110 cursor-pointer duration-300' />
            </div>



            {
                isDrawerOpen && <UpdatePasswordForm drawerCondition={{ isDrawerOpen, setIsDrawerOpen }} btnName="Update Details" data={userData} />
            }
        </div>
    )
}

export default Header
