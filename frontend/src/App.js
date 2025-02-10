import React, { useEffect, useState } from "react";
import Axios from "axios";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import UpcomingTests from "./pages/UpcomingTestsPage";
import Signup from "./pages/Signup"
import Home from "./pages/home";
import TestDetails from "./pages/testpages/TestHomePage";
import TestScreen from "./pages/testpages/TestMainScreen";
import TestForm from "./pages/uploader/testform";
import ResultScreen from "./pages/testpages/result";
import { DataGiver } from "./pages/user_data.jsx";
import AdminLogin from "./pages/adminlogin";
import AdminDashboard from "./pages/uploader/admindashboard";
import TestResultsAdmin from "./pages/uploader/testresult";
import TestPreview from "./pages/uploader/testdetail";
import EditQuestion from "./pages/uploader/editquestion";
import TestReviewStudent from "./pages/testdetailstudent";


function App() {
  // const [data, setData] = useState("");

  // // Fetch data from the server
  // const getData = async () => {
  //   const response = await Axios.get("http://localhost:8000/getData");
  //   setData(response.data);
  // };

  // useEffect(() => {
  //   getData();
  // }, []);


  return (
    <DataGiver>
       <Router>
        
        {/* <div className="app"> */}
          <Routes>
          <Route path="/" element={<UpcomingTests />} />
          <Route path="/signup" element={<Signup/>} />
          <Route path="/admin-login" element={<AdminLogin/>} />
          <Route path="/admin/create-test" element={<TestForm/>} />
          <Route path="/home" element={<Home/>}/>
          <Route path="/test/:testId" element={<TestDetails />} />
          <Route path="/test/:testId/start" element={<TestScreen />} />
          <Route path="/test/:testId/result" element={<ResultScreen />} />
          <Route path="/test/:testId/testreview" element={<TestReviewStudent />} />
          <Route path="/admin" element={<AdminDashboard/>} />
          <Route path="/admin/:testId/result" element={<TestResultsAdmin/>} />
          <Route path="/admin/upcoming/:testId" element={<TestPreview />} />
          <Route path="/admin/edit-question/:testId" element={<EditQuestion />} />

        </Routes>
      {/* </div> */}

    
    </Router>

    </DataGiver>
   
  );
}

export default App;
