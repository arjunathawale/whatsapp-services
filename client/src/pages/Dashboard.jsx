import React, { useEffect, useState } from 'react'
import Header from '../components/Header'
import Chart from 'react-apexcharts';
import { getAPI } from '../constants/constants';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { AiOutlineReload } from 'react-icons/ai';

const Dashboard = () => {
  const { _id } = useSelector(state => state.user.userData)
  const [reload, setReload] = useState(false)
  const [statsData, setStatsData] = useState({})
  const [barChart, setBarChart] = useState([])


  console.log(statsData);

  const getStatsData = async () => {
    const res = await getAPI("/messageHistory/getMessageStats", {
      wpClientId: _id
    })
    if (res.status) {
      setStatsData(res.data[0])
    } else {
      toast.error("Something went wrong")
    }

    // console.log(res)
  }
  const getMonthStatsData = async () => {
    const res = await getAPI("/messageHistory/getMonthMessageStats", {
      wpClientId: _id
    })
    if (res.status) {
      setBarChart(res.data)
    } else {
      toast.error("Something went wrong")
    }
  }

  useEffect(() => {
    getStatsData()
    getMonthStatsData()
    const id = setTimeout(() => {
      setReload(false)
    }, 800)

    return () => clearTimeout(id)
  }, [reload])

  const options = {
    chart: {
      type: 'bar',
      height: 500,
    },
    xaxis: {
      categories: barChart.map((item) => (item._id)),
    },
    stroke: {
      width: 2,
      curve: "straight",
    }
  };

  const series = [
    {
      name: 'Messages',
      data: barChart.map((item) => (item.totalMessages)),

    }
  ];

  const lineChartoptions = {
    chart: {
      type: 'line',
      height: 300,
    },
    xaxis: {
      categories: barChart.map((item) => (item._id)),
    },
    stroke: {
      width: 2,
      curve: "straight",
    }
  };

  const catSeries = [
    {
      name: 'Marketing',
      data: barChart.map((item) => (item.marketingMessages)),
    },
    {
      name: 'Utility',
      data: barChart.map((item) => (item.utilityMessages)),
    },
    {
      name: 'Service',
      data: barChart.map((item) => (item.serviceMessage)),
    },
    {
      name: 'Authentication',
      data: barChart.map((item) => (item.authenticationMessages)),
    }
  ];


  const pieChartOptions = {
    labels: ["Processing", "Sent", "Delivered", "Read", "Failed", "Recieved"], // Labels for the pie chart slices
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          width: 200
        },
        legend: {
          position: 'bottom'
        }
      }
    }]
  };

  const pieChartSeries = [statsData?.pendingMessages, statsData?.sentMessages, statsData?.deliveredMessages, statsData?.readMessages, statsData?.failedMessages, statsData?.receivedMessages];

  return (
    <div className='p-1'>
      <Header name="Dashboard" />
      <div className="w-full h-2/4 mt-5 p-1 duration-500">

        <div className='flex justify-between px-2'>
          <h5 className='text-lg font-medium'>Overall Message Stats</h5>
          {
            reload ? <div class="loader border-t-2 rounded-full border-gray-500 bg-gray-50 animate-spin aspect-square w-8 flex justify-center items-center text-yellow-700"></div> : <AiOutlineReload className={`text-3xl font-semibold cursor-pointer duration-700`} onClick={() => setReload(true)} />
          }


        </div>
        <div className='flex justify-between w-full gap-2 p-2'>
          <div className="w-1/6 h-[90px] shadow-lg rounded-lg flex flex-col justify-center content-center items-center hover:scale-110 duration-300">
            <p className='text-sm font-medium'>Templates</p>
            <p className='text-2xl font-bold text-blue-500'>{statsData?.templateCount || 0}</p>
          </div>
          <div className="w-1/6 h-[90px] shadow-lg rounded-lg flex flex-col justify-center content-center items-center hover:scale-110 duration-300">
            <p className='text-sm font-medium'>All Users</p>
            <p className='text-2xl font-bold text-blue-500'>{statsData?.userCount || 0}</p>
          </div>
          <div className="w-1/6 h-[90px] shadow-lg rounded-lg flex flex-col justify-center content-center items-center hover:scale-110 duration-300">
            <p className='text-sm font-medium'>Total Messages</p>
            <p className='text-2xl font-bold text-blue-500'>{statsData?.totalMessages || 0}</p>
          </div>
          <div className="w-1/6 h-[90px] shadow-lg rounded-lg flex flex-col justify-center content-center items-center hover:scale-110 duration-300">
            <p className='text-sm font-medium'>Bulk Messages</p>
            <p className='text-2xl font-bold text-blue-500'>{statsData?.bulkMessages || 0}</p>
          </div>
          <div className="w-1/6 h-[90px] shadow-lg rounded-lg flex flex-col justify-center content-center items-center hover:scale-110 duration-300">
            <p className='text-sm font-medium'>Chat-Bot Messages</p>
            <p className='text-2xl font-bold text-blue-500'>{statsData?.chatbotMessages || 0}</p>
          </div>


        </div>


        <div className='flex justify-between w-full gap-2 p-2'>
          <div className="w-1/6 h-[90px] shadow-lg rounded-lg flex flex-col justify-center content-center items-center hover:scale-110 duration-300">
            <p className='text-sm font-medium'>Processing</p>
            <p className='text-2xl font-bold text-yellow-500'>{statsData?.pendingMessages || 0}</p>
          </div>
          <div className="w-1/6 h-[90px] shadow-lg rounded-lg flex flex-col justify-center content-center items-center hover:scale-110 duration-300">
            <p className='text-sm font-medium'>Sent</p>
            <p className='text-2xl font-bold text-green-500'>{statsData?.sentMessages || 0}</p>
          </div>
          <div className="w-1/6 h-[90px] shadow-lg rounded-lg flex flex-col justify-center content-center items-center hover:scale-110 duration-300">
            <p className='text-sm font-medium'>Delivered</p>
            <p className='text-2xl font-bold text-gray-500'>{statsData?.deliveredMessages || 0}</p>
          </div>
          <div className="w-1/6 h-[90px] shadow-lg rounded-lg flex flex-col justify-center content-center items-center hover:scale-110 duration-300">
            <p className='text-sm font-medium'>Read</p>
            <p className='text-2xl font-bold text-blue-500'>{statsData?.readMessages || 0}</p>
          </div>
          <div className="w-1/6 h-[90px] shadow-lg rounded-lg flex flex-col justify-center content-center items-center hover:scale-110 duration-300">
            <p className='text-sm font-medium'>Failed</p>
            <p className='text-2xl font-bold text-red-500'>{statsData?.failedMessages || 0}</p>
          </div>
          {/* <div className="w-1/6 h-[90px] shadow-lg rounded-lg flex flex-col justify-center content-center items-center hover:scale-110 duration-300">
            <p className='text-sm font-medium'>Received</p>
            <p className='text-2xl font-bold text-cyan-500'>{statsData?.receivedMessages || 0}</p>
          </div> */}


        </div>
        <div className='w-full mt-2 p-2'>
          <h5 className='text-lg font-medium'>Daily Message Stats</h5>
          <Chart options={options} series={series} type="bar" width="100%" height="220" />
        </div>
        <div className='w-full mt-2 p-2'>
          <h5 className='text-lg font-medium'>Daily Category wise Message Stats</h5>
          <Chart options={lineChartoptions} series={catSeries} type="line" width="100%" height="220" />
        </div>
        <div className='w-1/2 mt-2 p-2'>
          <h5 className='text-lg font-medium'>Overall Message Status Stats</h5>
          <Chart
            options={pieChartOptions}
            series={pieChartSeries}
            type="pie"
            width="380"
          />
        </div>


      </div>
    </div >
  )
}

export default Dashboard
