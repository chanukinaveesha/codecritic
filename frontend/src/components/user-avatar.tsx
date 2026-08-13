import { Avatar, AvatarFallback } from "./ui/avatar";

export function UserAvatar({
    username,
    size = "sm"
}:{username:string,size?:"sm"|"md"|"lg"}) {
    const initials = username.slice(0, 2).toUpperCase();
    const dimension = size === "sm" ? "size-6" : "size-9";

    return (
        <Avatar className={dimension}>
            <AvatarFallback className="bg-blue-500 test-xs font font-medium text-white">{initials}</AvatarFallback>
        </Avatar>
    )
}  