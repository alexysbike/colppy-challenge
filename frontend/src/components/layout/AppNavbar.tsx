import { Navbar, NavbarBrand } from 'flowbite-react'

export function AppNavbar() {
  return (
    <Navbar fluid border>
      <NavbarBrand as="div">
        <img src="/logo.svg" className="mr-3 h-8" alt="" />
        <span className="self-center text-xl font-semibold whitespace-nowrap">
          Ventas
        </span>
      </NavbarBrand>
    </Navbar>
  )
}
