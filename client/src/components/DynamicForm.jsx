// src/components/DynamicForm.js
import React, { useState } from 'react';

const DynamicForm = ({ items, column, selectedOptions, setSelectedOptions }) => {
    const handleSelectChange = (index, value, i) => {
        const newSelectedOptions = [...selectedOptions]
        newSelectedOptions[i] = { ACTUAL_VALUE: index, COL_NAME: value }
        setSelectedOptions(newSelectedOptions);
    };
    // console.log("selectedOptions", selectedOptions);

    return (
        <div className="">
            {items.map((item, index) => (
                <div key={index} className="flex items-center mb-4">
                    <input
                        type="text"
                        value={item}
                        disabled
                        className="border w-1/2 border-gray-300 p-1 mr-4 text-center rounded"
                    />
                    <select
                        value={selectedOptions[index]?.COL_NAME}
                        onChange={(e) => handleSelectChange(item, e.target.value, index)}
                        className="border w-1/2 h-10 outline-none  border-gray-300 p-2 rounded">
                        <option className='w-12 py-3' value={"Select"}>{"Select"}</option>
                        {
                            column.map((column, index) => (
                                <option key={index} className='w-12 py-3' value={column}>{column}</option>
                            ))
                        }
                    </select>
                </div>
            ))}
        </div>
    );
};

export default DynamicForm;
