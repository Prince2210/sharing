import React,{createContext,useState} from "react";
import axios from "axios";
import {useNavigate} from 'react-router-dom';
import qs from 'qs';
import { WebPrincipalCallback } from "../Principalcallback";

export const AuthContext = createContext();

export const AuthProvider = ({children}) =>{
const navigate = useNavigate()   
const [isLoading,setIsLoading] = useState(false)
const [alert,setAlert] = useState(false)
const proName = process.env.REACT_APP_PROJECT_NAME;
const [userInfo, setUserInfo] = useState({})
const [accessToken, setAccessToken] = useState()
const registration = async(firstName,lastName,email,phoneNumber) =>{
    setIsLoading(true)
  await axios
  .post(`${process.env.REACT_APP_SIGNUP}`,{
        firstName,
        lastName,
        email,
        phoneNumber,
        userName:email,
        position:"consumer",
        roleName:"consumer",
        projectName:proName
    }).then((res)=>{
        if(res.status === 201){
            let userData = res.config.data;
            setUserInfo(userData);
            localStorage.setItem("userData",userData)
            setIsLoading(false)
            navigate('/signup/verify')
        }
    }).catch((err)=>{
        console.log(err)
    setIsLoading(false)
    })
}
const verify = async (email, verificationCode) => {
    setIsLoading(true)
    await axios.post(`${process.env.REACT_APP_VERIFICATION}`, {
        email: email.toLowerCase(),
        verificationCode,
        parentUserName: "administrator_nagpur"
    }).then((res) => {
        if (res.status === 201 || res.status === 200) {
            localStorage.clear()
            setIsLoading(false)
            navigate("/")
        }

    }).catch((err) => {
        if (err.response.status === 400) {
            setAlert(true)
            setIsLoading(false)
        }
        console.log(err)
        setIsLoading(false)
    })
}
const login = async (username, password) => {
    setIsLoading(true)
    await axios.post(`${process.env.REACT_APP_SINGIN}`, qs.stringify({
        username: username,
        password,
        client_id: 'reveloadmin',
        grant_type: 'password'
    }), {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        }
    }).then(async (res) => {
        console.log(res)
        if (res.status === 200 && res.data.access_token) {
            let accessToken = `Bearer ${res.data.access_token}`
            setAccessToken(accessToken)
            console.log(accessToken)
            localStorage.setItem('accesstoken', accessToken)
            axios.defaults.headers.common["Authorization"] = accessToken;
            let userInfos = await WebPrincipalCallback();
            console.log(userInfos)
            localStorage.setItem('userInfo', JSON.stringify(userInfos))
            setUserInfo(userInfos)
            navigate('/consumer')
            setIsLoading(false)
        }

    }).catch((err) => {
        if (err.response.status===401) {
            setAlert(true)
            setIsLoading(false)
        }
    })
}
    return(
        <AuthContext.Provider value={{
            verify,
            login,
            registration,
            isLoading,
            alert,
            accessToken,
            userInfo
        }} >
            {children}
        </AuthContext.Provider>
    );
}
