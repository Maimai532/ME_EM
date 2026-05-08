import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

import { useState } from 'react'
import { Link } from "react-router-dom";



function Register() {
    //title page
    useEffect(() => {
      document.title = "Register";
    }, []);

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault() 

    console.log(username, email, password)

  }


  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="bg-zinc-900 p-8 rounded-2xl w-full max-w-md">

        <h1 className="text-white text-2xl font-bold text-center mb-6">Đăng ký</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          <Input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)} 
            
          />
          <Input
            type="password"
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button type="submit" >Đăng ký</Button>

          <Link
            to="/Login"
            className="text-sm text-blue-400 hover:underline text-center"
          >
            Đã có tài khoản? Đăng nhập
          </Link>

        </form>
      </div>
    </div>
  )
}

export default Register 