import API from "../api/axios"
import axios from "axios"
export const getWorkspaces = async() => {

    const response = await API.get(
        "/workspaces"
    )

    return response.data
}

export const createWorkspace = async(data) => {

    const response = await API.post(
        "/workspace",
        data
    )

    return response.data
}
export const getBoards = async(workspaceId) => {

    const response = await API.get(
        `/boards/${workspaceId}`
    )

    return response.data
}

export const createBoard = async(data) => {

    const response = await API.post(
        "/board",
        data
    )

    return response.data
}
export const getColumns = async(boardId) => {

    const response = await API.get(
        `/columns/${boardId}`
    )

    return response.data
}

export const createColumn = async(data) => {

    const response = await API.post(
        "/column",
        data
    )

    return response.data
}
export const deleteColumn = async(columnId) => {
    const response = await API.delete(
        `/column/${columnId}` // <--- Make sure there is NO 's' here!
    )
    return response.data
}
export const getTasks = async(boardId) => {

    const response = await API.get(
        `/tasks/${boardId}`
    )

    return response.data
}

export const createTask = async(data) => {

    const response = await API.post(
        "/task",
        data
    )

    return response.data
}
export const moveTask = async(
    taskId,
    columnId
) => {

    const response = await API.put(
        `/task/${taskId}/move`,
        {
            column_id: columnId
        }
    )

    return response.data
}
export const deleteTask = async(taskId) => {

    const response = await API.delete(
        `/task/${taskId}`
    )

    return response.data
}


export const deleteBoard = async(boardId) => {

    const response = await API.delete(
        `/boards/${boardId}`
    )

    return response.data
}
export const updateTask = async(
    taskId,
    data
) => {

    const response = await API.put(
        `/task/${taskId}`,
        data
    )

    return response.data
}
export const deleteWorkspace = async(
    workspaceId
) => {

    const response = await API.delete(
        `/workspace/${workspaceId}`
    )

    return response.data
}
export const getTaskCount = async() => {

    const response = await API.get(
        "/tasks/count"
    )

    return response.data
}
export const getMyTasks = async() => {

    const response = await API.get(
        "/my-tasks"
    )

    return response.data
}
export const getUsers = async() => {

    const response = await API.get(
        "/users"
    )

    return response.data
}
export const getWorkspaceMembers = async(workspaceId) => {


const response = await API.get(
    `/workspace/${workspaceId}/members`
)

return response.data


}
export const getWorkspaceTasks = async(workspaceId) => {

    const response = await API.get(
        `/workspace/${workspaceId}/tasks`
    )

    return response.data
}
export const inviteMember = async(
    workspaceId,
    email
) => {

    const response = await API.post(
        `/workspace/${workspaceId}/invite`,
        { email }
    )

    return response.data
}
export const generateTaskAI = async (title) => {
  const response = await API.post("/api/ai/generate-task", { title })
  return response.data
}
export const getActivities = async (workspaceId) => {
  const response = await API.get(`/activities/${workspaceId}`)
  return response.data
}
