import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Navbar from "../components/ui/Navbar";

import { Link,useNavigate } from "react-router-dom";
import { useState } from 'react'


function Home() {
  return(
    <div className="min-h-screen bg-white w-full">

      <Navbar className="w-full" />

      
      <div className="p-4">  
        <h1 className="text-2xl font-semibold text-green-800">Home Page</h1>
      </div>

        {/* <main>
          <Sidebar />
          <Content />
        </main>

        <Player /> */}


    </div>
  );
}

export default Home
