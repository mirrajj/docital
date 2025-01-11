import { useState } from 'react'
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom'
import MobileHeader from './common/header/MobileHeader'
import './App.css'
import Sidebar from './common/sidebar'
import Nav from './common/navigation'
import AdminLayout from './layout/AdminLayout'
import Task from './pages/tasks'
import { DataProvider } from './utils/DataContext'

function App() {


  return (
    <DataProvider>
      <div className='App'>
        {/* <MobileHeader /> */}
        {/* <Sidebar /> */}
        {/* <Nav /> */}
        <AdminLayout><Task /></AdminLayout>
        
      </div>
    </DataProvider>
  )
}

export default App
