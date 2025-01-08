import { useState } from 'react'
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom'
import MobileHeader from './common/header/MobileHeader'
import './App.css'
import Sidebar from './common/sidebar'
import Nav from './common/navigation'
import AdminLayout from './layout/AdminLayout'

function App() {


  return (
    <div className='App'>
      {/* <MobileHeader /> */}
      {/* <Sidebar /> */}
      {/* <Nav /> */}
      <AdminLayout><p>something in the layout</p></AdminLayout>
    </div>
  )
}

export default App
