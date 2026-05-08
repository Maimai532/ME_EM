import { Outlet } from "react-router-dom";

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="w-full">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;