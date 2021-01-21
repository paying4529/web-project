const Root = {

    getUsers: async(args, {User}, info) => {
        // for home page, return all users (username, password, userclass)
        console.log("query, getUsers")
        return await User.find()
    },
    getClasses: async(args, {Class}, info) => {
        console.log("query, getClasses")
        const classlist = await Class.find()
        console.log(classlist)
        return classlist[classlist.length-1]
    },
    getEnddate: async(args, {Date}, info) => {
        console.log("query, getEnddate")
        const result = await Date.find({})
        console.log(result[0])
        return result[0]
    },
    getJob: async(args, {Job}, info) => {
        console.log("query, getJob")
        const result = await Job.find({})
        return result[0]
    },
    getSubusers: async({username}, {User}, info) => {
        console.log("query, getSubuser")
        const result = await User.find({"username": username})
        const userClass = result[0].userclass.split(" ")
        if(userClass[userClass.length-1]==="director"){
            const userList = await User.find({$or:[{username:username},{userclass:/manager/},{userclass:/member/}]}).limit(100)
            return userList
        }
        else if(userClass[userClass.length-1]==="manager"){
            const userList = await User.find({$or:[{username:username},{userclass:userClass[0]+" member"}]}).limit(100)
            return userList
        }
        else if(userClass[userClass.length-1]==="member"){
            return result
        }
    },
    getOneUser: async({username}, {User}, info) => {
        // for login, return user if username found, and whether success
        console.log("query, getOneUser")
        console.log("username", username)
        const user = await User.find({"username": username})
        if (user.length > 0) { return { user: user[0], success: true } }
        else return { success: false }   

    },
    getTodos: async({username}, {User,Todo}, info) => {
        console.log("query todo", username)
        const userinfo = await User.find({"username": username})
        const userclass = userinfo[0].userclass.split(" ")
        if(userclass[userclass.length-1]==="director"){
            const data = await Todo.find({$or: [{"username": username},{userclass:/manager/},{userclass:/member/}]})            
            console.log(username, "query, data:", data)
            return data
        }else if(userclass[userclass.length-1]==="manager"){
            const data = await Todo.find({$or: [{"username": username},{userclass:userclass[0]+" member"}]})
            console.log(username, "query, data:", data)
            return data    
        }else if(userclass[userclass.length-1]==="member"){
            const data = await Todo.find({$or: [{"username": username}]})
            console.log(username, "query, data:", data)
            return data   
        }

    },
    getCalendar: async(args, {Calendar}, info) => {
        const {username, year, month} = args.data
        const todoList = await Calendar.find({$and: [{username: username}, {year: year}, {month: month}]})
        console.log(`root/getCalendar, todoList: ${todoList}`, username, year, month, args)
        if (todoList.length > 0){ return todoList[0].todolist}
        else{ return []}
    },

    addUser: async(args, {User}, info) => {
        // for register, add new user to db if username doesn't exist
        console.log("mutation, adduser")
        const {username, password, userclass} = args.data
        const data = await User.find({"username": username})
        if (data.length > 0){ return { success: false }}
        else{
            const newUser = new User({ username: username, password: password, userclass: userclass})
            const result = await newUser.save()
            return { user: newUser, success: true }
        }
    },
    setEnddate: async(args, {Date}, info) => {
        console.log("setenddate")
        const {enddate} = args.data
        const eend = String(enddate)
        const data = await Date.find()
        if (data.length > 0){ const del = await Date.deleteOne({})}
        const newDate = new Date({ enddate: eend })
        const result = await newDate.save()
        if(result){ return { success: true }}
        else{ return { success: false }}
    },
    
    addCalendar: async(args, {Calendar}, info) => {
        console.log("root/addCalendar")
        const {username, year, month, todoList} = args.data;
        const oldCalendar = await Calendar.find({$and:[{username: username}, {year: year}, {month: month}]})
        if (oldCalendar.length > 0){ const del = await Calendar.deleteOne({$and:[{username: username}, {year: year}, {month: month}]})}
        const newCalendar = await Calendar.create({username: username, year: year, month: month, todolist: todoList})
        console.log("calendar created:", newCalendar)
        return true
    },

    addTodo: async(args, {Todo}, info) => {
        const {username, userclass, todolist, mutation, todoitem} = args.data
        console.log("root/addTodo", username, userclass, todolist)
        const oldTodo = await Todo.find({username: username})
        if (oldTodo.length > 0){ const del = await Todo.deleteOne({username: username}) }
        const newTodo = await Todo.create({username: username, userclass: userclass, todolist: todolist})
        
        return true
    },

    addClass: async(args, {Class}, info) => {
        const {classlist, mutation} = args.data
        console.log("root/addClass", classlist)
        const oldClass = await Class.find({})
        if (oldClass.length > 0){ const del = await Class.deleteOne({}) }
        const newclasslist = await Class.create({classlist:classlist})
        return true
    },

    addJob: async(args, {Job}, info) => {
        const {joblist, mutation} = args.data
        console.log("root/addJob",joblist)
        const oldjob = await Job.find({})
        if (oldjob.length > 0){ const del = await Job.deleteOne({})}
        const newjoblist = await Job.create({joblist:joblist})
        return true
    },

}

export default Root