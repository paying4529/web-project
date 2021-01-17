const Root = {
    // resolvers specified on parent itself, in this case, their prototype is (args, context, info) and you can access parent using this
    // query
    getUsers: async (args, {User}, info) => {
        // for home page, return all users (username, password, userclass)
        console.log("query, getUsers")
        return await User.find()
    },
    getClasses: async (args, {Class}, info) => {
        console.log("query, getClasses")
        return await Class.find()
    },
    getEnddate: async (args, {Date}, info) => {
        console.log("query, getEnddate")
        const result = await Date.find({})
        console.log(result[0])
        return result[0]
    },
    getSubusers: async ({username}, {User}, info) => {
        console.log("query, getSubuser")
        const result = await User.find({"username": username})
        const userClass = result[0].userclass
        if(userClass==="general director"){
            const userList = await User.find({$or:[{username:username},{userclass:"section manager"},{userclass:"group member"}]}).limit(100)
            console.log("subuser:",userList)
            return userList
        }
        else if(userClass==="section manager"){
            const userList = await User.find({$or:[{username:username},{userclass:"group member"}]}).limit(100)
            console.log("subuser:",userList)
            return userList
        }
        else if(userClass==="group member"){
            return result
        }
    },
    getOneUser: async ({username}, {User}, info) => {
        // for login, return user if username found, and whether success
        console.log("query, getOneUser")
        console.log("username", username)
        const user = await User.find({"username": username})
        console.log("user", user)
        if (user.length > 0) {
            return {
                user: user[0],
                success: true
            }
        }
        else return { success: false }  

    },
    getTodos: async ({username}, {User,Todo}, info) => {
        console.log("query todo", username)
        const userinfo = await User.find({"username": username})
        const userclass = userinfo[0].userclass
        if(userclass==="general director"){
            const data = await Todo.find({$or: [{"username": username},{userclass:"section manager"},{userclass:"group member"}]})            
            console.log(username, "query, data:", data)
            return data
        }else if(userclass==="section manager"){
            const data = await Todo.find({$or: [{"username": username},{userclass:"group member"}]})
            console.log(username, "query, data:", data)
            return data    
        }else if(userclass==="group member"){
            const data = await Todo.find({$or: [{"username": username}]})
            console.log(username, "query, data:", data)
            return data   
        }

    },
    getCalendar: async(args, {Calendar}, info) => {
        const {username, year, month} = args.data
        const todoList = await Calendar.find({$and: [{username: username}, {year: year}, {month: month}]})
        console.log(`root/getCalendar, todoList: ${todoList}`, username, year, month, args)
        if (todoList.length > 0)
        {
            return todoList[0].todolist
        }
        else
        {
            return []
        }
    },
    // mutation
    addUser: async (args, {User}, info) => {
        // for register, add new user to db if username doesn't exist
        console.log("mutation")
        const {username, password, userclass} = args.data
        const data = await User.find({"username": username})
        if (data.length > 0){
            return { success: false }
        }
        else{
            const newUser = new User({
                    username: username,
                    password: password,
                    userclass: userclass
            })
            const error = await newUser.save()
            return {
                user: newUser,
                success: true }
        }
    },
    setEnddate: async (args, {Date}, info) => {
        // for register, add new user to db if username doesn't exist
        console.log("mutation setEnddate")
        const {enddate} = args.data
        console.log(enddate)
        const eend = String(enddate)
        const data = await Date.find()
        console.log(data.length)
        if (data.length > 0){
            const newDate = new Date({ enddate: eend })
            console.log("before")
            const del = await Date.deleteOne({})
            console.log("after")
            const result = await newDate.save()
            if(result){ 
                console.log(result)
                console.log("save") 
                return { success: true }
            }
            else{ 
                console.log("error") 
                return { success: false }
            }
        }
        else{
            const newDate = new Date({ enddate: eend })
            const result = await newDate.save()
            if(result){ 
                console.log(result)
                console.log("save") 
                return { success: true }
            }
            else{ 
                console.log("error") 
                return { success: false }
            }
        }
    },

    addCalendar: async(args, {Calendar}, info) => {
        console.log("root/addCalendar")
        const {username, year, month, todoList} = args.data;
        const oldCalendar = await Calendar.find({$and:[{username: username}, {year: year}, {month: month}]})

        if (oldCalendar.length > 0)
        {
            console.log("old found")
            const del = await Calendar.deleteOne({$and:[{username: username}, {year: year}, {month: month}]})
        }
       const newCalendar = await Calendar.create({username: username, year: year, month: month, todolist: todoList})
       console.log("calendar created:", newCalendar)
  
        return true
    }

}
export default Root