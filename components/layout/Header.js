"use client";
import { CartContext } from "@/components/AppContext";
import Bars2 from "@/components/icons/Bars2";
import ShoppingCart from "@/components/icons/ShoppingCart";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useContext, useState } from "react";

function AuthLinks({ status, userName }) {
  if (status === "authenticated") {
    return (
      <>
        <Link
          href={"/profile"}
          className="whitespace-nowrap text-gray-500 hover:text-gray-700 transition-colors"
        >
          Hello, {userName}
        </Link>
        <button
          onClick={() => signOut()}
          className="bg-white hover:bg-yellow-50 rounded-full border border-yellow-400 text-yellow-600 hover:text-yellow-700 px-6 py-2 font-medium transition-colors"
        >
          Logout
        </button>
      </>
    );
  }
  if (status === "unauthenticated") {
    return (
      <>
        <Link
          href={"/login"}
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          Login
        </Link>
        {/* <Link
          href={"/register?type=end_user"}
          className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 rounded-full px-6 py-2 font-medium transition-colors inline-block shadow-sm"
        >
          Order Food
        </Link> */}
      </>
    );
  }
}

export default function Header() {
  const session = useSession();
  const status = session?.status;
  const userData = session.data?.user;
  let userName = userData?.name || userData?.email;
  const { cartProducts } = useContext(CartContext);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  if (userName && userName.includes(" ")) {
    userName = userName.split(" ")[0];
  }

  return (
    <header className="px-4 py-4 bg-white shadow-sm">
      {/* Mobile Navigation */}
      <div className="flex items-center md:hidden justify-between">
        <Link className="text-yellow-500 font-bold text-2xl" href={"/"}>
          ST PIZZA
        </Link>
        <div className="flex gap-4 items-center">
          <Link
            href={"/cart"}
            className="relative p-2 hover:text-yellow-500 transition-colors"
          >
            <ShoppingCart />
            {cartProducts?.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-yellow-400 text-gray-900 text-xs py-1 px-2 rounded-full leading-3 min-w-[20px] text-center font-medium">
                {cartProducts.length}
              </span>
            )}
          </Link>
          <button
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-yellow-400 transition-colors"
            onClick={() => setMobileNavOpen((prev) => !prev)}
          >
            <Bars2 />
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileNavOpen && (
        <div
          onClick={() => setMobileNavOpen(false)}
          className="md:hidden p-4 bg-white border border-gray-200 rounded-lg mt-4 flex flex-col gap-3 text-center shadow-lg"
        >
          <Link
            href={"/"}
            className="py-2 text-gray-600 hover:text-yellow-500 transition-colors"
          >
            Home
          </Link>
          <Link
            href={"/menu"}
            className="py-2 text-gray-600 hover:text-yellow-500 transition-colors"
          >
            Menu
          </Link>
          <div className="flex flex-col gap-3 pt-3 border-t border-gray-200">
            <AuthLinks status={status} userName={userName} />
          </div>
        </div>
      )}

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center justify-between">
        <nav className="flex items-center gap-8 text-gray-600 font-medium">
          <Link className="text-yellow-500 font-bold text-2xl mr-4" href={"/"}>
            ST PIZZA
          </Link>
          <Link href={"/"} className="hover:text-yellow-500 transition-colors">
            Home
          </Link>
          <Link
            href={"/menu"}
            className="hover:text-yellow-500 transition-colors"
          >
            Menu
          </Link>
        </nav>

        <nav className="flex items-center gap-6 text-gray-600 font-medium">
          <AuthLinks status={status} userName={userName} />
          <Link
            href={"/cart"}
            className="relative p-2 hover:text-yellow-500 transition-colors"
          >
            <ShoppingCart />
            {cartProducts?.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-yellow-400 text-gray-900 text-xs py-1 px-2 rounded-full leading-3 min-w-[20px] text-center font-medium">
                {cartProducts.length}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}
