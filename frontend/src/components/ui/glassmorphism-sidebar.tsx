import React, { useState } from 'react';
import {
    LayoutDashboard,
    BarChart3,
    Users,
    Briefcase,
    CheckSquare,
    Hexagon
} from 'lucide-react';

// --- Data for each page ---
const pageContent = {
    Dashboard: {
        title: 'Dashboard',
        description: "Welcome back, Serafim. Here's what's happening today.",
        content: (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="content-card bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <h2 className="text-lg font-semibold text-white">Active Projects</h2>
                    <p className="text-4xl font-bold mt-2 text-indigo-400">12</p>
                </div>
                <div className="content-card bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <h2 className="text-lg font-semibold text-white">Tasks Due</h2>
                    <p className="text-4xl font-bold mt-2 text-pink-400">5</p>
                </div>
                <div className="content-card bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <h2 className="text-lg font-semibold text-white">New Users</h2>
                    <p className="text-4xl font-bold mt-2 text-emerald-400">28</p>
                </div>
            </div>
        )
    },
    Analytics: {
        title: 'Analytics',
        description: 'Detailed insights and metrics for your projects.',
        content: (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="content-card lg:col-span-2 h-64 flex items-center justify-center bg-gray-800 rounded-xl border border-gray-700">
                    <p className="text-gray-400">Chart placeholder for User Growth</p>
                </div>
                <div className="content-card bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <h2 className="text-lg font-semibold text-white">Bounce Rate</h2>
                    <p className="text-4xl font-bold mt-2 text-indigo-400">24.5%</p>
                </div>
                <div className="content-card bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <h2 className="text-lg font-semibold text-white">Session Duration</h2>
                    <p className="text-4xl font-bold mt-2 text-pink-400">8m 12s</p>
                </div>
            </div>
        )
    },
    Users: {
        title: 'Users',
        description: 'Manage all the users in your organization.',
        content: (
            <div className="content-card bg-gray-800 p-6 rounded-xl border border-gray-700 overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-gray-700">
                            <th className="pb-3 text-gray-300">Name</th>
                            <th className="pb-3 text-gray-300">Email</th>
                            <th className="pb-3 text-gray-300">Role</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-400">
                        <tr className="border-b border-gray-700/50">
                            <td className="py-3">Jane Doe</td>
                            <td className="py-3">jane.doe@example.com</td>
                            <td className="py-3">Admin</td>
                        </tr>
                        <tr className="border-b border-gray-700/50">
                            <td className="py-3">John Smith</td>
                            <td className="py-3">john.smith@example.com</td>
                            <td className="py-3">Developer</td>
                        </tr>
                        <tr>
                            <td className="py-3">Sam Wilson</td>
                            <td className="py-3">sam.wilson@example.com</td>
                            <td className="py-3">Designer</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        )
    },
    Projects: {
        title: 'Projects',
        description: 'An overview of all your ongoing and completed projects.',
        content: (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="content-card bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <h2 className="text-lg font-semibold text-white">Project Alpha</h2>
                    <p className="text-sm text-gray-400 mt-1">Status: In Progress</p>
                </div>
                <div className="content-card bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <h2 className="text-lg font-semibold text-white">Project Beta</h2>
                    <p className="text-sm text-gray-400 mt-1">Status: Completed</p>
                </div>
            </div>
        )
    },
    Tasks: {
        title: 'Tasks',
        description: 'Track and manage all your tasks and to-dos.',
        content: (
            <div className="content-card bg-gray-800 p-6 rounded-xl border border-gray-700">
                <ul className="space-y-4">
                    <li className="flex justify-between items-center border-b border-gray-700/50 pb-2">
                        <span className="text-gray-200">Finalize Q3 report</span>
                        <span className="text-xs bg-pink-900/50 text-pink-400 px-2 py-1 rounded-full">Due Tomorrow</span>
                    </li>
                    <li className="flex justify-between items-center border-b border-gray-700/50 pb-2">
                        <span className="text-gray-200">Design new landing page mockups</span>
                        <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-full">In Progress</span>
                    </li>
                    <li className="flex justify-between items-center">
                        <span className="text-gray-200">Deploy server updates</span>
                        <span className="text-xs bg-emerald-900/50 text-emerald-400 px-2 py-1 rounded-full">Completed</span>
                    </li>
                </ul>
            </div>
        )
    }
};

const navItems = [
    { page: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { page: 'Analytics', icon: <BarChart3 className="w-5 h-5" /> },
    { page: 'Users', icon: <Users className="w-5 h-5" /> },
    { page: 'Projects', icon: <Briefcase className="w-5 h-5" /> },
    { page: 'Tasks', icon: <CheckSquare className="w-5 h-5" /> },
];

// Sidebar Component
const Sidebar = ({ activePage, setActivePage }) => (
    <aside className="bg-gray-800/50 backdrop-blur-xl w-64 flex-shrink-0 flex flex-col z-10 border-r border-white/10">
        <div className="h-20 flex items-center justify-center border-b border-white/10">
            <div className="flex items-center gap-2">
                <Hexagon className="w-8 h-8 text-indigo-400" />
                <span className="text-xl font-bold text-white">AetherUI</span>
            </div>
        </div>
        <nav className="flex-grow p-4 space-y-2">
            {navItems.map(item => (
                <a
                    key={item.page}
                    href="#"
                    className={`nav-link flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 transition-all duration-200 hover:bg-white/10 ${activePage === item.page ? 'bg-indigo-600/20 text-indigo-400 font-medium' : ''}`}
                    onClick={(e) => {
                        e.preventDefault();
                        setActivePage(item.page);
                    }}
                >
                    {item.icon}
                    <span>{item.page}</span>
                </a>
            ))}
        </nav>
        <div className="p-4 border-t border-white/10 bg-gray-900/30">
            <div className="flex items-center gap-3">
                <img
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=150&h=150&q=80"
                    alt="User Avatar"
                    className="w-10 h-10 rounded-full border-2 border-indigo-400 object-cover"
                />
                <div>
                    <p className="font-semibold text-white text-sm">Serafim P.</p>
                    <p className="text-xs text-gray-400">Admin</p>
                </div>
            </div>
        </div>
    </aside>
);

// Main Content Component
const MainContent = ({ activePage }) => {
    const { title, description, content } = pageContent[activePage];
    return (
        <main className="flex-grow p-8 overflow-y-auto">
            <h1 className="text-3xl font-bold text-white tracking-tight">{title}</h1>
            <p className="text-gray-400 mt-2">{description}</p>
            <div className="mt-8">{content}</div>
        </main>
    );
};

// Main Dashboard Layout Component
export const DashboardLayout = () => {
    const [activePage, setActivePage] = useState('Dashboard');
    return (
        <div className="relative min-h-screen w-full flex bg-gray-900 text-gray-200 overflow-hidden">
            {/* Background shapes for glassmorphism effect */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full mix-blend-screen filter blur-3xl opacity-50 animate-blob"></div>
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-pink-600/20 rounded-full mix-blend-screen filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-1/3 w-96 h-96 bg-emerald-600/20 rounded-full mix-blend-screen filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>

            <Sidebar activePage={activePage} setActivePage={setActivePage} />
            <MainContent activePage={activePage} />
        </div>
    );
};
