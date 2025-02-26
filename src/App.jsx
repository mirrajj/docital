import { useState } from 'react'
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom'
import MobileHeader from './common/header/MobileHeader'
import './App.css'
import Sidebar from './common/sidebar'
import Nav from './common/navigation'
import AdminLayout from './layout/AdminLayout'
import Task from './pages/tasks'
import { DataProvider } from './utils/DataContext'
import Record from './pages/records'
import Monitoring from './pages/monitoring'


function App() {
 

  return (
    <DataProvider>
      <div className='App'>
        <Routes>
          
          <Route path="/" element={<AdminLayout page="Task"><Task /></AdminLayout> }/>
          <Route path='/monitoring' element={<AdminLayout page={"Monitoring"}><Monitoring /></AdminLayout>} />
          <Route path='/record' element={<AdminLayout page={"Records"}><Record /></AdminLayout>} />
          
        </Routes>
        
      </div>
    </DataProvider>
  )
}

export default App
