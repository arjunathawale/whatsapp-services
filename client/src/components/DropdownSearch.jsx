import React, { useEffect, useState, useRef } from 'react';
import { FaChevronDown } from 'react-icons/fa';
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify';
import { getAPI } from '../constants/constants';

const options = [
    "Apple",
    "Banana",
    "Cherry",
    "Date",
    "Elderberry",
    "Fig",
    "Grape",
    // add more options as needed
];

const DropdownSearch = ({ selectedTemplate, setSelectedTemplate }) => {

    const { _id } = useSelector(state => state.user.userData)
    const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setIsOpen(false);
        }

    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [data, setData] = useState([]);
    const dropdownRef = useRef(null);

    const filteredOptions = data.filter(option =>
        option?.templateName?.toLowerCase().includes(searchTerm.toLowerCase())
    );


    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        let res = await getAPI("/template/get", {
            wpClientId: _id,
        })
        if (res.status) {
            setData(res.data)
        } else {
            toast.error("Something went wrong")
        }
    }




    return (
        <div className="relative inline-block w-1/2">
            <label htmlFor="dropsearch" className='text-m'>*Select Template</label>
            <div ref={dropdownRef} className="absolute z-10 w-full mt-2 bg-white border border-gray-300 rounded shadow-lg">
                <input
                    type="text"
                    className="w-full px-4 py-2 border-b border-gray-300 outline-none placeholder:text-black"
                    placeholder={selectedTemplate?.templateName || "Select Template"}
                    value={searchTerm}
                    onClick={() => setIsOpen(!isOpen)}
                    onChange={(e) => {
                        setIsOpen(true)
                        setSearchTerm(e.target.value)
                    }}
                />
                <FaChevronDown className='cursor-pointer absolute right-3 top-[12px]' onClick={() => setIsOpen(!isOpen)} />
                {
                    isOpen && <ul className="max-h-60 overflow-y-auto">
                        {filteredOptions.map((option, index) => (
                            <li
                                key={index}
                                onClick={() => {
                                    setSelectedTemplate(option);
                                    setIsOpen(false);
                                    setSearchTerm('');
                                }}
                                className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                            >
                                {option.templateName}
                            </li>
                        ))}
                    </ul>
                }

            </div>
        </div>
    );
};

export default DropdownSearch;
