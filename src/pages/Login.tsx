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
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md text-center">
        <h1 className="text-2xl font-semibold mb-6">Login to CashTrack</h1>

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
    </div>
  );
};

export default Login;