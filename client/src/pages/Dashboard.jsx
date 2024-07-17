import React from 'react'
import Header from '../components/Header'



const Dashboard = () => {

  return (
    <div className='p-1'>
      <Header name="Dashboard" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mt-2">
        <div className="bg-white py-3 h-20 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition duration-300 ease-in-out">
          <h2 className="text-lg font-medium text-center text-gray-700">Total Messages</h2>
          <p className="text-2xl text-center text-yellow-400">1,200</p>
        </div>
        <div className="bg-white py-3 h-20 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition duration-300 ease-in-out">
          <h2 className="text-lg font-medium text-center text-gray-700">Bot Messages</h2>
          <p className="text-2xl text-center text-yellow-400">1,200</p>
        </div>
        <div className="bg-white py-3 h-20 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition duration-300 ease-in-out">
          <h2 className="text-lg font-medium text-center text-gray-700">Total Bots</h2>
          <p className="text-2xl text-center text-green-500">1,200</p>
        </div>
        <div className="bg-white py-3 h-20 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition duration-300 ease-in-out">
          <h2 className="text-lg font-medium text-center text-gray-700">Templates</h2>
          <p className="text-2xl text-center text-gray-400">1,200</p>
        </div>
        <div className="bg-white py-3 h-20 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition duration-300 ease-in-out">
          <h2 className="text-lg font-medium text-center text-gray-700">Bulk Send</h2>
          <p className="text-2xl text-center text-blue-500">1,200</p>
        </div>     
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mt-2">
        <div className="bg-white py-3 h-20 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition duration-300 ease-in-out">
          <h2 className="text-lg font-medium text-center text-gray-700">Proccessing</h2>
          <p className="text-2xl text-center text-yellow-400">1,200</p>
        </div>
        <div className="bg-white py-3 h-20 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition duration-300 ease-in-out">
          <h2 className="text-lg font-medium text-center text-gray-700">Sent</h2>
          <p className="text-2xl text-center text-green-500">1,200</p>
        </div>
        <div className="bg-white py-3 h-20 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition duration-300 ease-in-out">
          <h2 className="text-lg font-medium text-center text-gray-700">Delivered</h2>
          <p className="text-2xl text-center text-gray-400">1,200</p>
        </div>
        <div className="bg-white py-3 h-20 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition duration-300 ease-in-out">
          <h2 className="text-lg font-medium text-center text-gray-700">Read</h2>
          <p className="text-2xl text-center text-blue-500">1,200</p>
        </div>
        <div className="bg-white py-3 h-20 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition duration-300 ease-in-out">
          <h2 className="text-lg font-medium text-center text-gray-700">Failed</h2>
          <p className="text-2xl text-center text-red-500">1,200</p>
        </div>
      </div>
      {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4 text-gray-700">Sales Bar Chart</h2>
          <Bar data={barData} options={{ maintainAspectRatio: false }} />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md h-[450px]">
          <h2 className="text-2xl font-bold mb-4 text-gray-700">Sales Doughnut Chart</h2>
          <Doughnut data={doughnutData} className='h-72' options={{ maintainAspectRatio: true }} />
        </div>
      </div> */}
    </div>
  )
}

export default Dashboard
