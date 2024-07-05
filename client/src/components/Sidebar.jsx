import React, { useState } from 'react'
import { BsArrowLeftShort, BsChevronDown } from "react-icons/bs"
import { AiFillEnvironment } from "react-icons/ai"
import { RiDashboardFill } from "react-icons/ri"
import { LuFileBox, LuLayoutDashboard, LuLayoutTemplate, LuLogOut, LuMessagesSquare } from "react-icons/lu"
import { FaGear, FaUserGear } from "react-icons/fa6";
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
    const { role } = useSelector((state) => state.user)
    const Menus = role === "ADMIN" ? [
        { title: "Dashboard", link: "/", icon: <LuLayoutDashboard /> },
        { title: "Clients", link: "/clients", icon: <FiUser /> },
        { title: "Plan", link: "/plans", spacing: false, icon:<GiTakeMyMoney/> },
        { title: "Logout", link: "/logout", spacing: true, icon: <LuLogOut /> },
    ] : [
        { title: "Dashboard", link: "/", icon: <LuLayoutDashboard /> },
        { title: "Templates", link: "/templates", icon: <LuLayoutTemplate /> },
        { title: "Bulk Sender", link: "/bulk-sender", icon: <LiaMailBulkSolid /> },
        { title: "Bulk Sender Details", link: "/bulk-sender-details", icon: <FaRegMessage /> },
        { title: "Message History", link: "/message-history", icon: <LuMessagesSquare /> },
        { title: "Mangage Files", link: "/message-history", icon: <LuFileBox /> },
        { title: "Plan Details", link: "/plan-details", icon: <GiTakeMyMoney /> },
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

    return (
        <div className='w-full relative'>
            < BsArrowLeftShort className={`bg-white text-dark-purple text-3xl rounded-full absolute -right-3 top-0 border border-dark-purple cursor-pointer hover:scale-110 duration-300 ${!sideBar.open && 'rotate-180'}`} onClick={() => { sideBar.setOpen(prev => !prev) }} />

            <div className="inline-flex pl-2">
                <AiFillEnvironment className={`bg-amber-300 text-3xl rounded cursor-pointer block float-left mr-2 duration-500 ${sideBar.open && "rotate-[360deg]"}`} />
                <h1 className={`text-3xl text-white origin-left ml-2 font-medium duration-300 ${!sideBar.open && "scale-0"}`}>Cloudz</h1>
            </div>

            <ul className="pt-2 overflow-y-auto max-h-[88vh]">
                {Menus.map((menu, index) => (
                    <>
                        <li onClick={() => navigate(menu.link)} key={index + menu.link} className={`text-gray-300 text-lg font-medium flex items-center gap-x-4 cursor-pointer p-2 hover:bg-light-white rounded-md ${menu.spacing ? "mt-2" : "mt-2"}`}>

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
