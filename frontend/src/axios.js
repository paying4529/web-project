import { useQuery, useMutation, useSubscription } from '@apollo/client';
import  {JOB_QUERY, USERS_QUERY, TODOS_QUERY, ONE_USER_QUERY, SUBUSER_QUERY, ENDDATE_QUERY, CALENDAR_QUERY, CLASSES_QUERY} from './graphql/queries'
import {CREATE_JOB_MUTATION, CREATE_USER_MUTATION, SET_ENDDATE_MUTATION, ADD_CALENDAR_MUTATION, ADD_TODO_MUTATION,ADD_CLASS_MUTATION } from './graphql/mutations'
import { TODO_SUBSCRIPTION, MSG_SUBSCRIPTION } from './graphql/subscription'
import { useState, useEffect } from 'react';

const GetUsers = () => { 
    const {loading, error, data} = useQuery(USERS_QUERY)
    return data
}

const GetJobs = () => { 
    const {loading, error, data, refetch} = useQuery(JOB_QUERY)
    const [toget, setToGet] = useState(true)
    useEffect(() => {   
        console.log("getjob")
        if(toget){
            refetch()
            if(!data){
                refetch()
                setToGet(false)
            }
        }
    }, [toget,data])
    return {job:data,setToGet}
}

const GetClasses = () => { 
    const {loading, error, data, refetch} = useQuery(CLASSES_QUERY)
    const [toget, setToGet] = useState(false)
    useEffect(() => {   
        if(toget){
            refetch()
            if(!data){
                refetch()
            }
            setToGet(false)   
        }
    }, [toget,data])
    return {data,setToGet}
}

const GetEnddate = () => { 
    const {loading, error, data, refetch} = useQuery(ENDDATE_QUERY)
    // console.log("get enddate")
    const [toget, setToGet] = useState(false)
    useEffect(() => {   
        if(toget){
            refetch()
            if(!data){
                refetch()
                setToGet(false)
            }
        }
    }, [toget,data])
    return {data,setToGet}
}

const GetSubClass = (username) => { 
    const {loading, error, data} = useQuery(SUBUSER_QUERY,  {variables: {username: username}})
    return data
}

const NewUser = () => {
    const [addUser, {data}] = useMutation(CREATE_USER_MUTATION)
    const [isSuccess, setIsSuccess] = useState(false)
    useEffect(()=>{
        if (data){ setIsSuccess(data.addUser.success) }
    }, [data])
    const createUser = (userinfo) => {
        const {username, password, userclass} = userinfo
        addUser({ variables: {
                username: username,
                password: password,
                userclass: userclass
        }})

    }
    return {createUser, isSuccess}
}

const NewJob = () => {
    const [addJob] = useMutation(CREATE_JOB_MUTATION)
    const createJob = (jobinfo) => {
        const {joblist, mutation} = jobinfo
        console.log("axios",jobinfo)
        addJob({ variables: {
            joblist: joblist,
            mutation: mutation,
        }})

    }
    return {createJob}
}

const SetEnddate = () => {
    const [setEnddate, {data}] = useMutation(SET_ENDDATE_MUTATION)
    const [isSuccess, setIsSuccess] = useState(false)
    useEffect(()=>{
        if (data){ 
            console.log(data)
            setIsSuccess(data.setEnddate.success) 
        }
    }, [data])
    const newEnddate = async (date) => {
        if(date){
            console.log(date)
            const x = await setEnddate({ variables: {
                enddate: date,
            }})
        }
    }
    return {newEnddate, isSuccess}
}

const UserLogin = () => {
    // for login, loginSuccess (true, false), login: function
    const [userName, setUserName] = useState("")
    const [passWord, setPassWord] = useState("")
    const [loginSuccess, setLoginSuccess] = useState(false);
    const {loading, error, data} = useQuery(ONE_USER_QUERY,  {variables: {username: userName}})
    const login = (userinfo) => {
        if (userinfo === false){
            setLoginSuccess(false);
            setUserName("");
            setPassWord("");
        }else{
            const {username, password} = userinfo
            setUserName(username);
            setPassWord(password);
        }
    }

    useEffect(() => {
        if (data){
            if (data.getOneUser.success === true && data.getOneUser.user.password === passWord){
                setLoginSuccess(true)
            }else{
                setLoginSuccess(false)
            }
    }}, [data,login])
    return {loginSuccess, login}
}

const MutateTodo = () => {
    const [addTodo] = useMutation(ADD_TODO_MUTATION)
    const saveTodo = (addtodoinput) => {
        const {username, userclass, todolist, mutation, todoitem} = addtodoinput
        console.log("axios/saveTodo, todoitem", addtodoinput)
        addTodo({
            variables: {
                username: username,
                userclass: userclass,
                todolist: todolist,
                mutation: mutation,
                todoitem: todoitem,
            }
        })
    }
    
    return {saveTodo}
}

const MutateClass = () => {
    const [addClass] = useMutation(ADD_CLASS_MUTATION)
    const saveClass = (addclassinput) => {
        const {classlist, mutation} = addclassinput
        console.log("axios/saveclass, classlist", addclassinput)
        addClass({
            variables: {
                classlist: classlist,
                mutation: mutation,
            }
        })
    }
    return {saveClass}
}

