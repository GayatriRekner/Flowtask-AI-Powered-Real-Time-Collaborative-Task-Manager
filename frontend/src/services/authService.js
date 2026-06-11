
import API from "../api/axios"

export const loginUser = async(email, password) => {

    const formData = new URLSearchParams()

    formData.append("username", email)

    formData.append("password", password)

    const response = await API.post(
        "/login",
        formData,
        {
            headers: {
                "Content-Type":
                "application/x-www-form-urlencoded"
            }
        }
    )

    return response.data
}
