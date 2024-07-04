import React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const Pagination = ({ currentPage, pageSize, totalPages, onPageChange, setPageSize }) => {
    const pageNumbers = [];

    for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
    }

    return (
        <nav className="flex justify-between items-center mt-2">
            <div className="flex items-center">
                <span className="mr-2">{currentPage} out of {totalPages}</span>
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded mr-2"
                >
                    <FaChevronLeft />
                </button>
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded"
                >
                    <FaChevronRight />
                </button>
            </div>
            <div>
                <span className="mr-2">Page Size:</span>
                <select
                    value={pageSize}
                    onChange={(e) => {
                        onPageChange(1, parseInt(e.target.value))
                        setPageSize(parseInt(e.target.value))
                    }}
                    className="border border-gray-300 rounded px-2 py-1 outline-none"
                >
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="30">30</option>
                    <option value="50">50</option>
                </select>
            </div>
        </nav>
    );
};

export default Pagination;
