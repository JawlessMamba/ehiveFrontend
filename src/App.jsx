import { RouterProvider } from "react-router-dom";
import "./App.css";
import { router } from "./routes/router";
import { ToastContainer } from "react-toastify";

function App() {
  return (
    <div>
          <ToastContainer 
        position="top-right" 
        autoClose={3000} 
        hideProgressBar={false} 
        newestOnTop={false} 
        closeOnClick 
        rtl={false} 
        pauseOnFocusLoss 
        draggable 
        pauseOnHover 
        theme="colored"
      />
      <RouterProvider router={router} />
    </div>
  );
}
export default App;
