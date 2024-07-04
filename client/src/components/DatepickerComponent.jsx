// import React from 'react'
// import Datepicker from "tailwind-datepicker-react"
import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const DatepickerComponent = ({ selectedDate, handleDateChange, timeSelect, format }) => {
    // const [selectedDate, setSelectedDate] = useState(null);

    // const handleDateChange = (date) => {
    //     setSelectedDate(date);
    // };

    return (
        <div className="flex justify-center items-center">
            <DatePicker
                selected={selectedDate}
                onChange={handleDateChange}
                showTimeSelect={timeSelect ? timeSelect : false}
                // timeFormat="HH:mm:ss"
                timeIntervals={1}
                // timeCaption="Time"
                dateFormat={format ? format : "dd/M/yyyy"}
                className="appearance-none block w-full px-3 py-0 h-8 border border-gray-300 rounded-md shadow-sm outline-none"
            />
        </div>
        // <div>
        //     <Datepicker options={options} classNames='h-5 w-72' onChange={handleChange} show={show} setShow={handleClose} />
        // </div>
    )
}

export default DatepickerComponent
