import React, { useState } from 'react'
import { BsArrowLeftShort, BsChevronDown } from "react-icons/bs"
import { AiFillEnvironment } from "react-icons/ai"
import { RiDashboardFill } from "react-icons/ri"
import { LuFileBox, LuLayoutDashboard, LuLayoutTemplate, LuLogOut, LuMessagesSquare } from "react-icons/lu"
import { FaUserGear } from "react-icons/fa6";
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { LiaMailBulkSolid } from "react-icons/lia";
import { FaRegMessage } from "react-icons/fa6";
import { GiTakeMyMoney } from "react-icons/gi";
import { TbBrandGoogleAnalytics } from "react-icons/tb";
import { FiUser } from "react-icons/fi";

const Sidebar = ({ sideBar }) => {
    const [subMenuOpen, setSubMenuOpen] = useState(false)
    const navigate = useNavigate()
    const { role, activePlanData } = useSelector((state) => state.user)
    const adminData = [
        { title: "Dashboard", link: "/", icon: <LuLayoutDashboard /> },
        { title: "Clients", link: "/clients", icon: <FiUser /> },
        { title: "Plan", link: "/plans", spacing: false, icon: <GiTakeMyMoney /> },
        { title: "Logout", link: "/logout", spacing: true, icon: <LuLogOut /> },
    ]

    const clientData = [
        { title: "Dashboard", link: "/", icon: <LuLayoutDashboard /> },
        { title: "Templates", link: "/templates", icon: <LuLayoutTemplate /> },
        { title: "Bulk Sender", link: "/bulk-sender", icon: <LiaMailBulkSolid /> },
        { title: "Bulk Sender Details", link: "/bulk-sender-details", icon: <FaRegMessage /> },
        { title: "Message History", link: "/message-history", icon: <LuMessagesSquare /> },
        { title: "Mangage Files", link: "/manage-files", icon: <LuFileBox /> },
        { title: "Purchase Plan", link: "/purchase-plan", icon: <GiTakeMyMoney /> },
        {
            title: "Report",
            submenu: true,
            submenuItems: [
                { title: "Form 1", link: "/form1", icon: <FaUserGear /> },
                { title: "Form 2", link: "/form2", icon: <FaUserGear /> },
                { title: "Form 3", link: "/form3", icon: <FaUserGear /> },
                { title: "Form 3", link: "/form3", icon: <FaUserGear /> },
                { title: "Form 3", link: "/form3", icon: <FaUserGear /> },
                { title: "Form 3", link: "/form3", icon: <FaUserGear /> },
                { title: "Form 3", link: "/form3", icon: <FaUserGear /> },
            ]
        },
        { title: "Profile", link: "/profile", icon: <FiUser /> },
        { title: "Logout", link: "/logout", spacing: true, icon: <LuLogOut /> },
    ]
    if (activePlanData.chatBotFeature) clientData.splice(4, 0, { title: "Automation", link: "/chatbot-automation", icon: <LiaMailBulkSolid /> },)
    const Menus = role === "ADMIN" ? adminData : clientData

    return (
        <div className='w-full relative'>
            < BsArrowLeftShort className={`bg-white text-dark-purple text-3xl rounded-full absolute -right-3 top-0 border border-dark-purple cursor-pointer hover:scale-110 duration-300 ${!sideBar.open && 'rotate-180'}`} onClick={() => { sideBar.setOpen(prev => !prev) }} />

            <div className="inline-flex pl-2">
                <AiFillEnvironment className={`bg-amber-300 text-3xl rounded cursor-pointer block float-left mr-2 duration-500 ${sideBar.open && "rotate-[360deg]"}`} />
                <h1 className={`text-[21px] text-white origin-left font-medium self-center  duration-300 ${!sideBar.open && "scale-0 hidden"}`}>WhatsUp <span className='text-orange-500'>In</span><span className='text-gray-200'>d</span><span className='text-green-400'>ia</span></h1>
            </div>

            <ul className="pt-2 overflow-y-auto max-h-[88vh]" >
                {Menus.map((menu, index) => (
                    <>
                        <li onClick={() => navigate(menu.link)} key={index} className={`text-gray-300 text-lg font-medium flex items-center gap-x-4 cursor-pointer p-2 hover:bg-light-white rounded-md ${menu.spacing ? "mt-2" : "mt-2"}`}>
                            <span className="text-2xl block float-left">{menu.icon ? menu.icon : <TbBrandGoogleAnalytics />}</span>
                            <span className={`text-base font-medium flex-1 duration-200 ${!sideBar.open && "hidden"}`}>{menu.title}</span>
                            {menu.submenu && sideBar.open && (
                                <BsChevronDown className={`${subMenuOpen && "rotate-180"}`} onClick={() => setSubMenuOpen(prev => !prev)} />
                            )}
                        </li>
                        {
                            menu.submenu && subMenuOpen && sideBar.open && (
                                <ul>
                                    {
                                        menu.submenuItems.map((submenu, i) => (
                                            <li onClick={() => navigate(submenu.link)} key={i} className={`text-gray-300 text-lg font-medium flex items-center gap-x-4 cursor-pointer p-2 ml-10 hover:bg-light-white rounded-md`}>
                                                <span className="text-2xl block float-left"><RiDashboardFill /></span>
                                                {submenu.title}
                                            </li>
                                        ))
                                    }
                                </ul>
                            )
                        }
                    </>
                ))}
            </ul>
        </div>
    )
}

export default Sidebar
