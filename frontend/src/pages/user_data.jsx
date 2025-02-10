import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const DataGiver = ({ children }) => {
  const [token, setToken] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true); // Add a loading state

  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem("dedo_data"));
    if (storedData) {
      const { userToken, user } = storedData;
      setToken(userToken);
      setIsAuth(true);
      setUserData(user);
    }
    setLoading(false); // Set loading to false after checking localStorage
  }, []);

  const getit = (newToken, newData) => {
    localStorage.setItem(
      "dedo_data",
      JSON.stringify({ userToken: newToken, user: newData })
    );
    setToken(newToken);
    setUserData(newData);
    setIsAuth(true);
  };

  const logout = () => {
    localStorage.removeItem("dedo_data");
    setToken(null);
    setUserData(null);
    setIsAuth(false);
  };

  return (
    <AuthContext.Provider value={{ token, isAuth, userData, logout, getit, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);