const GetTodo = () => { 
    const [username, setUsername] = useState("")
    const [toget, setToGet] = useState(false)
    const {loading, error, data, subscribeToMore, refetch} = useQuery(TODOS_QUERY,{variables: { username }})
    useEffect(() => {   
        if(toget){
            // refetch()
            console.log("don't refetch")
            setToGet(false)
        }
    }, [toget])
    useEffect(() => {
        if (username !== '')
        {
            subscribeToMore({
                document: TODO_SUBSCRIPTION,
                variables: {username: username},
                updateQuery: (prev, {subscriptionData}) => {
                    if (!subscriptionData) return prev
                    console.log("update Query!", subscriptionData)
                    console.log("prev:", prev)
                    return {
                        getTodos: prev.getTodos.map(e => {return (e.username === username) ? {username: e.username, userclass: e.userclass, todolist: subscriptionData.data.subTodo.todolist}:{e}})
                    }
                }
            })
        }
    }, [username])
    useEffect(() => {
        console.log("GetTodo", username, data)
    }, [JSON.stringify(data)])
    return {data, setToGet, setUsername}
}

const GetCalendar = () => {
    
    const [username, setUserName] = useState("")
    const [year, setYear] = useState(-1)
    const [month, setMonth] = useState(-1)
    // const [todolist, setTodoList] = useState([])
    
    const {loading, error, data, refetch} = useQuery(CALENDAR_QUERY, {variables: {username: username, year: year, month: month}})
    const [setData] = useMutation(ADD_CALENDAR_MUTATION)
    
    const setRefetch = ({username, year, month}) => {
        console.log("setrefetch:", username, year, month)
        setYear(year)
        setMonth(month)
        setUserName(username)
    }
    useEffect(async () => {
        console.log("refetch calander!")
        await refetch({variables: {username: username, year: year, month: month}, fetchPolicy: 'no-cache'})
    }, [username, month, year])
    const addToCalendar = async ({username, year, month, todolist}) => {
        console.log("mutation calendar", username, year, month, todolist)
        await setData({variables: {username: username, year: year, month: month, todoList: todolist}})
        console.log("refetch calendar!")
        await refetch({variables: {username: username, year: year, month: month}, fetchPolicy: 'no-cache'})

    }
    
    useEffect(() => {
        console.log("axios/getcalendar, data:", data)
    }, [JSON.stringify(data)])
    return {data, setRefetch, addToCalendar}
}
const GetTodoCal = () => { 

    const [username, setUserNameTodo] = useState("")
    const [month, setMonthTodo] = useState(0)
    const [year, setYearTodo] = useState(0)
    const [monthLong, setMonthLongTodo] = useState(0)

    const [todolist, setTodoList] = useState([])
    const {loading, error, data, refetch} = useQuery(TODOS_QUERY,{variables: { username: username}}) // b.c. the user is fixed, only need to query once
 
    const updateTodoCal = ({username, month, year, monthLong}) => {
        setUserNameTodo(username);
        setMonthTodo(month);
        setYearTodo(year);
        setMonthLongTodo(monthLong);
    }
    useEffect(() => {
        updateCallback(username, month, year, monthLong);
    }, [data, month, year])

    const updateCallback = (username, month, year, monthLong) => {
        let tmp = Array(monthLong).fill([]);
        if (data){
            for (var i = 0; i < data.getTodos.length; i++){
                if (data.getTodos[i].username == username){
                    for (var j = 0; j < data.getTodos[i].todolist.length; j++){
                        const deadline = data.getTodos[i].todolist[j].deadline;
                        const value = data.getTodos[i].todolist[j].value;
                        const [_year, _month, _date] = deadline.split('-');
                        if (_month == month && _year == year){
                            tmp[parseInt(_date) - 1] = [...tmp[parseInt(_date) - 1], value];
                        }
                    }
                }
            }
        }
        setTodoList(tmp);
    }
    return {todolist, updateTodoCal}
}

const SubMsg = (username) => {
    const { data, loading } = useSubscription(
        MSG_SUBSCRIPTION,
        { variables: { username } }
      );
    const [msg, setMsg] = useState("")
    const clearMsg = () => {
        setMsg("")
    }
    useEffect(() => {
        if (data)
        {
            if (data.subMsg.mutation === "CREATED")
            {
                setMsg(`${data.subMsg.sender} creates a TODO ${data.subMsg.todoitem.value}`)
            }
            else if (data.subMsg.mutation === "DELETED")
            {
                setMsg(`${data.subMsg.sender} finished a TODO ${data.subMsg.todoitem.value}`)
            }
        }
    }, [data])
    return {msg, clearMsg}
}

export { GetJobs, NewJob, GetUsers, NewUser, UserLogin, MutateTodo, GetTodo, GetSubClass, SetEnddate, GetEnddate, GetCalendar, GetClasses, MutateClass, GetTodoCal, SubMsg};
