import React from 'react'
import { HiOutlineArrowTopRightOnSquare } from 'react-icons/hi2';
import { IoMdCall } from 'react-icons/io';
import { MdContentCopy } from 'react-icons/md';
import { PiArrowBendUpLeft } from 'react-icons/pi';

const ShowTemplateModel = ({ isOpen, onClose, data}) => {
    if (!isOpen) return null;
    
function transformString(inputString) {
    // Replace *...* with <strong>...</strong>
    inputString = inputString.replace(/\*(.*?)\*/g, '<strong>$1</strong>');

    // Replace _..._ with <em>...</em>
    inputString = inputString.replace(/_(.*?)_/g, '<em>$1</em>');

    // Replace ~...~ with <s>...</s>
    inputString = inputString.replace(/~(.*?)~/g, '<s>$1</s>');

    // Replace \n with <br>
    inputString = inputString.replace(/\n/g, '<br>');

    return inputString;
}
    console.log("data22", data);
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-2 rounded shadow-lg w-72">
                <h4 className='text-lg font-medium'>Template Preview</h4>
                <hr />
                {
                    data?.headerType != "TEXT" &&    <div className='w-full h-28'>
                    {
                        data?.headerType === "IMAGE" && <img src={"http://dramabookings.uvtechsoft.com:7896/static/currentSeatStatus/CharChoughi_SHOW_ID_1.png"} alt="Header" className="w-full h-full object-center rounded-lg mt-2" />
                    }
                    {
                        data?.headerType === "VIDEO" && <video
                            src={data.headerValues.example.header_handle[0]}
                            // controls
                            className="w-full h-full object-center rounded-lg mt-2"
                            autoPlay={true}
                        />
                    }
                </div>
                }
             
                <article class="text-wrap ... bg-white p-2 rounded-lg">
                    <p className='text-xs font-semibold'>{data?.headerValues?.text}</p>
                    <p className='text-xs' dangerouslySetInnerHTML={{ __html: transformString(data?.bodyValues?.text)}}></p>
                    <p className='text-xs text-gray-400 '>{data?.footerValues?.text}</p>
                    <p className='text-[10px] mt-2 text-end '>9.00 PM</p>
                    <hr />
                    <hr />
                </article>
                <div className='px-2'>

                    {
                        data?.buttonValues?.buttons?.length > 0 && data?.buttonValues?.buttons?.map((item, index) => {
                            return (
                                <div className='flex justify-center mt-[3px] gap-1' key={item._id}>
                                    {
                                        item?.type == "URL" ? <HiOutlineArrowTopRightOnSquare className='w-4 h-4 text-blue-600 flex justify-center items-center cursor-pointer' /> : item?.type == "PHONE_NUMBER" ? <IoMdCall className='w-4 h-4 text-blue-600 flex justify-center items-center cursor-pointer' /> : item.type == "COPY_CODE" ? <MdContentCopy className='w-4 h-4 text-blue-600 flex justify-center items-center cursor-pointer' /> : <PiArrowBendUpLeft className='w-4 h-4 text-blue-600 flex justify-center items-center cursor-pointer' />
                                    }

                                    <p className='text-sm text-blue-600 font-medium text-center'>{item?.text}</p>
                                    <hr />
                                </div>
                            )
                        })
                    }
                </div>
                <button
                    className="bg-blue-500 text-white px-2 py-1 mt-2 text-sm float-end rounded"
                    onClick={onClose}
                >
                    Close
                </button>
            </div>
        </div>
    )
}

export default ShowTemplateModel
