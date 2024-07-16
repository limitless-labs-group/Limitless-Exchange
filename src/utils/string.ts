export const cutUsername = (username: string) => {
  if (username.length < 10) {
    return username
  }
  return `${username.slice(0, 10)}...`
}
