import React, { useState } from 'react'

const BulkSenderVertilizedList = ({ data, height = 384, width, itemHeight = 30 }) => {
    const [indices, setIndices] = useState([0, Math.floor(height / itemHeight)])
    const visibleList = data.slice(indices[0], indices[1] + 1)
    return visibleList.map((item, index) => (
        <tr key={index}>
            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">{item?.NAME}</td>
            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">{item?.MOBILE_NO}</td>
            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">{item?.HEADER_NAME_OR_LINK}</td>
            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">{item?.BODY_1}</td>
            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">{item?.BODY_2}</td>
            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">{item?.BODY_3}</td>
            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">{item?.BODY_4}</td>
            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">{item?.BODY_5}</td>
        </tr>
    ))
}


export default BulkSenderVertilizedList
