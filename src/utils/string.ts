export const cutUsername = (username: string, value = 10) => {
  if (username.length < value) {
    return username
  }
  return `${username.slice(0, value)}...`
}
