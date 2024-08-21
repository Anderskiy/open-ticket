import {openticket, api, utilities} from "../../index"

export const loadAllBlacklistedUsers = async () => {
    const userDatabase = openticket.databases.get("openticket:users")
    if (!userDatabase) return
    
    const users = userDatabase.getCategory("openticket:blacklist") ?? []
    users.forEach((user) => {
        if (typeof user.value != "string") return
        openticket.blacklist.add(new api.ODBlacklist(user.key,user.value))
    })
}