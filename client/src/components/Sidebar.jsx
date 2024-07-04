import React, { useState } from 'react'
import { BsArrowLeftShort, BsChevronDown } from "react-icons/bs"
import { AiFillEnvironment } from "react-icons/ai"
import { RiDashboardFill, RiUser2Fill } from "react-icons/ri"
import { FaGear, FaUserGear } from "react-icons/fa6";
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Sidebar = ({ sideBar }) => {
    const [subMenuOpen, setSubMenuOpen] = useState(false)
    const navigate = useNavigate()
    const { role } = useSelector((state) => state.user)
    const Menus = role === "ADMIN" ? [
        { title: "Dashboard", link: "/", icon: <RiDashboardFill /> },
        { title: "Clients", link: "/clients", icon: <FaGear /> },
        { title: "Plan", link: "/plans", spacing: false },
        { title: "Logout", link: "/logout", spacing: true },
    ] : [
        { title: "Dashboard", link: "/", icon: <RiDashboardFill /> },
        { title: "Templates", link: "/templates", icon: <AiFillEnvironment /> },
        { title: "Bulk Sender", link: "/bulk-sender", icon: <RiDashboardFill /> },
        { title: "Bulk Sender Details", link: "/bulk-sender-details", icon: <RiDashboardFill /> },
        { title: "Message History", link: "/message-history", icon: <RiUser2Fill /> },
        { title: "Plan Details", link: "/plan-details", icon: <RiUser2Fill /> },
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
        { title: "Profile", link: "/profile", icon: <FaUserGear /> },
        { title: "Logout", link: "/logout", spacing: true },
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
                        <li onClick={() => navigate(menu.link)} key={index+menu.link} className={`text-gray-300 text-lg font-medium flex items-center gap-x-4 cursor-pointer p-2 hover:bg-light-white rounded-md ${menu.spacing ? "mt-2" : "mt-2"}`}>

                            <span className="text-2xl block float-left">{menu.icon ? menu.icon : <RiDashboardFill />}</span>
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
