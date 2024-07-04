import React from 'react'

const Table = ({ data }) => {

    return (
        <div class="flex flex-col">
            <div class="-m-1.5 overflow-x-auto">
                <div class="p-1.5 min-w-full inline-block align-middle">
                    <div class="border  divide-y divide-gray-200 dark:border-gray-400 dark:divide-gray-400">
                        <div class="overflow-hidden">
                            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-400">
                                <thead class="bg-gray-50 dark:bg-gray-300 h-10">
                                    <tr>
                                        <th scope="col" class="px-10 py-3 text-end text-sm font-medium text-black uppercase">Action</th>
                                        <th scope="col" class="px-6 py-3 text-start text-sm font-medium text-black uppercase">Name</th>
                                        <th scope="col" class="px-6 py-3 text-start text-sm font-medium text-black uppercase">Email ID</th>
                                        <th scope="col" class="px-6 py-3 text-end text-sm font-medium text-black uppercase">Mobile No</th>
                                        <th scope="col" class="px-6 py-3 text-start text-sm font-medium text-black uppercase">PAN No</th>
                                        <th scope="col" class="px-6 py-3 text-end text-sm font-medium text-black uppercase">GST. No</th>
                                        <th scope="col" class="px-6 py-3 text-end text-sm font-medium text-black uppercase">Address</th>
                                        <th scope="col" class="px-6 py-3 text-end text-sm font-medium text-black uppercase">Status</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-gray-200 dark:divide-gray-400 ">
                                    <tr>
                                        <td class="px-10 py-2 whitespace-nowrap text-end text-sm font-medium">
                                            <button   type="button" class="inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:pointer-events-none dark:text-blue-500 dark:hover:text-blue-400 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600">Delete</button>
                                        </td>
                                        <td class="px-6 py-2 whitespace-nowrap text-sm text-gray-800 dark:text-black">John Brown</td>
                                        <td class="px-6 py-2 whitespace-nowrap text-sm text-gray-800 dark:text-black">arjunthawale08@gmail.com</td>
                                        <td class="px-6 py-2 whitespace-nowrap text-sm text-gray-800 dark:text-black">914603616888</td>
                                        <td class="px-6 py-2 whitespace-nowrap text-sm text-gray-800 dark:text-black">CREPA0413L</td>
                                        <td class="px-6 py-2 whitespace-nowrap text-sm text-gray-800 dark:text-black">CREPA0413LSSDARD</td>


                                    </tr>
                                    <tr>
                                        <td class="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-black">CREPA0413L</td>
                                        <td class="px-6 py-2 whitespace-nowrap text-sm text-gray-800 dark:text-black">45</td>
                                        <td class="px-6 py-2 whitespace-nowrap text-sm text-gray-800 dark:text-black">New York No. 1 Lake Park</td>
                                        <td class="px-6 py-2 whitespace-nowrap text-end text-sm font-medium">
                                            <button type="button" class="inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:pointer-events-none dark:text-blue-500 dark:hover:text-blue-400 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600">Delete</button>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td class="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-black">John Brown</td>
                                        <td class="px-6 py-2 whitespace-nowrap text-sm text-gray-800 dark:text-black">45</td>
                                        <td class="px-6 py-2 whitespace-nowrap text-sm text-gray-800 dark:text-black">New York No. 1 Lake Park</td>
                                        <td class="px-6 py-2 whitespace-nowrap text-end text-sm font-medium">
                                            <button type="button" class="inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:pointer-events-none dark:text-blue-500 dark:hover:text-blue-400 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600">Delete</button>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td class="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-black">John Brown</td>
                                        <td class="px-6 py-2 whitespace-nowrap text-sm text-gray-800 dark:text-black">45</td>
                                        <td class="px-6 py-2 whitespace-nowrap text-sm text-gray-800 dark:text-black">New York No. 1 Lake Park</td>
                                        <td class="px-6 py-2 whitespace-nowrap text-end text-sm font-medium">
                                            <button type="button" class="inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:pointer-events-none dark:text-blue-500 dark:hover:text-blue-400 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600">Delete</button>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td class="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-black">John Brown</td>
                                        <td class="px-6 py-2 whitespace-nowrap text-sm text-gray-800 dark:text-black">45</td>
                                        <td class="px-6 py-2 whitespace-nowrap text-sm text-gray-800 dark:text-black">New York No. 1 Lake Park</td>
                                        <td class="px-6 py-2 whitespace-nowrap text-end text-sm font-medium">
                                            <button type="button" class="inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:pointer-events-none dark:text-blue-500 dark:hover:text-blue-400 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600">Delete</button>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td class="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-black">John Brown</td>
                                        <td class="px-6 py-2 whitespace-nowrap text-sm text-gray-800 dark:text-black">45</td>
                                        <td class="px-6 py-2 whitespace-nowrap text-sm text-gray-800 dark:text-black">New York No. 1 Lake Park</td>
                                        <td class="px-6 py-2 whitespace-nowrap text-end text-sm font-medium">
                                            <button type="button" class="inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:pointer-events-none dark:text-blue-500 dark:hover:text-blue-400 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600">Delete</button>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td class="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-black">John Brown</td>
                                        <td class="px-6 py-2 whitespace-nowrap text-sm text-gray-800 dark:text-black">45</td>
                                        <td class="px-6 py-2 whitespace-nowrap text-sm text-gray-800 dark:text-black">New York No. 1 Lake Park</td>
                                        <td class="px-6 py-2 whitespace-nowrap text-end text-sm font-medium">
                                            <button type="button" class="inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:pointer-events-none dark:text-blue-500 dark:hover:text-blue-400 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600">Delete</button>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td class="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-black">John Brown</td>
                                        <td class="px-6 py-2 whitespace-nowrap text-sm text-gray-800 dark:text-black">45</td>
                                        <td class="px-6 py-2 whitespace-nowrap text-sm text-gray-800 dark:text-black">New York No. 1 Lake Park</td>
                                        <td class="px-6 py-2 whitespace-nowrap text-end text-sm font-medium">
                                            <button type="button" class="inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:pointer-events-none dark:text-blue-500 dark:hover:text-blue-400 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600">Delete</button>
                                        </td>
                                    </tr>


                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    )
}

export default Table
