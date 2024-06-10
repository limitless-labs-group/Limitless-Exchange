type Props = {
  params: { address: string }
}

const Layout = ({ children }: React.PropsWithChildren) => {
  return <>{children}</>
}

export default Layout
