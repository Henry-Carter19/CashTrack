import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

interface GoogleUser {
  email: string;
  name: string;
  picture: string;
}

const Login = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 relative overflow-hidden">

      {/* Background blur shapes */}
      <div className="absolute w-72 h-72 bg-white/20 rounded-full blur-3xl top-10 left-10"></div>
      <div className="absolute w-96 h-96 bg-white/10 rounded-full blur-3xl bottom-10 right-10"></div>

      {/* Card */}
      <div className="relative bg-white/90 backdrop-blur-md p-10 rounded-2xl shadow-2xl w-full max-w-md text-center border border-white/40">

        {/* Logo */}
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xl font-bold shadow-md">
            ₹
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-800">CashTrack</h1>
        <p className="text-gray-500 mt-2 mb-6 text-sm">
          Manage your expenses smarter
        </p>

        {/* Google Button */}
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={(credentialResponse) => {
              if (!credentialResponse.credential) return;

              const decoded: GoogleUser = jwtDecode(
                credentialResponse.credential
              );

              localStorage.setItem("user", JSON.stringify(decoded));
              navigate("/");
            }}
            onError={() => {
              console.log("Login Failed");
            }}
          />
        </div>

        {/* Footer */}
        <p className="text-xs text-gray-400 mt-6">
          Secure login powered by Google
        </p>
      </div>
    </div>
  );
};

export default Login;