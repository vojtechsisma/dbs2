import { Button } from "../ui/button";
import { Sheet, SheetTrigger, SheetContent } from "../ui/sheet";

interface Props {
  email: string;
}

const SheetWrapper = ({ email }: Props) => {
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
          <span className="text-5xl">📝</span>
          <span>Blog</span>
        </a>
        <nav className="flex gap-2 flex-col flex-[2]">
          {email ? (
            <>
              <a
                className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-gray-100/50 data-[state=open]:bg-gray-100/50 dark:bg-gray-950 dark:hover:bg-gray-800 dark:hover:text-gray-50 dark:focus:bg-gray-800 dark:focus:text-gray-50 dark:data-[active]:bg-gray-800/50 dark:data-[state=open]:bg-gray-800/50"
                href="/create"
              >
                Create Post
              </a>
              <a
                className="group underline inline-flex h-9 w-max items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-gray-100/50 data-[state=open]:bg-gray-100/50 dark:bg-gray-950 dark:hover:bg-gray-800 dark:hover:text-gray-50 dark:focus:bg-gray-800 dark:focus:text-gray-50 dark:data-[active]:bg-gray-800/50 dark:data-[state=open]:bg-gray-800/50"
                href="/profile"
              >
                {email}
              </a>
            </>
          ) : (
            <div className="mt-auto flex flex-col gap-4 w-full">
              <a href="/login">
                <Button
                  className="justify-self-end px-2 py-1 text-xs w-full"
                  variant="outline"
                >
                  Sign in
                </Button>
              </a>
              <a href="/signup">
                <Button className="justify-self-end px-2 py-1 text-xs w-full">
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
