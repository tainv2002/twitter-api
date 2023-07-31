export interface RegisterRequestBody {
  email: string
  name: string
  date_of_birth: string
  password: string
  confirm_password: string
}

export interface LoginRequestBody {
  email: string
  password: string
}
