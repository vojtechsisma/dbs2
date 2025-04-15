import { Button } from "../ui/button";
import { Sheet, SheetTrigger, SheetContent } from "../ui/sheet";

interface Props {
  userName: string;
  userRole: string;
  isLoggedIn: boolean;
}

const SheetWrapper = ({ userName, userRole, isLoggedIn }: Props) => {
  return (
    <Sheet>
      <SheetTrigger>
        <svg
          className="mt-2"
          width="24px"
          height="30px"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4 18L20 18"
            stroke="#000000"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M4 12L20 12"
            stroke="#000000"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M4 6L20 6"
            stroke="#000000"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </SheetTrigger>
      <SheetContent className="flex flex-col">
        <a
          className="mr-6 font-bold text-2xl inline-flex items-center gap-2"
          href="/"
        >
          <span className="text-5xl">🚲</span>
          <span>Bike Service</span>
        </a>
        <nav className="flex gap-4 flex-col mt-6 flex-[2]">
          {isLoggedIn ? (
            <>
              <div className="border-b pb-4">
                <div className="text-sm font-semibold mb-2 text-gray-500">
                  General
                </div>
                <a
                  className="block py-2 px-2 rounded hover:bg-gray-100"
                  href="/profile"
                >
                  Profile
                </a>
                <a
                  className="block py-2 px-2 rounded hover:bg-gray-100"
                  href="/bikes"
                >
                  My Bikes
                </a>
              </div>

              {userRole === "TECHNICIAN" && (
                <div className="border-b pb-4">
                  <div className="text-sm font-semibold mb-2 text-gray-500">
                    Technician
                  </div>
                  <a
                    className="block py-2 px-2 rounded hover:bg-gray-100"
                    href="/dashboard/technician"
                  >
                    Dashboard
                  </a>
                  <a
                    className="block py-2 px-2 rounded hover:bg-gray-100"
                    href="/reservations/manage"
                  >
                    Manage Reservations
                  </a>
                  <a
                    className="block py-2 px-2 rounded hover:bg-gray-100"
                    href="/services"
                  >
                    Services
                  </a>
                </div>
              )}

              {userRole === "CUSTOMER" && (
                <div className="border-b pb-4">
                  <div className="text-sm font-semibold mb-2 text-gray-500">
                    Customer
                  </div>
                  <a
                    className="block py-2 px-2 rounded hover:bg-gray-100"
                    href="/dashboard/customer"
                  >
                    Dashboard
                  </a>
                  <a
                    className="block py-2 px-2 rounded hover:bg-gray-100"
                    href="/reservations/create"
                  >
                    Book Service
                  </a>
                  <a
                    className="block py-2 px-2 rounded hover:bg-gray-100"
                    href="/reservations"
                  >
                    My Reservations
                  </a>
                </div>
              )}

              <div className="mt-auto">
                <div className="text-sm mb-2">
                  Signed in as <strong>{userName}</strong>
                </div>
                <a href="/logout">
                  <Button className="w-full">Logout</Button>
                </a>
              </div>
            </>
          ) : (
            <div className="mt-auto flex flex-col gap-4 w-full">
              <a href="/login">
                <Button
                  className="justify-self-end px-2 py-1 w-full"
                  variant="outline"
                >
                  Login
                </Button>
              </a>
              <a href="/signup">
                <Button className="justify-self-end px-2 py-1 w-full">
                  Sign Up
                </Button>
              </a>
            </div>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
};

export default SheetWrapper;
