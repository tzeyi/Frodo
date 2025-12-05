import { useNavigate, useLocation } from 'react-router-dom'
import { IoTicketOutline } from "react-icons/io5";
import { LuListChecks } from "react-icons/lu";

const SideBar = ({ pageContent }) => {

    const navigate = useNavigate()
    const location = useLocation()

    const sidebarItems = [
        {
            label: "Homepage",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor" className="size-5"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"></path><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
            ),
            onClick: () => navigate("/"),
            path: "/"
        },
        {
            label: "Tickets",
            icon: <IoTicketOutline className="size-5" />,
            onClick: () => navigate("/tickets"),
            path: "/tickets"
        },
        {
            label: "Forum",
            icon: <LuListChecks className="size-5" />,
            onClick: () => navigate("/forum"),
            path: "/forum"
        },
        {
            label: "Settings",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor" className="size-5"><path d="M20 7h-9"></path><path d="M14 17H5"></path><circle cx="17" cy="17" r="3"></circle><circle cx="7" cy="7" r="3"></circle></svg>
            ),
            onClick: () => navigate("/settings"),
            path: "/settings"
        },
    ];

    return (
        <>
            <div className="drawer drawer-open">
                <input id="my-drawer-4" type="checkbox" className="drawer-toggle" defaultChecked/>
                <div className="drawer-content bg-base-200">
                    {pageContent}
                </div>

                <div className="drawer-side is-drawer-close:overflow-visible z-10">
                    <label htmlFor="my-drawer-4" aria-label="close sidebar" className="drawer-overlay"></label>
                    <div className="is-drawer-close:w-16 is-drawer-open:w-64 bg-info-content text-base-100 flex flex-col items-start min-h-full border-r border-base-100/20 shadow-lg">
                        
                        {/* App branding / toggle button */}
                        <div className="w-full px-4 py-5 flex items-center justify-between border-b border-base-100/20">
                            <span className="is-drawer-close:hidden font-bold text-xl tracking-tight">Frodo</span>
                        
                            <label htmlFor="my-drawer-4" className="btn btn-ghost btn-sm btn-circle drawer-button is-drawer-open:rotate-180 transition-transform duration-300 hover:bg-base-100/10">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor" className="size-5">
                                    <path d="M15 6l-6 6l6 6"></path>
                                </svg>
                            </label>
                        </div>

                        {/* Sidebar content */}
                        <ul className="menu w-full grow px-3 py-4 gap-2">
                            {sidebarItems.map((item, index) => {
                                const isActive = location.pathname === item.path;
                                return (
                                    <li key={index}>
                                        <button
                                            className={`is-drawer-close:tooltip is-drawer-close:tooltip-right transition-all duration-200 rounded-lg ${
                                                isActive 
                                                    ? 'bg-base-100/20 font-semibold shadow-sm' 
                                                    : 'hover:bg-base-100/10'
                                            }`}
                                            data-tip={item.label}
                                            onClick={item.onClick}
                                        >
                                            {item.icon}
                                            <span className="is-drawer-close:hidden">{item.label}</span>
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>
            </div>
        </>
    )
}

export default SideBar