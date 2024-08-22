///////////////////////////////////////
//TICKET CREATION SYSTEM
///////////////////////////////////////
import {openticket, api, utilities} from "../index"
import * as discord from "discord.js"

export const registerActions = async () => {
    openticket.actions.add(new api.ODAction("openticket:create-ticket-permissions"))
    openticket.actions.get("openticket:create-ticket-permissions").workers.add([
        new api.ODWorker("openticket:check-blacklist",4,(instance,params,source,cancel) => {
            if (!params.option.get("openticket:allow-blacklisted-users").value && openticket.blacklist.exists(params.user.id)){
                instance.valid = false
                instance.reason = "blacklist"
                openticket.log(params.user.displayName+" tried to create a ticket but is blacklisted!","info",[
                    {key:"user",value:params.user.username},
                    {key:"userid",value:params.user.id,hidden:true},
                    {key:"option",value:params.option.id.value}
                ])
                return cancel()
            }
        }),
        new api.ODWorker("openticket:check-cooldown",3,(instance,params,source,cancel) => {
            const cooldown = openticket.cooldowns.get("openticket:option-cooldown_"+params.option.id.value)
            if (cooldown && cooldown instanceof api.ODTimeoutCooldown && cooldown.use(params.user.id)){
                instance.valid = false
                instance.reason = "cooldown"
                const remaining = cooldown.remaining(params.user.id) ?? 0
                instance.cooldownUntil = new Date(new Date().getTime() + remaining)

                openticket.log(params.user.displayName+" tried to create a ticket but is on cooldown!","info",[
                    {key:"user",value:params.user.username},
                    {key:"userid",value:params.user.id,hidden:true},
                    {key:"option",value:params.option.id.value},
                    {key:"remaining",value:(remaining/1000).toString()+"sec"}
                ])
                return cancel()
            }
        }),
        new api.ODWorker("openticket:check-global-limits",2,(instance,params,source,cancel) => {
            const generalConfig = openticket.configs.get("openticket:general")
            if (!generalConfig.data.system.limits.enabled) return

            const allTickets = openticket.tickets.getAll()
            const globalTicketCount = allTickets.length
            const userTickets = openticket.tickets.getFiltered((ticket) => ticket.exists("openticket:opened-by") && (ticket.get("openticket:opened-by").value == params.user.id))
            const userTicketCount = userTickets.length

            if (globalTicketCount >= generalConfig.data.system.limits.globalMaximum){
                instance.valid = false
                instance.reason = "global-limit"
                openticket.log(params.user.displayName+" tried to create a ticket but reached the limit!","info",[
                    {key:"user",value:params.user.username},
                    {key:"userid",value:params.user.id,hidden:true},
                    {key:"option",value:params.option.id.value},
                    {key:"limit",value:"global"}
                ])
                return cancel()
            }else if (userTicketCount >= generalConfig.data.system.limits.userMaximum){
                instance.valid = false
                instance.reason = "global-user-limit"
                openticket.log(params.user.displayName+" tried to create a ticket, but reached the limit!","info",[
                    {key:"user",value:params.user.username},
                    {key:"userid",value:params.user.id,hidden:true},
                    {key:"option",value:params.option.id.value},
                    {key:"limit",value:"global-user"}
                ])
                return cancel()
            }
        }),
        new api.ODWorker("openticket:check-option-limits",1,(instance,params,source,cancel) => {
            if (!params.option.exists("openticket:limits-enabled") || !params.option.get("openticket:limits-enabled").value) return

            const allTickets = openticket.tickets.getFiltered((ticket) => ticket.option.id.value == params.option.id.value)
            const globalTicketCount = allTickets.length
            const userTickets = openticket.tickets.getFiltered((ticket) => ticket.option.id.value == params.option.id.value && ticket.exists("openticket:opened-by") && (ticket.get("openticket:opened-by").value == params.user.id))
            const userTicketCount = userTickets.length

            if (globalTicketCount >= params.option.get("openticket:limits-maximum-global").value){
                instance.valid = false
                instance.reason = "option-limit"
                openticket.log(params.user.displayName+" tried to create a ticket, but reached the limit!","info",[
                    {key:"user",value:params.user.username},
                    {key:"userid",value:params.user.id,hidden:true},
                    {key:"option",value:params.option.id.value},
                    {key:"limit",value:"option"}
                ])
                return cancel()
            }else if (userTicketCount >= params.option.get("openticket:limits-maximum-user").value){
                instance.valid = false
                instance.reason = "option-user-limit"
                openticket.log(params.user.displayName+" tried to create a ticket, but reached the limit!","info",[
                    {key:"user",value:params.user.username},
                    {key:"userid",value:params.user.id,hidden:true},
                    {key:"option",value:params.option.id.value},
                    {key:"limit",value:"option-user"}
                ])
                return cancel()
            }
        }),
        new api.ODWorker("openticket:valid",0,(instance,params,source,cancel) => {
            instance.valid = true
            instance.reason = null
            cancel()
        })
    ])
}