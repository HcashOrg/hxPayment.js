type TodoItem = {
    content: string,
    time: int,
    author: string
}

type Storage = {
    items: Map<string> -- address => json list of TodoItem
}

var M = Contract<Storage>()

let function get_from_address()
    var from_address: string
    let prev_contract_id = get_prev_call_frame_contract_address()
    if prev_contract_id and is_valid_contract_address(prev_contract_id) then
        from_address = prev_contract_id
    else
        from_address = caller_address
    end
    return from_address
end

function M:init()
    self.storage.items = {}
end

function M:addTodo(arg: string)
    let from = get_from_address()
    if (not arg) or (#arg < 1) then
        return error("content can't be empty")
    end
    let content = arg
    let todoItem = TodoItem()
    todoItem.content = content
    todoItem.time = get_chain_now()
    todoItem.author = from
    let userItemsJsonStr = tostring(self.storage.items[from] or '[]')
    let userItems = totable(json.loads(userItemsJsonStr))
    table.append(userItems, todoItem)
    self.storage.items[from] = json.dumps(userItems)
    let todoItemStr = json.dumps(todoItem)
    emit AddedTodo(todoItemStr)
    return todoItemStr
end

offline function M:listTodosOfUser(userAddr: string)
    let userItemsJsonStr = tostring(self.storage.items[userAddr] or '[]')
    return userItemsJsonStr
end

return M
