import React, { useEffect, useState } from 'react'

const BulkSheetData = ({ sheetData, column, handlePageChange }) => {
    const [indics, setIndices] = useState([0, 50]);
    const data = sheetData.slice(indics[0], indics[1]);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (indics[1] <= sheetData.length) {
                if (entries[0].isIntersecting) {
                    setIndices([indics[0], indics[1] + 50]);
                    observer.unobserve(hiddenElement);
                    observer.disconnect();
                }
            }
        }, { threshold: 0.1 });

        const hiddenElement = document.querySelector('.last-item:last-child');
        if (!hiddenElement) {
            return;
        }

        observer.observe(hiddenElement);
        return () => {
            if (hiddenElement) {
                observer.unobserve(hiddenElement);
            }
            observer.disconnect();
        }
    }, [data])


    return (
        <div className="px-1 mt-2">
            <div className="overflow-y-auto h-[350px]">
                <div className="flex flex-col">
                    <div className="-m-1.5">
                        <div className="p-1.5 min-w-full min-h-96 max-h-96 inline-block align-middle">
                            <div className="overflow-hidden">
                                <table className="min-w-full divide-gray-200 border border-gray-300">
                                    <thead>
                                        <tr>
                                            {
                                                column.length > 0 && column.map((item, index) => (
                                                    <th
                                                        scope="col"
                                                        key={index}
                                                        className="px-4 py-2 bg-gray-500 text-start text-sm font-semibold text-black uppercase border border-gray-300"
                                                    >
                                                        {item}
                                                    </th>
                                                ))
                                            }
                                        </tr>
                                    </thead>
                                    <tbody className="divide-gray-200">
                                        {
                                            data.length > 0 ? data.map((item, index) => (
                                                <tr key={index} className='last-item'>
                                                    <td className="px-4 py-2 whitespace-nowrap text-center text-sm text-gray-800 border border-gray-300">{index + 1}</td>
                                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 border border-gray-300">{item?.NAME}</td>
                                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 border border-gray-300">{item?.MOBILE_NO}</td>
                                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 border border-gray-300">{item?.HEADER_NAME_OR_LINK}</td>
                                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 border border-gray-300">{item?.BODY_1}</td>
                                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 border border-gray-300">{item?.BODY_2}</td>
                                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 border border-gray-300">{item?.BODY_3}</td>
                                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 border border-gray-300">{item?.BODY_4}</td>
                                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 border border-gray-300">{item?.BODY_5}</td>
                                                </tr>
                                            )) : "No Data"
                                        }
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <h3 className='mt-4'>Imported <span className='text-red-500 font-medium'>{sheetData.length}</span> contacts</h3>
            <div className="flex justify-end gap-2 fixed inset-x-2 bottom-2">
                <button type="button" className="py-2 px-4 inline-flex items-center gap-x-2 text-sm rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600" onClick={() => handlePageChange(2)}>
                    Next
                </button>
            </div>
        </div>

    )
}

export default BulkSheetData