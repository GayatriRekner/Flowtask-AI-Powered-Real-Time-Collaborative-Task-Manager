import axios from "../api/axios"

export const getWorkload = async (workspaceId) => {
  const res = await axios.get(`/api/workload/${workspaceId}`)
  return res.data
}